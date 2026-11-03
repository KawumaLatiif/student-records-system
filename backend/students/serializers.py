
from rest_framework import serializers
from .models import (
    Department,
    AcademicProgramme,
    Lecturer,
    Student,
    Enrolment,
)


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = "__all__"


class AcademicProgrammeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicProgramme
        fields = "__all__"


class LecturerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lecturer
        fields = "__all__"


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = "__all__"


class EnrolmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrolment
        fields = "__all__"

    def validate(self, attrs):
        # Get submitted values, or retain existing values during an update.
        student = attrs.get(
            "student",
            self.instance.student if self.instance else None
        )

        academic_year = attrs.get(
            "academic_year",
            self.instance.academic_year if self.instance else None
        )

        # Check whether this student already has an enrolment this year.
        duplicate = Enrolment.objects.filter(
            student=student,
            academic_year=academic_year
        )

        # Exclude the current record when editing an enrolment.
        if self.instance:
            duplicate = duplicate.exclude(pk=self.instance.pk)

        if duplicate.exists():
            raise serializers.ValidationError({
                "academic_year": (
                    "This student is already enrolled in a programme "
                    "for the selected academic year."
                )
            })

        return attrs
