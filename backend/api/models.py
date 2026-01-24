from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
import uuid

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    username = None
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255, blank=True, null=True)
    role = models.CharField(max_length=20, default='PATIENT', choices=[
        ('PATIENT', 'Patient'),
        ('DOCTOR', 'Doctor'),
        ('ADMIN', 'Admin'),
    ])
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.email

class Analysis(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='analyses')
    type = models.CharField(max_length=50) # BRAIN, SPINE, etc.
    status = models.CharField(max_length=20, default='PENDING', choices=[
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ])
    file = models.FileField(upload_to='mri_uploads/%Y/%m/%d/')
    preview_image = models.ImageField(upload_to='mri_previews/%Y/%m/%d/', null=True, blank=True)
    
    # Patient Data (Persistence for Clinician Input)
    patient_name = models.CharField(max_length=255, blank=True, null=True)
    patient_age = models.CharField(max_length=20, blank=True, null=True)
    patient_gender = models.CharField(max_length=20, blank=True, null=True)
    scan_type = models.CharField(max_length=50, blank=True, null=True) # BRAIN, SPINE, etc.
    
    result = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} - {self.type} ({self.status})"

class Dataset(models.Model):
    STATUS_CHOICES = [
        ('UPLOADING', 'Uploading'),
        ('PROCESSING', 'Processing'),
        ('READY', 'Ready'),
        ('FAILED', 'Failed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    file = models.FileField(upload_to='datasets/%Y/%m/%d/')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='datasets')
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Processing status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='UPLOADING')
    processing_progress = models.IntegerField(default=0)  # 0-100
    error_message = models.TextField(blank=True, null=True)
    
    # Detailed processing info
    total_files = models.IntegerField(default=0)
    processed_files = models.IntegerField(default=0)
    file_types = models.JSONField(default=dict, blank=True)  # {"dcm": 150, "nii": 50}
    processing_log = models.TextField(blank=True, null=True)  # Real-time log

    def __str__(self):
        return self.name

class SystemSettings(models.Model):
    """
    Singleton model to store system-wide settings like API keys.
    """
    gemini_api_key = models.CharField(max_length=255, blank=True, null=True, help_text="Google Gemini API Key for AI Analysis")
    
    class Meta:
        verbose_name = "System Settings"
        verbose_name_plural = "System Settings"

    def save(self, *args, **kwargs):
        if not self.pk and SystemSettings.objects.exists():
            # If you're trying to save a new instance, set the PK to the existing one
            self.pk = SystemSettings.objects.first().pk
        return super(SystemSettings, self).save(*args, **kwargs)

    def __str__(self):
        return "System Configuration"

class TrainingSession(models.Model):
    """
    Tracks ML model training sessions.
    """
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('RUNNING', 'Running'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ]
    
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    
    # Training metrics
    total_samples = models.IntegerField(default=0)
    epochs = models.IntegerField(default=0)
    accuracy = models.FloatField(null=True, blank=True)
    val_accuracy = models.FloatField(null=True, blank=True)
    model_size_mb = models.FloatField(null=True, blank=True)
    
    # Progress tracking fields
    current_stage = models.CharField(max_length=100, default='PENDING') # SYNCING, PREPROCESSING, TRAINING, SAVING
    current_epoch = models.IntegerField(default=0)
    total_epochs = models.IntegerField(default=0)
    progress_percent = models.IntegerField(default=0)

    # Logs
    log_output = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-started_at']
    
    def __str__(self):
        return f"Training {self.id} - {self.status} ({self.started_at.strftime('%Y-%m-%d %H:%M')})"
