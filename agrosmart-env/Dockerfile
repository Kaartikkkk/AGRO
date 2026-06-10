# Use python as base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose port from FastAPI
EXPOSE 8000

# Run the environment server
CMD ["uvicorn", "env:app", "--host", "0.0.0.0", "--port", "8000"]
