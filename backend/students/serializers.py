
from rest_framework import serializers
from .models import Department, AcademicProgramme, Lecturer, Student, Enrolment


# 1. Department serializer
class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = "__all__"


# 2. Academic programme serializer
class AcademicProgrammeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicProgramme
        fields = "__all__"


# 3. Lecturer serializer
class LecturerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lecturer
        fields = "__all__"


# 4. Student serializer
class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = "__all__"


# 5. Enrolment serializer
class EnrolmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrolment
        fields = "__all__"
