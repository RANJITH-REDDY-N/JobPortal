from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

urlpatterns = [
    path('', TemplateView.as_view(template_name='index.html')),
    path("jobmatrix/", include("JobMatrix.urls")),
    path('jobmatrix/profile/', include('Profile.urls')),
    path('jobmatrix/job/',include('Job.urls'))
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)