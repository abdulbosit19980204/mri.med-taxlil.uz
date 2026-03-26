from rest_framework import viewsets, permissions, status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import User, Analysis, Dataset, SystemSettings, ChatMessage
from .serializers import UserSerializer, AnalysisSerializer, DatasetSerializer
from django.conf import settings
from django.db import models
import threading
import time
import random

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserSerializer

class DatasetViewSet(viewsets.ModelViewSet):
    serializer_class = DatasetSerializer
    queryset = Dataset.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users can see their own datasets + system datasets, admins can see all
        if self.request.user.role == 'ADMIN':
            return self.queryset
        return self.queryset.filter(
            models.Q(uploaded_by=self.request.user) | 
            models.Q(uploaded_by__email='system@kaggle.auto')
        )

    def perform_create(self, serializer):
        dataset = serializer.save(uploaded_by=self.request.user, status='PROCESSING', processing_progress=0)
        
        # Simulate async processing (in real app, use Celery or background task)
        def process_dataset():
            import time
            import random
            try:
                # Simulate file analysis
                dataset.processing_log = "Starting dataset analysis...\n"
                dataset.save()
                time.sleep(1)
                
                # Simulate file counting
                total = random.randint(50, 500)
                dataset.total_files = total
                dataset.file_types = {"dcm": int(total * 0.7), "nii": int(total * 0.2), "png": int(total * 0.1)}
                dataset.processing_log += f"Found {total} files: {dataset.file_types}\n"
                dataset.processing_progress = 10
                dataset.save()
                time.sleep(1)
                
                # Simulate processing files
                for i in range(0, total, max(1, total // 5)):
                    dataset.processed_files = min(i + total // 5, total)
                    dataset.processing_progress = int((dataset.processed_files / total) * 90) + 10
                    dataset.processing_log += f"Processed {dataset.processed_files}/{total} files...\n"
                    dataset.save()
                    time.sleep(1)
                
                # Complete
                dataset.processed_files = total
                dataset.processing_progress = 100
                dataset.status = 'READY'
                dataset.processing_log += "Processing complete! Dataset ready for training.\n"
                dataset.save()
            except Exception as e:
                dataset.status = 'FAILED'
                dataset.error_message = str(e)
                dataset.processing_log += f"ERROR: {str(e)}\n"
                dataset.save()
        
        import threading
        threading.Thread(target=process_dataset).start()

    @action(detail=False, methods=['post'])
    def sync_kaggle(self, request):
        """
        Manually trigger a Kaggle dataset download by handle.
        """
        handle = request.data.get('handle')
        if not handle:
            return Response({'error': 'No Kaggle handle provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        def run_sync():
            from ml.data_manager import DatasetManager
            try:
                manager = DatasetManager()
                manager.download_handle(handle)
            except Exception as e:
                print(f"Kaggle sync error: {e}")
        
        threading.Thread(target=run_sync).start()
        return Response({'message': f'Sync started for {handle}'}, status=status.HTTP_202_ACCEPTED)

    @action(detail=False, methods=['post'])
    def train(self, request):
        """
        Trigger an AI training session in the background.
        """
        from ml.train_engine import BrainTumorTrainer
        
        def run_training():
            try:
                trainer = BrainTumorTrainer()
                trainer.train()
            except Exception as e:
                print(f"Training trigger error: {e}")
        
        threading.Thread(target=run_training).start()
        return Response({
            'message': 'AI training session initiated. Monitor progress in the dashboard.',
            'status': 'RUNNING'
        }, status=status.HTTP_202_ACCEPTED)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Return comprehensive ML stats.
        """
        import os
        import json
        
        # 1. Local Data (Kaggle)
        ml_data_dir = os.path.join(settings.BASE_DIR, 'ml', 'data')
        local_file_count = 0
        local_size_bytes = 0
        if os.path.exists(ml_data_dir):
            for root, dirs, files in os.walk(ml_data_dir):
                local_file_count += len(files)
                for f in files:
                    try:
                        local_size_bytes += os.path.getsize(os.path.join(root, f))
                    except: pass

        # 2. DB Datasets
        db_datasets = Dataset.objects.filter(status='READY')
        active_list = list(db_datasets.values('id', 'name', 'description', 'total_files'))

        # 3. Training Stats
        train_stats = {}
        stats_path = os.path.join(settings.BASE_DIR, 'ml', 'training_stats.json')
        if os.path.exists(stats_path):
            try:
                with open(stats_path, 'r') as f:
                    train_stats = json.load(f)
            except: pass
        
        # Fallback to latest TrainingSession if file not found
        if not train_stats:
            from .models import TrainingSession
            latest_session = TrainingSession.objects.filter(status='COMPLETED').order_by('-completed_at').first()
            if latest_session:
                train_stats = {
                    "last_trained": latest_session.completed_at.strftime("%Y-%m-%d %H:%M:%S"),
                    "accuracy": latest_session.accuracy,
                    "val_accuracy": latest_session.val_accuracy,
                    "total_samples": latest_session.total_samples
                }
            else:
                # Absolute fallback for fresh installs
                train_stats = {
                    "last_trained": "Pending",
                    "accuracy": 0.0,
                    "total_samples": 0
                }
            
        return Response({
            "local_datasets": {
                "file_count": local_file_count,
                "size_mb": round(local_size_bytes / (1024 * 1024), 2),
                "path": str(ml_data_dir)
            },
            "db_datasets": {
                "count": db_datasets.count(),
                "active": active_list
            },
            "training": train_stats
        })

    @action(detail=False, methods=['post'])
    def sync_kaggle(self, request):
        """
        Triggers the Kaggle dataset download process.
        """
        from ml.data_manager import DatasetManager
        def run_sync():
            manager = DatasetManager()
            manager.download_all()
        
        threading.Thread(target=run_sync).start()
        return Response({"status": "Synchronization started in background"}, status=status.HTTP_202_ACCEPTED)

class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        from .serializers import UserSerializer
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class AnalysisViewSet(viewsets.ModelViewSet):
    serializer_class = AnalysisSerializer
    queryset = Analysis.objects.all()
    # Allow read-only access for unauthenticated, or adjust as needed for strict privacy
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    search_fields = ['patient_name', 'type', 'scan_type']
    ordering_fields = ['created_at', 'status']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = self.queryset
        if self.request.user.is_authenticated:
            queryset = queryset.filter(user=self.request.user)
        else:
            return Analysis.objects.none()
        
        status_filter = self.request.query_params.get('status')
        if status_filter and status_filter != 'all':
            queryset = queryset.filter(status=status_filter.upper())
            
        return queryset

    def perform_create(self, serializer):
        # Determine analysis status
        analysis = serializer.save(user=self.request.user, status='PROCESSING')
        
        # Offload processing to background thread (conceptually queue in Celery/Redis)
        threading.Thread(target=self._process_analysis, args=(analysis.id, analysis.file.path)).start()

    def _process_analysis(self, analysis_id, file_path):
        from .ai_engine import ai_engine
        import os
        import zipfile
        import shutil
        import tempfile
        from PIL import Image
        from django.core.files.base import ContentFile
        from io import BytesIO
        
        try:
            analysis = Analysis.objects.get(id=analysis_id)
            target_process_path = file_path
            temp_dir = None
            
            # 1. Handle ZIP Archives
            if file_path.lower().endswith('.zip'):
                temp_dir = tempfile.mkdtemp()
                try:
                    with zipfile.ZipFile(file_path, 'r') as zip_ref:
                        zip_ref.extractall(temp_dir)
                    
                    # Find all DICOM files
                    dcm_files = []
                    for root, dirs, files in os.walk(temp_dir):
                        for f in files:
                            if f.lower().endswith('.dcm'):
                                dcm_files.append(os.path.join(root, f))
                    
                    if dcm_files:
                        # Select the middle frame as representative
                        dcm_files.sort()
                        target_process_path = dcm_files[len(dcm_files) // 2]
                        print(f"ZIP detected with {len(dcm_files)} series. Selecting {os.path.basename(target_process_path)}")
                    else:
                        print("No DICOM files found in ZIP.")
                except Exception as e:
                    print(f"ZIP Extraction error: {e}")

            # 2. Process DICOM (either single or from ZIP)
            dicom_metadata = {}
            if target_process_path.lower().endswith('.dcm'):
                try:
                    import pydicom
                    import numpy as np
                    
                    ds = pydicom.dcmread(target_process_path)
                    
                    # Deep Metadata Extraction Helper
                    def get_json_safe_value(elem):
                        if elem.VR == "SQ": # Sequence
                            return [ {tag.name: get_json_safe_value(tag) for tag in item} for item in elem.value]
                        if elem.VR == "OB" or elem.VR == "OW" or elem.VR == "OF": # Binary/Data
                            return f"<Binary Data {len(elem.value)} bytes>"
                        val = elem.value
                        if isinstance(val, (list, tuple)):
                            return [str(v) for v in val]
                        return str(val)

                    # Initialize categorized collections
                    full_metadata = {
                        "Patient": {},
                        "Study": {},
                        "Series": {},
                        "Equipment": {},
                        "Image": {},
                        "Other": {}
                    }

                    # Iterate all tags
                    for elem in ds.iterall():
                        try:
                            # Skip pixel data and empty tags
                            if elem.tag == (0x7fe0, 0x0010) or elem.value is None:
                                continue
                            
                            key = elem.name
                            val = get_json_safe_value(elem)
                            
                            # Simple categorization logic based on common group IDs
                            group = elem.tag.group
                            if group == 0x0010: full_metadata["Patient"][key] = val
                            elif group == 0x0008: full_metadata["Study"][key] = val
                            elif group == 0x0020: full_metadata["Series"][key] = val
                            elif group == 0x0018: full_metadata["Equipment"][key] = val
                            elif group == 0x0028: full_metadata["Image"][key] = val
                            else: full_metadata["Other"][key] = val
                        except:
                            continue

                    # Overwrite old structure with rich categorization
                    dicom_metadata = full_metadata

                    pixel_array = ds.pixel_array
                    
                    # Handle multi-frame (3D) DICOM — pick the middle slice
                    if pixel_array.ndim == 3:
                        mid = pixel_array.shape[0] // 2
                        pixel_array = pixel_array[mid]
                        print(f"Multi-frame DICOM detected ({pixel_array.shape[0] if hasattr(pixel_array,'shape') else '?'} frames). Using middle slice at index {mid}.")
                    elif pixel_array.ndim > 3:
                        # 4-D edge case (e.g. RGB multi-frame) — flatten to 2-D
                        pixel_array = pixel_array[pixel_array.shape[0] // 2, :, :, 0]
                    
                    # Apply windowing if DICOM specifies it, for better contrast
                    try:
                        wc = float(getattr(ds, 'WindowCenter', None) or 0)
                        ww = float(getattr(ds, 'WindowWidth', None) or 0)
                        if ww > 0:
                            low = wc - ww / 2
                            high = wc + ww / 2
                            pixel_array = np.clip(pixel_array, low, high)
                    except Exception:
                        pass  # Fall back to simple normalization

                    # Normalize to uint8 (0–255)
                    pmin, pmax = pixel_array.min(), pixel_array.max()
                    if pmax > pmin:
                        pixel_array = ((pixel_array - pmin) / (pmax - pmin) * 255).astype(np.uint8)
                    else:
                        pixel_array = np.zeros_like(pixel_array, dtype=np.uint8)

                    # Convert grayscale to RGB for wider browser compatibility
                    img = Image.fromarray(pixel_array, mode='L').convert('RGB')
                    
                    # Save to preview_image field
                    buffer = BytesIO()
                    img.save(buffer, format="PNG")
                    preview_name = os.path.basename(file_path).split('.')[0] + "_preview.png"
                    analysis.preview_image.save(preview_name, ContentFile(buffer.getvalue()), save=False)
                    
                    # Proactively fill patient metadata from DICOM if empty
                    try:
                        if not analysis.patient_name:
                            p_name = ds.get('PatientName', '')
                            if p_name: analysis.patient_name = str(p_name).replace('^', ' ')
                        
                        if not analysis.patient_age:
                            p_age = ds.get('PatientAge', '')
                            if p_age: analysis.patient_age = str(p_age)
                        
                        if not analysis.patient_gender:
                            p_sex = ds.get('PatientSex', '')
                            if p_sex: analysis.patient_gender = "Male" if str(p_sex) == "M" else ("Female" if str(p_sex) == "F" else str(p_sex))
                            
                        if not analysis.scan_type:
                            modality = ds.get('Modality', '')
                            if modality: analysis.scan_type = str(modality)
                    except Exception as meta_err:
                        print(f"Metadata harvest error: {meta_err}")

                    print(f"Generated preview and extracted metadata for: {preview_name}")
                except Exception as e:
                    print(f"Failed to process DICOM: {e}")

            # 3. Call our AI Engine
            ai_result = ai_engine.analyze_image(target_process_path)
            
            # 4. Merge results
            final_result = {
                "ai_analysis": ai_result,
                "dicom_metadata": dicom_metadata,
                "is_dicom": target_process_path.lower().endswith('.dcm'),
                "file_path": analysis.file.url
            }

            # Update record
            analysis.status = 'COMPLETED'
            analysis.result = final_result
            analysis.save()
            print(f"Analysis {analysis_id} completed with full metadata.")
            
            # 4. Cleanup
            if temp_dir and os.path.exists(temp_dir):
                shutil.rmtree(temp_dir)
                
        except Exception as e:
            print(f"Error in AI processing: {e}")
            try:
                analysis = Analysis.objects.get(id=analysis_id)
                analysis.status = 'FAILED'
                analysis.save()
            except:
                pass
            if temp_dir and os.path.exists(temp_dir):
                shutil.rmtree(temp_dir)

    @action(detail=True, methods=['post'])
    def chat(self, request, pk=None):
        """
        AI chat endpoint for asking questions about an analysis.
        Uses persistent ChatMessage storage.
        """
        from .ai_engine import ai_engine
        
        analysis = self.get_object()
        
        # Ensure user has access to this analysis
        if analysis.user != request.user:
            return Response(
                {"error": "You don't have permission to chat about this analysis"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        user_message = request.data.get('message', '')
        
        # Load existing history from DB
        db_history = ChatMessage.objects.filter(analysis=analysis).order_by('created_at')
        conversation_history = [{'role': msg.role, 'content': msg.content} for msg in db_history]
        
        if not user_message:
            # Just return history if no message (for initialization)
            return Response({
                "response": "Chat history loaded.",
                "history": conversation_history
            }, status=status.HTTP_200_OK)
        
        try:
            # Save user message
            ChatMessage.objects.create(
                analysis=analysis,
                user=request.user,
                role='user',
                content=user_message
            )
            
            # Get AI response
            result = ai_engine.chat_with_analysis(
                analysis=analysis,
                user_message=user_message,
                conversation_history=conversation_history
            )
            
            # Save AI response
            if not result.get('error'):
                ChatMessage.objects.create(
                    analysis=analysis,
                    user=request.user, # AI acts on behalf of system/user context
                    role='assistant',
                    content=result['response']
                )
            
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Chat Error: {e}")
            return Response(
                {"error": str(e), "response": "An error occurred while processing your question."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
