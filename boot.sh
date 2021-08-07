#!/bin/bash

if [ $RELOAD_APP_ON_FILE_CHANGE == "true" ]
  then
    # Install dependencies
    cd /app/src && yarn install 
    # Reload server whenever a file is saved
    cd /app/src && yarn run dev
  else
    cd /app/src && yarn run start
fi