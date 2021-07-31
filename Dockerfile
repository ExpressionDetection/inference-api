FROM node:16-alpine3.14

ENV RELOAD_APP_ON_FILE_CHANGE=true
ENV API_PORT=3001
ENV REDIS_PORT=6379
ENV REDIS_HOST=inference-redis
ENV FRONT_END_PROTOCOL=http
ENV FRONT_END_HOST=localhost
ENV FRONT_END_PORT=3000

# Install prerequisites
RUN apk update && \
    apk add bash curl git

SHELL ["/bin/bash", "-c"]

WORKDIR /app

COPY . /app

CMD /app/boot.sh