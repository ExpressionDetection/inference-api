#!/bin/bash

# Install dependencies during container boot
cd /app/src && yarn install

if [ $RELOAD_APP_ON_FILE_CHANGE == "true" ]
  then
    # Reload server whenever a file is saved
    cd /app/src && yarn run dev
  else
    cd /app/src && yarn run dev
fi