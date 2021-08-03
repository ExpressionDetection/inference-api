# Inference API

## Docker setup instructions

* Follow the steps inside the [compose](https://github.com/ExpressionDetection/compose) repository

## Setup instructions

* Install [NodeJS](https://nodejs.org/en/) and [Yarn](https://classic.yarnpkg.com/en/)

* Run `yarn install` to install dependencies

* You can spin the server by running: 
    * ```bash
        RELOAD_APP_ON_FILE_CHANGE=true && \
        API_PORT=3001 && \
        REDIS_PORT=6379 && \
        REDIS_HOST=inference-redis && \
        FRONT_END_PROTOCOL=http && \
        FRONT_END_HOST=localhost && \
        FRONT_END_PORT=3000 && \
        GRPC_PROTO_PATH=/grcp-pkg/grcppkg/protos/server.proto && \
        yarn run dev
        ```