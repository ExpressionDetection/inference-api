#!/bin/bash

source ~/.bashrc

# Install dependencies during container boot
cd /app/src && go mod tidy

if [ $RELOAD_APP_ON_FILE_CHANGE == "true" ]
  then
    # Reload server whenever a file is saved
    cd /app/src && air -c .air.toml
  else
    cd /app/src && go run api.go
fi