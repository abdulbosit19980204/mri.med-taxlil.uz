from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Analysis, Dataset, SystemSettings, TrainingSession

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'name', 'role', 'is_staff', 'is_active')
    search_fields = ('email', 'name')
    ordering = ('email',)
    
    # Override fieldsets to remove 'username'
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('name', 'first_name', 'last_name', 'role')}),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    # Override add_fieldsets for user creation
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password', 'name', 'role', 'is_staff', 'is_active'),
        }),
    )

@admin.register(Analysis)
class AnalysisAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'type', 'status', 'created_at')
    list_filter = ('status', 'type', 'created_at')
    search_fields = ('user__email', 'type')
    readonly_fields = ('id', 'created_at', 'updated_at')

@admin.register(Dataset)
class DatasetAdmin(admin.ModelAdmin):
    list_display = ('name', 'uploaded_by', 'created_at')
    search_fields = ('name', 'uploaded_by__email')
    readonly_fields = ('created_at',)

@admin.register(SystemSettings)
class SystemSettingsAdmin(admin.ModelAdmin):
    def has_add_permission(self, request):
        # Only allow adding if no instance exists
        return not SystemSettings.objects.exists()

@admin.register(TrainingSession)
class TrainingSessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'status', 'accuracy', 'val_accuracy', 'total_samples', 'epochs', 'started_at', 'completed_at')
    list_filter = ('status', 'started_at')
    readonly_fields = ('started_at', 'completed_at')
    search_fields = ('id',)
