FROM python:3.11-slim

WORKDIR /app

# Install system libraries for OpenCV and health checks
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5001

ENV PORT=5001
ENV PYTHONUNBUFFERED=1
ENV GUNICORN_WORKERS=1

CMD ["gunicorn", "-c", "gunicorn_config.py", "api.app:app"]
