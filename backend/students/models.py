
"""
Student Records Management System
Database models for departments, programmes, lecturers, students and enrolments.
"""

from django.db import models


# 1. Department model
class Department(models.Model):
    department_code = models.CharField(max_length=20, unique=True)
    department_name = models.CharField(max_length=150, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.department_name


# 2. Academic programme model
class AcademicProgramme(models.Model):
    # Each programme belongs to one department; PROTECT prevents accidental deletion.
    department = models.ForeignKey(
        Department,
        on_delete=models.PROTECT,
        related_name='programmes'
    )
    programme_code = models.CharField(max_length=20, unique=True)
    programme_name = models.CharField(max_length=200)
    duration_years = models.PositiveSmallIntegerField()
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.programme_name


# 3. Lecturer model
class Lecturer(models.Model):
    lecturer_id = models.CharField(max_length=30, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, blank=True)

    # Each lecturer is assigned to one department.
    department = models.ForeignKey(
        Department,
        on_delete=models.PROTECT,
        related_name='lecturers'
    )

    designation = models.CharField(max_length=100, blank=True)
    date_joined = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.lecturer_id})"


# 4. Student model
class Student(models.Model):
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]

    student_id = models.CharField(max_length=30, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, blank=True)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    address = models.TextField(blank=True)
    admission_date = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.student_id})"


# 5. Enrolment model
class Enrolment(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('COMPLETED', 'Completed'),
        ('SUSPENDED', 'Suspended'),
        ('WITHDRAWN', 'Withdrawn'),
    ]

    # Connects each enrolment to a student and an academic programme.
    student = models.ForeignKey(
        Student,
        on_delete=models.PROTECT,
        related_name='enrolments'
    )
    programme = models.ForeignKey(
        AcademicProgramme,
        on_delete=models.PROTECT,
        related_name='enrolments'
    )

    academic_year = models.CharField(max_length=9)
    semester = models.PositiveSmallIntegerField()
    year_of_study = models.PositiveSmallIntegerField()
    enrolment_date = models.DateField()
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='ACTIVE'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['student', 'programme', 'academic_year', 'semester'],
                name='unique_enrolment_period'
            )
        ]

    def __str__(self):
        return f"{self.student.student_id} - {self.programme.programme_code} ({self.academic_year})"
