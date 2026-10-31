FROM python:3.12-slim

RUN useradd -m challenge
WORKDIR /app
COPY app.py .
RUN pip install --no-cache-dir flask

# Create the logs dir and make it writable for the init step
# (though in the real sandbox root is RO and we use tmpfs,
# for building the image we need to set permissions)
RUN mkdir -p /var/log/app && chown challenge:challenge /var/log/app

# The app will try to write /flag.txt at runtime.
# In a RO rootfs, this would fail unless we handle it.
# Let's change the app to just read the ENV var if the file doesn't exist,
# OR we can have the Dockerfile put it there if it were static.
# But flags are dynamic.
# So the app must be able to "find" it.
# Let's use /tmp/flag.txt instead, since /tmp is a tmpfs in our sandbox.

USER challenge
EXPOSE 5000
CMD ["python", "app.py"]
