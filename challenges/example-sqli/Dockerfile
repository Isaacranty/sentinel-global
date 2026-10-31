FROM python:3.12-slim

# Non-root user — never run the challenge process as root, even
# though the sandbox's other layers (network isolation, gVisor,
# cap-drop) are the primary defense.
RUN useradd -m challenge
WORKDIR /app
COPY app.py .
RUN pip install --no-cache-dir flask
USER challenge

EXPOSE 5000
CMD ["python", "app.py"]
