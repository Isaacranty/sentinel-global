FROM python:3.12-slim

# Install ping (iputils-ping)
RUN apt-get update && apt-get install -y iputils-ping && rm -rf /var/lib/apt/lists/*

RUN useradd -m challenge
WORKDIR /app
COPY app.py .
RUN pip install --no-cache-dir flask

USER challenge
EXPOSE 5000
CMD ["python", "app.py"]
