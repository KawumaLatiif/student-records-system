
from rest_framework import viewsets

from .models import Department, AcademicProgramme, Lecturer, Student, Enrolment
from .serializers import (
    DepartmentSerializer,
    AcademicProgrammeSerializer,
    LecturerSerializer,
    StudentSerializer,
    EnrolmentSerializer,
)


# 1. Department API
class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer


# 2. Academic programme API
class AcademicProgrammeViewSet(viewsets.ModelViewSet):
    queryset = AcademicProgramme.objects.all()
    serializer_class = AcademicProgrammeSerializer


# 3. Lecturer API
class LecturerViewSet(viewsets.ModelViewSet):
    queryset = Lecturer.objects.all()
    serializer_class = LecturerSerializer


# 4. Student API
class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer


# 5. Enrolment API
class EnrolmentViewSet(viewsets.ModelViewSet):
    queryset = Enrolment.objects.all()
    serializer_class = EnrolmentSerializer
