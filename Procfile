web: gunicorn config.wsgi:application
worker: celery worker --app=calories.taskapp --loglevel=info
