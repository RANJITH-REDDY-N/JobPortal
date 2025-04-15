# JobMatrix/urls.py

from django.urls import path
from JobMatrix.views.views import *

from JobMatrix.views.admin_dashboard import AdminDashboardCountsView
from JobMatrix.views.admin_actions import (
    AdminUserDeleteView,
    AdminCompanyListView,
    AdminCompanyDeleteView,
    AdminJobDeleteView
)


urlpatterns = [
    # Auth & User
    path("login/", LoginView.as_view(), name="login"),
    path("users/create/", UserCreateView.as_view(), name="create-user"),
    path("users/get/", UserRetrieveView.as_view(), name="get-users"),
    path("admin/users/all/", UserListView.as_view(), name="get-all-users-for-admin"),
    path("users/update/<int:pk>/", UserUpdateView.as_view(), name="update-user"),
    path("users/patch/<int:pk>/", UserPartialUpdateView.as_view(), name="patch-user"),
    path("users/resume-update/", ApplicantResumeUpdateView.as_view(), name="update-applicant-resume"),
    path("users/recruiter-update/", RecruiterDetailsUpdateView.as_view(), name="recruiter-details-update"),

    # Company
    path('companies/', CompanyListView.as_view(), name='company-list'),
    path('company-jobs/', CompanyJobsListView.as_view(), name='company-jobs-list'),
    path('company/update/', CompanyUpdateView.as_view(), name='company-update'),


    # Admin Dashboard
    path('admin/dashboard-insights/', AdminDashboardCountsView.as_view(), name='admin-dashboard-insights'),

    # Admin User Management
    # path('admin/users/', AdminUserListView.as_view(), name='admin-users'),
    path('admin/users/<int:user_id>/delete/', AdminUserDeleteView.as_view(), name='admin-user-delete'),

    # Admin Company Management
    path('admin/companies/', AdminCompanyListView.as_view(), name='admin-companies'),
    path('admin/companies/<int:company_id>/delete/', AdminCompanyDeleteView.as_view(), name='admin-company-delete'),

    # Admin Job Management
    path('admin/jobs/<int:job_id>/delete/', AdminJobDeleteView.as_view(), name='admin-job-delete'),
]
