package main
    
import (
	"os"
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"context"
	"net/http"
	"strconv" 
	pusher "github.com/pusher/pusher-http-go"
)

func main() { 

	apiPort, _ := strconv.Atoi(os.Getenv("API_PORT"))
	port := flag.Int("http.port",  apiPort, "Port to run HTTP service on")

	flag.Parse()

	appID := os.Getenv("PUSHER_APP_ID") 
	appKey := os.Getenv("PUSHER_APP_KEY")
	appSecret := os.Getenv("PUSHER_APP_SECRET")
	appCluster := os.Getenv("PUSHER_APP_CLUSTER")
	appIsSecure := os.Getenv("PUSHER_APP_SECURE")

	var isSecure bool
	if appIsSecure == "1" {
		isSecure = true
	}

	client := &pusher.Client{
			AppID:               appID,
			Key:                 appKey,
			Secret:              appSecret,
			Cluster:             appCluster,
			Secure:              isSecure,
			EncryptionMasterKey: os.Getenv("PUSHER_CHANNELS_ENCRYPTION_KEY"),
	}

	

	mux := http.NewServeMux()
    server := http.Server{Addr: fmt.Sprintf(":%d", *port), Handler: mux}
	ctx, cancel := context.WithCancel(context.Background())
    defer cancel()

    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
         
    })

	mux.Handle("/pusher/auth", authenticateUsers(client))  

    go func() {
        if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            log.Fatal(err)  
        }
    }()

	log.Printf("Running server on port %d", *port) 

    select {
    case <-ctx.Done():
        // Shutdown the server when the context is canceled
        server.Shutdown(ctx)
    }
    log.Printf("Finished")

}

func authenticateUsers(client *pusher.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Handle CORS
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

		if r.Method == http.MethodOptions {
			return
		}

		params, err := ioutil.ReadAll(r.Body)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		presenceData := pusher.MemberData{
				UserID: "10",
				UserInfo: map[string]string{
						"random": "random", 
				},
		}

		response, err := client.AuthenticatePresenceChannel(params, presenceData)
		if err != nil {
				w.WriteHeader(http.StatusBadRequest)
				return
		}

		w.Write(response)
	}
}