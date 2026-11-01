
from django.contrib import admin
from .models import Department, AcademicProgramme, Lecturer, Student, Enrolment


# 1. Department administration
@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('department_code', 'department_name', 'created_at')
    search_fields = ('department_code', 'department_name')
    ordering = ('department_name',)


# 2. Academic programme administration
@admin.register(AcademicProgramme)
class AcademicProgrammeAdmin(admin.ModelAdmin):
    list_display = ('programme_code', 'programme_name', 'department', 'duration_years')
    list_filter = ('department', 'duration_years')
    search_fields = ('programme_code', 'programme_name')
    ordering = ('programme_name',)


# 3. Lecturer administration
@admin.register(Lecturer)
class LecturerAdmin(admin.ModelAdmin):
    list_display = ('lecturer_id', 'first_name', 'last_name', 'email', 'department', 'designation', 'is_active')
    list_filter = ('department', 'designation', 'is_active')
    search_fields = ('lecturer_id', 'first_name', 'last_name', 'email')
    ordering = ('last_name',)


# 4. Student administration
@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('student_id', 'first_name', 'last_name', 'email', 'admission_date', 'is_active')
    list_filter = ('gender', 'is_active', 'admission_date')
    search_fields = ('student_id', 'first_name', 'last_name', 'email')
    ordering = ('last_name',)


# 5. Enrolment administration
@admin.register(Enrolment)
class EnrolmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'programme', 'academic_year', 'semester', 'year_of_study', 'status')
    list_filter = ('academic_year', 'semester', 'year_of_study', 'status')
    search_fields = ('student__student_id', 'student__first_name', 'student__last_name', 'programme__programme_name')
    ordering = ('-academic_year', 'semester')
