import os
import tensorflow as tf
from tensorflow.keras import layers, models
from .data_manager import DatasetManager
import glob

class BrainTumorTrainer:
    """
    Handles the training of the CNN model using aggregated dataset paths.
    """
    
    def __init__(self, model_save_path='brain_tumor_model.h5'):
        self.model_save_path = model_save_path
        self.img_height = 256
        self.img_width = 256
        self.batch_size = 32

    def build_model(self):
        """
        Defines a standard CNN architecture for Medical Image Classification.
        """
        model = models.Sequential([
            layers.Rescaling(1./255, input_shape=(self.img_height, self.img_width, 3)),
            
            layers.Conv2D(32, (3, 3), activation='relu'),
            layers.MaxPooling2D(),
            
            layers.Conv2D(64, (3, 3), activation='relu'),
            layers.MaxPooling2D(),
            
            layers.Conv2D(128, (3, 3), activation='relu'),
            layers.MaxPooling2D(),
            
            layers.Flatten(),
            layers.Dense(128, activation='relu'),
            layers.Dropout(0.5),
            layers.Dense(4, activation='softmax') # Assuming 4 classes: Glioma, Meningioma, Pituitary, No Tumor
        ])
        
        model.compile(optimizer='adam',
                      loss='sparse_categorical_crossentropy',
                      metrics=['accuracy'])
        return model

    def load_data(self, dataset_paths):
        """
        Custom data loader to aggregate data from multiple Kaggle download paths.
        (Simplified logic: assumes standard folder structure inside datasets)
        """
        # In a real scenario, we would walk through `dataset_paths` and build a tf.data.Dataset
        # For this template, we return a placeholder or scan first valid path
        if not dataset_paths:
            raise ValueError("No datasets provided")
            
        print(f"Loading data from: {dataset_paths}")
        # Note: This requires the datasets to have compatible structures (e.g., train/test folders)
        # We will use the first valid directory for demonstration
        data_dir = dataset_paths[0] 
        
        train_ds = tf.keras.utils.image_dataset_from_directory(
            data_dir,
            validation_split=0.2,
            subset="training",
            seed=123,
            image_size=(self.img_height, self.img_width),
            batch_size=self.batch_size
        )
        
        val_ds = tf.keras.utils.image_dataset_from_directory(
            data_dir,
            validation_split=0.2,
            subset="validation",
            seed=123,
            image_size=(self.img_height, self.img_width),
            batch_size=self.batch_size
        )
        
        return train_ds, val_ds

    def train(self):
        """
        Orchestrates the training process.
        """
        # Import Django models
        import django
        import os
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
        django.setup()
        
        from api.models import TrainingSession
        from django.utils import timezone
        
        from api.models import TrainingSession
        from django.utils import timezone
        
        # Create training session record
        session = TrainingSession.objects.create(status='RUNNING', current_stage='INITIALIZING')
        
        class TrainingProgressCallback(tf.keras.callbacks.Callback):
            def on_epoch_end(self, epoch, logs=None):
                session.current_epoch = epoch + 1
                session.accuracy = logs.get('accuracy', 0)
                session.val_accuracy = logs.get('val_accuracy', 0)
                session.progress_percent = int(((epoch + 1) / self.params['epochs']) * 80) + 15
                session.save()
                print(f"Epoch {epoch+1} finished. Saved progress to DB.")

        try:
            session.current_stage = 'DATA_SYNC'
            session.progress_percent = 5
            session.save()
            
            print("Initializing Dataset Manager...")
            manager = DatasetManager()
            paths = manager.download_all()
            
            if not paths:
                print("No data found. Aborting training.")
                session.status = 'FAILED'
                session.log_output = "No datasets found"
                session.save()
                return

            session.current_stage = 'MODEL_BUILD'
            session.progress_percent = 10
            session.save()
            print("Building Model...")
            model = self.build_model()
            
            session.current_stage = 'PREPROCESSING'
            session.progress_percent = 15
            session.save()
            print("Loading Data...")
            try:
                train_ds, val_ds = self.load_data(paths)
                
                print("Starting Training...")
                epochs = 5
                session.current_stage = 'TRAINING'
                session.total_epochs = epochs
                session.save()
                
                history = model.fit(
                    train_ds,
                    validation_data=val_ds,
                    epochs=epochs,
                    callbacks=[TrainingProgressCallback()]
                )
                
                session.current_stage = 'SAVING'
                session.progress_percent = 95
                session.save()
                
                print(f"Saving model to {self.model_save_path}...")
                model.save(self.model_save_path)
                
                # Update session metrics final
                accuracy = history.history.get('accuracy', [0])[-1]
                val_accuracy = history.history.get('val_accuracy', [0])[-1]
                
                # Save Training Stats
                import json
                import time
                
                stats = {
                    "last_trained": time.strftime("%Y-%m-%d %H:%M:%S"),
                    "total_samples": 0,
                    "accuracy": float(accuracy),
                    "val_accuracy": float(val_accuracy),
                    "epochs": epochs,
                    "model_size_mb": os.path.getsize(self.model_save_path) / (1024 * 1024)
                }
                
                try:
                    stats["total_samples"] = int(tf.data.experimental.cardinality(train_ds).numpy() * self.batch_size)
                except: pass
                
                stats_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'ml', 'training_stats.json')
                with open(stats_path, 'w') as f:
                    json.dump(stats, f)
                
                # Finalize session
                session.status = 'COMPLETED'
                session.current_stage = 'FINISHED'
                session.progress_percent = 100
                session.completed_at = timezone.now()
                session.total_samples = stats["total_samples"]
                session.epochs = epochs
                session.accuracy = stats['accuracy']
                session.val_accuracy = stats['val_accuracy']
                session.model_size_mb = stats['model_size_mb']
                session.log_output = f"SUCCESS: Training completed. Final Accuracy: {stats['accuracy']:.4f}"
                session.save()
                    
                print("Training Complete & Stats Saved!")
                
            except Exception as e:
                print(f"Training internals failed: {e}")
                session.status = 'FAILED'
                session.completed_at = timezone.now()
                session.log_output = f"ENGINE_ERROR: {str(e)}"
                session.save()
                
        except Exception as e:
            print(f"Orchestration failed: {e}")
            session.status = 'FAILED'
            session.completed_at = timezone.now()
            session.log_output = f"SETUP_ERROR: {str(e)}"
            session.save()

if __name__ == "__main__":
    trainer = BrainTumorTrainer()
    trainer.train()
