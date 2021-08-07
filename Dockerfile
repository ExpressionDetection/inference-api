FROM node:16-alpine3.14

ENV RELOAD_APP_ON_FILE_CHANGE=true
ENV API_PORT=3001
ENV REDIS_PORT=6379
ENV REDIS_HOST=inference-redis
ENV FRONT_END_PROTOCOL=http
ENV FRONT_END_HOST=localhost
ENV FRONT_END_PORT=3000
ENV GRPC_PROTO_PATH=/grcp-pkg/grcppkg/protos/server.proto
ENV MODEL_1_HOST=model1
ENV MODEL_1_PORT=50051

# Install prerequisites
RUN apk update && \
    apk add --update --no-cache openssh bash curl git

SHELL ["/bin/bash", "-c"]

WORKDIR /app

COPY .ssh /root/.ssh
COPY . /app

# Install dependencies
RUN git clone git@github.com:ExpressionDetection/grcp-pkg.git /grcp-pkg && \
    cd /app/src && yarn install 

CMD /app/boot.sh