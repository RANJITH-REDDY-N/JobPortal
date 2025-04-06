from django.urls import path
from JobMatrix.views import *

urlpatterns = [
    path("login/", LoginView.as_view(), name="login"),
    path("users/create/", UserCreateView.as_view(), name="create-user"),
    path("users/get/", UserRetrieveView.as_view(), name="get-users"),
    path("users/all/", UserListView.as_view(), name="get-all-users"),
    path("users/update/<int:pk>/", UserUpdateView.as_view(), name="update-user"),
    path("users/patch/<int:pk>/", UserPartialUpdateView.as_view(), name="patch-user"),
    path("users/resume-update/", ApplicantResumeUpdateView.as_view(), name="update-applicant-resume"),
    path("users/recruiter-update/", RecruiterDetailsUpdateView.as_view(), name="recruiter-details-update"),
    path('companies/', CompanyListView.as_view(), name='company-list'),
    path('company-jobs/', CompanyJobsListView.as_view(), name='company-jobs-list'),
    

]
