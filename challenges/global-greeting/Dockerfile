FROM python:3.12-slim

RUN useradd -m challenge
WORKDIR /app
COPY app.py .
RUN pip install --no-cache-dir flask

USER challenge
EXPOSE 5000
CMD ["python", "app.py"]
