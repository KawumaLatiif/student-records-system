
from rest_framework import viewsets, status
from django.db.models.deletion import ProtectedError
from rest_framework.response import Response

from .models import (
    Department,
    AcademicProgramme,
    Lecturer,
    Student,
    Enrolment,
)

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

    def destroy(self, request, *args, **kwargs):
        student = self.get_object()

        try:
            student.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

        except ProtectedError:
            return Response(
                {
                    "detail": (
                        "This student cannot be deleted because "
                        "they have existing enrolment records. "
                        "Preserve the academic records or remove "
                        "the enrolments first."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


# 5. Enrolment API
class EnrolmentViewSet(viewsets.ModelViewSet):
    queryset = Enrolment.objects.select_related(
        "student",
        "programme",
        "programme__department",
    ).all()

    serializer_class = EnrolmentSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        student_id = self.request.query_params.get("student")

        if student_id:
            queryset = queryset.filter(student_id=student_id)

        return queryset
