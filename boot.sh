#!/bin/bash

source ~/.bashrc

# Install dependencies during container boot
cd /app/src && go mod tidy

if [ $RELOAD_APP_ON_FILE_CHANGE == "true" ]
  then

    sigint_handler()
    {
      kill $PID
      exit
    }

    trap sigint_handler SIGINT

    # Reload server whenever a file is saved
    while true; do
        go run /app/src/api.go &
        PID=$!
        inotifywait -e close_write -r `pwd`
        kill $PID
    done
fi