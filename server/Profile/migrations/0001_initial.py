# Generated by Django 5.1.7 on 2025-03-24 16:18

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("JobMatrix", "0003_delete_workexperience"),
    ]

    operations = [
        migrations.CreateModel(
            name="WorkExperience",
            fields=[
                (
                    "work_experience_id",
                    models.AutoField(
                        db_column="work_experience_id",
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                (
                    "work_experience_job_title",
                    models.CharField(
                        db_column="work_experience_job_title", max_length=255
                    ),
                ),
                (
                    "work_experience_company",
                    models.CharField(
                        db_column="work_experience_company", max_length=255
                    ),
                ),
                (
                    "work_experience_summary",
                    models.TextField(
                        blank=True,
                        db_column="work_experience_summary",
                        max_length=5000,
                        null=True,
                    ),
                ),
                (
                    "work_experience_start_date",
                    models.DateField(db_column="work_experience_start_date"),
                ),
                (
                    "work_experience_end_date",
                    models.DateField(
                        blank=True, db_column="work_experience_end_date", null=True
                    ),
                ),
                (
                    "work_experience_is_currently_working",
                    models.BooleanField(
                        db_column="work_experience_is_currently_working", default=False
                    ),
                ),
                (
                    "applicant_id",
                    models.ForeignKey(
                        db_column="applicant_id",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="work_experience",
                        to="JobMatrix.applicant",
                    ),
                ),
            ],
            options={
                "db_table": "WORK_EXPERIENCE",
                "constraints": [
                    models.CheckConstraint(
                        condition=models.Q(
                            models.Q(
                                ("work_experience_end_date__isnull", True),
                                ("work_experience_is_currently_working", True),
                            ),
                            models.Q(
                                (
                                    "work_experience_end_date__gt",
                                    models.F("work_experience_start_date"),
                                ),
                                ("work_experience_is_currently_working", False),
                            ),
                            _connector="OR",
                        ),
                        name="check_work_experience_end_date",
                    )
                ],
            },
        ),
    ]
