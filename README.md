# Inference API

## Docker setup instructions

* Follow the steps inside the [compose](https://github.com/ExpressionDetection/compose) repository

## Setup instructions

* Install [NodeJS](https://nodejs.org/en/) and [Yarn](https://classic.yarnpkg.com/en/)

* Run `yarn install` to install dependencies

* You can spin the server by running: 
    * ```bash
        API_PORT=3001 \
        RELOAD_APP_ON_FILE_CHANGE=true \
        PUSHER_APP_ID=1238509 \
        PUSHER_APP_KEY=adbeaa1d731202934e15 \
        PUSHER_APP_SECRET=6d5ed969964e6650f3f0 \
        PUSHER_APP_CLUSTER=us3 \
        PUSHER_APP_SECURE=1 \
        PUSHER_CHANNELS_ENCRYPTION_KEY="$(openssl rand -base64 24)" && \
        yarn run dev
        ```