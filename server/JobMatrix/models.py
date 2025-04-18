from django.db import models
from django.core.validators import MinValueValidator, MinLengthValidator
from django.utils import timezone


# ================================================
# USER MODEL (Supertype containing common attributes)
# ================================================
class User(models.Model):
    user_id = models.AutoField(primary_key=True, db_column='user_id')
    ROLE_CHOICES = [
        ("ADMIN", "ADMIN"),
        ("APPLICANT", "APPLICANT"),
        ("RECRUITER", "RECRUITER"),
    ]

    user_first_name = models.CharField(max_length=255, db_column='user_first_name')
    user_last_name = models.CharField(max_length=255, db_column='user_last_name')
    user_email = models.EmailField(unique=True, db_column='user_email')
    user_password = models.CharField(max_length=255, validators=[MinLengthValidator(8)], db_column='user_password')
    user_phone = models.CharField(max_length=15, blank=True, null=True, db_column='user_phone')
    user_street_no = models.CharField(max_length=100, blank=True, null=True, db_column='user_street_no')
    user_city = models.CharField(max_length=100, blank=True, null=True, db_column='user_city')
    user_state = models.CharField(max_length=100, blank=True, null=True, db_column='user_state')
    user_zip_code = models.CharField(max_length=10, blank=True, null=True, db_column='user_zip_code')
    user_role = models.CharField(max_length=20, choices=ROLE_CHOICES, db_column='user_role')
    user_profile_photo = models.FileField(upload_to="profile_photos/", blank=True, null=True, db_column='user_profile_photo', max_length=255)
    user_created_date = models.DateTimeField(auto_now_add=True, db_column='user_created_date')

    REQUIRED_FIELDS = ["user_first_name", "user_last_name", "user_email", "user_role", "user_password"]
    USERNAME_FIELD = "user_email"  # Used for authentication

    class Meta:
        db_table = "USER"

    def __str__(self):
        return f"{self.user_email} ({self.user_role})"

    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False


# ================================================
# ADMIN MODEL
# ================================================
class Admin(models.Model):
    admin_id = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, db_column="admin_id")
    admin_ssn = models.CharField(max_length=20, unique=True, db_column='admin_ssn')

    class Meta:
        db_table = "ADMIN"


# ================================================
# APPLICANT MODEL
# ================================================
class Applicant(models.Model):
    applicant_id = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, db_column="applicant_id")
    applicant_resume = models.FileField(upload_to="resumes/", blank=True, null=True, db_column="applicant_resume", max_length=255)

    class Meta:
        db_table = "APPLICANT"


# ================================================
# RECRUITER MODEL
# ================================================
class Recruiter(models.Model):
    recruiter_id = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, db_column="recruiter_id")
    company_id = models.ForeignKey("Company", on_delete=models.CASCADE, related_name="recruiters", db_column="company_id")
    recruiter_is_active = models.BooleanField(default=True, db_column='recruiter_is_active')
    recruiter_start_date = models.DateField(null=False, blank=False, db_column='recruiter_start_date')
    recruiter_end_date = models.DateField(null=True, blank=True, db_column='recruiter_end_date')

    class Meta:
        db_table = "RECRUITER"


# ================================================
# COMPANY MODEL
# ================================================
class Company(models.Model):
    company_id = models.AutoField(primary_key=True, db_column='company_id')
    company_name = models.CharField(max_length=255, unique=True, db_column='company_name')
    company_industry = models.CharField(max_length=100, blank=False, null=False, db_column='company_industry')
    company_description = models.TextField(db_column='company_description')
    company_image = models.FileField(upload_to="company_images/", blank=True, null=True, db_column="company_image", max_length=255)
    company_secret_key = models.CharField(max_length=128, blank=False, null=False, db_column='company_secret_key')

    class Meta:
        db_table = "COMPANY"


# ================================================
# JOB MODEL
# ================================================
class Job(models.Model):
    job_id = models.AutoField(primary_key=True, db_column='job_id')
    job_title = models.CharField(max_length=255, db_column='job_title')
    job_description = models.TextField(db_column='job_description')
    job_location = models.CharField(max_length=255, blank=False, null=False, db_column='job_location')
    job_salary = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.00)], db_column='job_salary')
    job_date_posted = models.DateTimeField(auto_now_add=True, db_column='job_date_posted')
    recruiter_id = models.ForeignKey(Recruiter, on_delete=models.CASCADE, db_column='recruiter_id')

    class Meta:
        db_table = "JOB"
        constraints = [
            models.CheckConstraint(check=models.Q(job_salary__gte=0), name="check_job_salary")
        ]



