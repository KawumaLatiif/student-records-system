
from rest_framework.routers import DefaultRouter

from .views import (
    DepartmentViewSet,
    AcademicProgrammeViewSet,
    LecturerViewSet,
    StudentViewSet,
    EnrolmentViewSet,
)


router = DefaultRouter()

router.register("departments", DepartmentViewSet)
router.register("programmes", AcademicProgrammeViewSet)
router.register("lecturers", LecturerViewSet)
router.register("students", StudentViewSet)
router.register("enrolments", EnrolmentViewSet)

urlpatterns = router.urls
