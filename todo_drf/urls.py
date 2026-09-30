from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
import os
from django.conf import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]

# If frontend build index.html exists, serve it at root
frontend_index = os.path.join(settings.BASE_DIR, 'frontend', 'build', 'index.html')
if os.path.exists(frontend_index):
    urlpatterns.append(path('', TemplateView.as_view(template_name='index.html')))
