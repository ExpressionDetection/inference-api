package main

import (
	"os"
	"github.com/pusher/pusher-http-go"
)

func main(){

	pusherClient := pusher.Client{
		AppID: os.Getenv("PUSHER_APP_ID"),
		Key: os.Getenv("PUSHER_KEY"),
		Secret: os.Getenv("PUSHER_SECRET"),
		Cluster: os.Getenv("PUSHER_CLUSTER"),
		Secure: os.Getenv("PUSHER_SECURE") == "true",
	}

	data := map[string]string{"message": "hello world"}
	pusherClient.Trigger("my-channel", "my-event", data)


	
	for {
		
	}
}