# ================================================
# APPLICATION MODEL
# ================================================
class Application(models.Model):
    application_id = models.AutoField(primary_key=True, db_column='application_id')
    STATUS_CHOICES = [
        ("PENDING", "PENDING"),
        ("APPROVED", "APPROVED"),
        ("REJECTED", "REJECTED")
    ]
    applicant_id = models.ForeignKey(Applicant, on_delete=models.CASCADE, db_column='applicant_id')
    job_id = models.ForeignKey(Job, on_delete=models.CASCADE, db_column='job_id')
    application_status = models.CharField(max_length=50, choices=STATUS_CHOICES, default="PENDING", db_column='application_status')
    application_recruiter_comment = models.TextField(blank=True, null=True, db_column='application_recruiter_comment')
    application_date_applied = models.DateTimeField(auto_now_add=True, db_column='application_date_applied')

    class Meta:
        db_table = "APPLICATION"


# ================================================
# BOOKMARK MODEL
# ================================================
class Bookmark(models.Model):
    bookmark_id = models.AutoField(primary_key=True, db_column='bookmark_id')
    applicant_id = models.ForeignKey(Applicant, on_delete=models.CASCADE, db_column='applicant_id')
    job_id = models.ForeignKey(Job, on_delete=models.CASCADE, db_column='job_id')
    bookmark_date_saved = models.DateTimeField(auto_now_add=True, db_column='bookmark_date_saved')

    class Meta:
        db_table = "BOOKMARK"


# ================================================
# WORK EXPERIENCE MODEL
# ================================================
class WorkExperience(models.Model):
    work_experience_id = models.AutoField(primary_key=True, db_column='work_experience_id')
    applicant_id = models.ForeignKey(Applicant, on_delete=models.CASCADE, related_name="work_experience", db_column='applicant_id')
    work_experience_job_title = models.CharField(max_length=255, null=False, blank=False, db_column='work_experience_job_title')
    work_experience_company = models.CharField(max_length=255, null=False, blank=False, db_column='work_experience_company')
    work_experience_summary = models.TextField(max_length=5000, blank=True, null=True, db_column='work_experience_summary')
    work_experience_start_date = models.DateField(null=False, blank=False, db_column='work_experience_start_date')
    work_experience_end_date = models.DateField(blank=True, null=True, db_column='work_experience_end_date')
    work_experience_is_currently_working = models.BooleanField(default=False, db_column='work_experience_is_currently_working')

    class Meta:
        db_table = "WORK_EXPERIENCE"
        constraints = [
            models.CheckConstraint(
                check=models.Q(work_experience_is_currently_working=True, work_experience_end_date__isnull=True) |
                      models.Q(work_experience_is_currently_working=False, work_experience_end_date__gt=models.F("work_experience_start_date")),
                name="check_work_experience_end_date"
            )
        ]

# ================================================
# EDUCATION MODEL
# ================================================
class Education(models.Model):
    education_id = models.AutoField(primary_key=True, db_column='education_id')
    applicant_id = models.ForeignKey(Applicant, on_delete=models.CASCADE, related_name="education", db_column='applicant_id')
    education_school_name = models.CharField(max_length=255, null=False, blank=False, db_column='education_school_name')
    education_degree_type = models.CharField(max_length=100, null=False, blank=False, db_column='education_degree_type')
    education_major = models.CharField(max_length=255, blank=True, null=True, db_column='education_major')
    education_gpa = models.DecimalField(max_digits=3, decimal_places=2, blank=True, null=True,
                                        validators=[MinValueValidator(0.00)], db_column='education_gpa')
    education_start_date = models.DateField(null=False, blank=False, db_column='education_start_date')
    education_end_date = models.DateField(blank=True, null=True, db_column='education_end_date')
    education_is_currently_enrolled = models.BooleanField(default=False, db_column='education_is_currently_enrolled')

    class Meta:
        db_table = "EDUCATION"
        constraints = [
            models.CheckConstraint(
                check=models.Q(education_is_currently_enrolled=True, education_end_date__isnull=True) |
                      models.Q(education_is_currently_enrolled=False, education_end_date__gt=models.F("education_start_date")),
                  name="check_education_end_date"
            )
        ]

# ================================================
# SKILL MODEL
# ================================================

class Skill(models.Model):
    skill_id = models.AutoField(primary_key=True, db_column='skill_id')
    applicant_id = models.ForeignKey(Applicant, on_delete=models.CASCADE, related_name="skills", db_column='applicant_id')
    skill_name = models.CharField(max_length=255, null=False, blank=False, db_column='skill_name')
    skill_years_of_experience = models.PositiveIntegerField(default=0, null=False, blank=False, db_column='skill_years_of_experience')

    class Meta:
        db_table = "SKILL"
        constraints = [
            models.CheckConstraint(check=models.Q(skill_years_of_experience__gte=0), name="check_skill_experience")
        ]



# ================================================
# PASSWORD RESET TOKEN MODEL
# ================================================
class PasswordResetToken(models.Model):
    email = models.EmailField()
    token = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        db_table = "PASSWORD_RESET_TOKEN"

    @property
    def is_expired(self):
        return timezone.now() > self.expires_at