let applicationId;
let sessionId;
let token;
const SAMPLE_SERVER_BASE_URL = 'http://localhost:3000';


// Make a GET request to get the Vonage Video Application ID, session ID, and token from the server
fetch(SAMPLE_SERVER_BASE_URL + '/session')
    .then((response) => {
        if (!response.ok) {
            throw new Error('Server returned HTTP ' + response.status);
        }
        return response.json();
    })
    .then((json) => {
        applicationId = json.applicationId;
        sessionId = json.sessionId;
        token = json.token;

        // Display the credentials in the UI for debugging purposes
        displayCredentials();
        // Initialize a Vonage Video Session object
        return initializeSession(applicationId, sessionId, token);
    }).catch((error) => {
        console.error(error);
        alert('Failed to get Vonage Video credentials. Make sure the server is running.');
    });

// Handling all of the errors here by alerting them
function handleError(error) {
    if (error) {
        alert(error.message);
    }
}

function displayCredentials() {
    // Display the credentials in the UI for debugging purposes
    document.getElementById('credentials').textContent = JSON.stringify({
        applicationId: applicationId,
        sessionId: sessionId,
        token: token
    }, null, 2);
}

async function startLiveCaptions(sessionId, token) {
    const response = await fetch(SAMPLE_SERVER_BASE_URL + '/captions/start', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionId, token })
    });

    if (!response.ok) {
        throw new Error('Unable to start live captions (HTTP ' + response.status + ')');
    }

    const result = await response.json();
    console.log('Live captions started:', result.id);
}

function initializeSession(applicationId, sessionId, token) {
    // Creates a Session object which represent an existing session (only server can create a session)
    const session = OT.initSession(applicationId, sessionId);

    // Create a publisher
    const publisherOptions = {
        insertMode: 'append',
        width: '100%',
        height: '100%',
        publishCaptions: true
    };

    let isBlurActive = true; // starts with blur on, matching your initial setup
    if (OT.hasMediaProcessorSupport('video')) {
        publisherOptions.videoFilter = {
            type: 'backgroundBlur',
            blurStrength: 'high'
        };
    } else {
        console.warn('Background blur is not supported by this browser.');
    }

    const publisher = OT.initPublisher('publisher', publisherOptions, handleError);

    const videoButton = document.getElementById('toggle-video');
    const audioButton = document.getElementById('toggle-audio');
    const backgroundButton = document.getElementById('toggle-background-blur');


    videoButton.addEventListener('click', function () {
        if (publisher.stream.hasVideo === true) {
            publisher.publishVideo(false);
            updateControlState(videoButton, true, 'Turn video on');
        } else {
            publisher.publishVideo(true);
            updateControlState(videoButton, false, 'Turn video off');
        }
    });

    audioButton.addEventListener('click', function () {
        if (publisher.stream.hasAudio === true) {
            publisher.publishAudio(false);
            updateControlState(audioButton, true, 'Unmute microphone');
        } else {
            publisher.publishAudio(true);
            updateControlState(audioButton, false, 'Mute microphone');
        }
    });

    backgroundButton.addEventListener('click', () => {
        if (isBlurActive) {
            console.log('Removing background blur filter');
            publisher.clearVideoFilter();
            updateControlState(backgroundButton, true, 'Turn background blur on');
            isBlurActive = false;
        } else {
            publisher.applyVideoFilter({
                type: 'backgroundBlur',
                blurStrength: 'high'
            });
            updateControlState(backgroundButton, false, 'Turn background blur off');
            isBlurActive = true;
        }
    });
    // Connect to the session using the token
    session.connect(token, function (error) {
        // If the connection is successful, publish to the session
        if (error) {
            handleError(error);
        } else {
            session.publish(publisher, handleError);
            startLiveCaptions(sessionId, token).catch((error) => {
                console.warn('Live captions could not be started:', error);
            });
        }
    });

    publisher.on('streamCreated', function (event) {
        console.log('The publisher started streaming.');
    });


    // streamDestroyed event is defined by the StreamEvent class. The event includes a reason property
    publisher.on("streamDestroyed", function (event) {
        console.log("The publisher stopped streaming. Reason: "
            + event.reason);
    });


    // Subscribe to a newly created stream
    // streamCreated event is dispached by Publish when it start streaming
    session.on('streamCreated', function (event) {
        session.subscribe(event.stream, 'subscriber', {
            insertMode: 'append',
            width: '100%',
            height: '100%'
        }, async function (error, subscriber) {
            if (error) {
                handleError(error);
                return;
            }

            try {
                await subscriber.subscribeToCaptions(true);
            } catch (err) {
                console.warn(err);
            }
        });
    });

    session.on('captionReceived', function (event) {
        console.log(`Caption received for stream ${event.streamId}`);
        console.log(`Caption text: ${event.caption}`);
    });

}

function updateControlState(button, isOff, label) {
    button.classList.toggle('is-off', isOff);
    button.setAttribute('aria-label', label);
    button.setAttribute('title', label);
}