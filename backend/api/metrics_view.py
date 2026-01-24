from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from .models import Dataset, TrainingSession
from django.db.models import Sum, Count

class MetricsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # 1. Sessions History
        sessions = TrainingSession.objects.all().values(
            'id', 'status', 'accuracy', 'val_accuracy', 'total_samples', 'epochs', 'started_at', 'completed_at', 'model_size_mb'
        )

        # 2. Datasets Distribution & Details
        datasets = Dataset.objects.filter(status='READY')
        total_files = datasets.aggregate(Sum('total_files'))['total_files__sum'] or 0
        
        active_datasets_list = datasets.values('id', 'name', 'description', 'total_files', 'file_types', 'created_at')
        
        # Aggregate file types
        type_distribution = {}
        for ds in datasets:
            if ds.file_types:
                for ftype, count in ds.file_types.items():
                    type_distribution[ftype] = type_distribution.get(ftype, 0) + count

        # 3. Overall Statistics
        last_session = TrainingSession.objects.filter(status='COMPLETED').first()
        
        return Response({
            "sessions": list(sessions),
            "datasets_summary": {
                "total_files": total_files,
                "type_distribution": type_distribution,
                "dataset_count": datasets.count(),
                "active_datasets": list(active_datasets_list)
            },
            "overall": {
                "last_accuracy": last_session.accuracy if last_session else 0,
                "last_val_accuracy": last_session.val_accuracy if last_session else 0,
                "total_trained_sessions": TrainingSession.objects.filter(status='COMPLETED').count()
            }
        })
