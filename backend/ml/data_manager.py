import kagglehub
import os
import shutil

class DatasetManager:
    """
    Manages the downloading and preparation of Kaggle datasets for training.
    """
    
    def __init__(self, base_dir=None):
        self.base_dir = base_dir or os.path.join(os.path.dirname(__file__), 'data')
        if not os.path.exists(self.base_dir):
            os.makedirs(self.base_dir)

    def download_all(self):
        """
        Downloads all active datasets from Kaggle.
        """
        from api.models import Dataset
        datasets = Dataset.objects.filter(status='READY')
        paths = []
        
        # Hardcoded default if none exist yet, to give the user a start
        # navoneel/brain-mri-images-for-brain-tumor-detection
        default_handle = "navoneel/brain-mri-images-for-brain-tumor-detection"
        
        if not datasets.exists():
            print(f"No datasets in DB. Downloading default: {default_handle}")
            try:
                path = self.download_handle(default_handle)
                paths.append(path)
            except: pass
        else:
            for ds in datasets:
                if 'Kaggle: ' in ds.name:
                    # Attempt to extract handle from description or name
                    # In this template, we'll try to sync the default if it looks like we need it
                    # Real implementation would store handle in a field
                    handle = ds.description.replace('Auto-downloaded from Kaggle: ', '')
                    try:
                        path = self.download_handle(handle)
                        paths.append(path)
                    except: pass
        
        return paths

    def download_handle(self, handle):
        """
        Downloads a specific dataset handle from Kaggle.
        """
        # Setup Django
        import django
        from django.conf import settings
        if not settings.configured:
            os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
            django.setup()
        
        from api.models import Dataset, User
        
        # Get or create a system user for Kaggle datasets
        system_user, _ = User.objects.get_or_create(
            email='system@kaggle.auto',
            defaults={'role': 'ADMIN', 'name': 'Kaggle System'}
        )
        
        try:
            print(f"Starting download of {handle}...")
            
            # Create or get existing dataset record
            dataset_name = handle.split('/')[-1].replace('-', ' ').title()
            dataset, created = Dataset.objects.get_or_create(
                name=f"Kaggle: {dataset_name}",
                defaults={
                    'uploaded_by': system_user,
                    'description': f'Auto-downloaded from Kaggle: {handle}',
                    'status': 'PROCESSING',
                    'processing_progress': 0
                }
            )
            
            # Update status
            dataset.status = 'PROCESSING'
            dataset.processing_log = f"Initiating sync from Kaggle: {handle}...\n"
            dataset.save()
            
            # Download
            path = kagglehub.dataset_download(handle)
            print(f"Successfully downloaded {handle} to {path}")
            
            # Count files
            import glob
            all_files = glob.glob(os.path.join(path, '**/*'), recursive=True)
            files = [f for f in all_files if os.path.isfile(f)]
            
            file_types = {}
            for f in files:
                ext = os.path.splitext(f)[1].lower().replace('.', '') or 'other'
                file_types[ext] = file_types.get(ext, 0) + 1
            
            # Update dataset
            dataset.total_files = len(files)
            dataset.processed_files = len(files)
            dataset.file_types = file_types
            dataset.processing_progress = 100
            dataset.status = 'READY'
            dataset.processing_log += f"Sync successful!\nTotal files: {len(files)}\nFile types: {file_types}\nLocation: {path}\n"
            dataset.save()
            
            return path
            
        except Exception as e:
            print(f"Failed to download {handle}: {e}")
            if 'dataset' in locals():
                dataset.status = 'FAILED'
                dataset.error_message = str(e)
                dataset.processing_log += f"ERROR: {str(e)}\n"
                dataset.save()
            raise e

    def get_merged_data_path(self):
        # Implementation to merge/normalize data structure
        pass
