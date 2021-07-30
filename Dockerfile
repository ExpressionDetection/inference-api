FROM golang:1.16.6

SHELL ["/bin/bash", "-c"]

ENV RELOAD_APP_ON_FILE_CHANGE=true
ENV API_PORT=3001
ENV PUSHER_APP_ID=1238509
ENV PUSHER_APP_KEY=adbeaa1d731202934e15
ENV PUSHER_APP_SECRET=6d5ed969964e6650f3f0
ENV PUSHER_APP_CLUSTER=us3
ENV PUSHER_APP_SECURE=1

RUN echo export PUSHER_CHANNELS_ENCRYPTION_KEY="$(openssl rand -base64 24)" >> ~/.bashrc

# Install prerequisites
RUN apt-get update && \
    apt-get install -y curl inotify-tools

WORKDIR /app

COPY . /app

CMD /app/boot.sh