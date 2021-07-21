package main

import (
	"os"
	"log"
	"github.com/joho/godotenv"
	"github.com/pusher/pusher-http-go"
)

func main(){

	// Loading .env vars file
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file!")
		return
	}

	pusherClient := pusher.Client{
		AppID: os.Getenv("AppID"),
		Key: os.Getenv("Key"),
		Secret: os.Getenv("Secret"),
		Cluster: os.Getenv("Cluster"),
		Secure: os.Getenv("Secure") == "true",
	}

	data := map[string]string{"message": "hello world"}
	pusherClient.Trigger("my-channel", "my-event", data)
}