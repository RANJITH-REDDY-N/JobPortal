# Generated by Django 5.1.7 on 2025-04-18 01:19

import django.core.validators
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('JobMatrix', '0006_add_passwordresettoken'),
    ]

    operations = [
        migrations.CreateModel(
            name='Education',
            fields=[
                ('education_id', models.AutoField(db_column='education_id', primary_key=True, serialize=False)),
                ('education_school_name', models.CharField(db_column='education_school_name', max_length=255)),
                ('education_degree_type', models.CharField(db_column='education_degree_type', max_length=100)),
                ('education_major', models.CharField(blank=True, db_column='education_major', max_length=255, null=True)),
                ('education_gpa', models.DecimalField(blank=True, db_column='education_gpa', decimal_places=2, max_digits=3, null=True, validators=[django.core.validators.MinValueValidator(0.0)])),
                ('education_start_date', models.DateField(db_column='education_start_date')),
                ('education_end_date', models.DateField(blank=True, db_column='education_end_date', null=True)),
                ('education_is_currently_enrolled', models.BooleanField(db_column='education_is_currently_enrolled', default=False)),
                ('applicant_id', models.ForeignKey(db_column='applicant_id', on_delete=django.db.models.deletion.CASCADE, related_name='education', to='JobMatrix.applicant')),
            ],
            options={
                'db_table': 'EDUCATION',
                'constraints': [models.CheckConstraint(condition=models.Q(models.Q(('education_end_date__isnull', True), ('education_is_currently_enrolled', True)), models.Q(('education_end_date__gt', models.F('education_start_date')), ('education_is_currently_enrolled', False)), _connector='OR'), name='check_education_end_date')],
            },
        ),
        migrations.CreateModel(
            name='Skill',
            fields=[
                ('skill_id', models.AutoField(db_column='skill_id', primary_key=True, serialize=False)),
                ('skill_name', models.CharField(db_column='skill_name', max_length=255)),
                ('skill_years_of_experience', models.PositiveIntegerField(db_column='skill_years_of_experience', default=0)),
                ('applicant_id', models.ForeignKey(db_column='applicant_id', on_delete=django.db.models.deletion.CASCADE, related_name='skills', to='JobMatrix.applicant')),
            ],
            options={
                'db_table': 'SKILL',
                'constraints': [models.CheckConstraint(condition=models.Q(('skill_years_of_experience__gte', 0)), name='check_skill_experience')],
            },
        ),
        migrations.CreateModel(
            name='WorkExperience',
            fields=[
                ('work_experience_id', models.AutoField(db_column='work_experience_id', primary_key=True, serialize=False)),
                ('work_experience_job_title', models.CharField(db_column='work_experience_job_title', max_length=255)),
                ('work_experience_company', models.CharField(db_column='work_experience_company', max_length=255)),
                ('work_experience_summary', models.TextField(blank=True, db_column='work_experience_summary', max_length=5000, null=True)),
                ('work_experience_start_date', models.DateField(db_column='work_experience_start_date')),
                ('work_experience_end_date', models.DateField(blank=True, db_column='work_experience_end_date', null=True)),
                ('work_experience_is_currently_working', models.BooleanField(db_column='work_experience_is_currently_working', default=False)),
                ('applicant_id', models.ForeignKey(db_column='applicant_id', on_delete=django.db.models.deletion.CASCADE, related_name='work_experience', to='JobMatrix.applicant')),
            ],
            options={
                'db_table': 'WORK_EXPERIENCE',
                'constraints': [models.CheckConstraint(condition=models.Q(models.Q(('work_experience_end_date__isnull', True), ('work_experience_is_currently_working', True)), models.Q(('work_experience_end_date__gt', models.F('work_experience_start_date')), ('work_experience_is_currently_working', False)), _connector='OR'), name='check_work_experience_end_date')],
            },
        ),
    ]
