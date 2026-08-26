# Vonage Web Video Chat 

A multiparty web-based video chat app built with the Vonage Video API.

**Features**

- Connect to a session
- Toggle camera on/off
- Toggle microphone on/off
- Toggle background blur on/off
- Live captions

---

## How to run the app

### Step 1. Create a Vonage Account

First sign up at [Vonage](https://developer.vonage.com/en/home) and create a new app. Then copy your **App ID** and download the **Private Key**. You will need these credentials to pass them in your local server in later steps. [Check out this guide](https://developer.vonage.com/en/video/getting-started) for a detailed explanation of how you can create the account and get your credentials.

### Step 2. Clone the Repo

```bash
git clone https://github.com/tsolakoua/basic-video-chat
```

### Step 3. Clone and start the server

The client relies on a local server that generates session credentials (Session ID, and Token) dynamically. A new token is generated per client.

Clone the [sample-video-node-learning_server](https://github.com/Vonage-Community/sample-video-node-learning_server):

```bash
git clone https://github.com/Vonage-Community/sample-video-node-learning_server.git
```

Follow the instructions in the [README](https://github.com/Vonage-Community/sample-video-node-learning_server.git) to start the server locally. 

### Step 4. Run the client

Open `client.html` in a browser. The app will automatically fetch credentials from the server, connect to the session, and start publishing video.

### Step 5. Join from another browser tab

Open `client.html` in a second tab to see both participants in the video call. Each tab receives its own token from the server.
