FROM golang:1.16.6

SHELL ["/bin/bash", "-c"]

ENV API_PORT=50051
ENV RELOAD_APP_ON_FILE_CHANGE=true
ENV PUSHER_APP_ID="1238509"
ENV PUSHER_KEY="adbeaa1d731202934e15"
ENV PUSHER_SECRET="6d5ed969964e6650f3f0"
ENV PUSHER_CLUSTER="us3"
ENV PUSHER_SECURE="true"

# Install prerequisites
RUN apt-get update && \
    apt-get install -y curl inotify-tools

WORKDIR /app

COPY . /app

CMD /app/boot.sh