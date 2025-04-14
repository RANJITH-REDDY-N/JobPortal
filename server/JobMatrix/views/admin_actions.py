from datetime import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from JobMatrix.models import User, Company, Job, Applicant, Recruiter, Application, Bookmark, Skill, WorkExperience, Education
from JobMatrix.auth_backend import JWTAuthentication
from JobMatrix.permissions import IsAdmin

class AdminUserDeleteView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdmin]

    def delete(self, request, user_id):
        try:
            user = get_object_or_404(User, user_id=user_id)

            # Delete related data if user is an applicant
            if user.user_role == 'APPLICANT':
                applicant = Applicant.objects.filter(applicant_id=user.user_id).first()
                if applicant:
                    Skill.objects.filter(applicant_id=applicant).delete()
                    Education.objects.filter(applicant_id=applicant).delete()
                    WorkExperience.objects.filter(applicant_id=applicant).delete()
                    Bookmark.objects.filter(applicant_id=applicant).delete()
                    Application.objects.filter(applicant_id=applicant).delete()
                    applicant.delete()

            # Delete user record
            user.delete()

            return Response({
                "message": "User and all related data deleted successfully",
                "data": []
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "message": "Failed to delete user",
                "data": [],
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminCompanyListView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdmin]

    def get(self, request):
        try:
            companies = Company.objects.all().values(
                'company_id', 'company_name', 'company_industry', 'company_description'
            )
            return Response({
                "message": "Companies fetched successfully",
                "data": list(companies)
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "message": "Failed to fetch companies",
                "data": [],
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminCompanyDeleteView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdmin]

    def delete(self, request, company_id):
        try:
            company = get_object_or_404(Company, company_id=company_id)

            # Inactivate recruiters
            recruiters = Recruiter.objects.filter(company_id=company)
            for recruiter in recruiters:
                recruiter.recruiter_is_active = False
                recruiter.recruiter_end_date = timezone.now().date()
                recruiter.save()

            # Get all jobs and delete related bookmarks and applications
            jobs = Job.objects.filter(recruiter_id__in=recruiters)
            for job in jobs:
                Bookmark.objects.filter(job_id=job).delete()
                Application.objects.filter(job_id=job).delete()
            jobs.delete()

            # Delete company
            company.delete()

            return Response({
                "message": "Company, recruiters, and related jobs deleted successfully",
                "data": []
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "message": "Failed to delete company",
                "data": [],
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminJobDeleteView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdmin]

    def delete(self, request, job_id):
        try:
            job = get_object_or_404(Job, job_id=job_id)

            Bookmark.objects.filter(job_id=job).delete()
            Application.objects.filter(job_id=job).delete()
            job.delete()

            return Response({
                "message": "Job and related data deleted successfully",
                "data": []
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "message": "Failed to delete job",
                "data": [],
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
