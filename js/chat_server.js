// Possible message types that can be received from clients
const MessageTypes = {
    INITIAL : "initial",
    MESSAGE : "message",
    SEND_INVITE : "send_invite",
    ACCEPT_INVITE : "accept_invite",
    START_PONG : "start_pong"
}

// Regular expression used to check username validity. The rules are as follows:
// Usernames can consist of lowercase and capitals
// Usernames can consist of alphanumeric characters
// Usernames can consist of underscore and hyphens and spaces
// Cannot be two underscores, two hypens or two spaces in a row
// Cannot have a underscore, hypen or space at the start or end
var usernameValidator = /^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/;

// Websocket initialization
var WebSocket = require('ws');
var WebSocketServer = WebSocket.Server;

// Open server on port 1337
var wss = new WebSocketServer({port: 1337});

console.log("Server started");

var clients = [];

wss.on('connection', function(ws) {
	var index = clients.push(ws) - 1;
	var username = "Bob Loblaw";

    //ws.send('New user in chat');
    logClients();

    // Event handler for incoming messages
    ws.on('message', function(message) {
        // Verify that message is JSON
        try {
            var json = JSON.parse(message);
        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ', message);
            return;
        }

        switch (json.type) {
            // Initial message from client, which sends user data such as username
            case MessageTypes.INITIAL:
                // Connect to chat if the username is valid, or else report invalid username and refuse connection
                if (usernameValidator.test(json.data.username)) {
                    username = json.data.username;

                    // Send connection success message
                    ws.send(JSON.stringify({
                        type : "connection_success",
                        data : {
                            message : "Welcome to the chat " + username;
                        }
                    }));
                } else {
                    // Send connection failure message
                    ws.send(JSON.stringify({
                        type : "connection_failure",
                        data : {
                            message : "The username \"" + json.data.username + "\" is invalid.\nUsernames can only consist of alphanumeric characters, underscores, hyphens, and spaces."
                        }
                    }));
                }               
                break;

            // Chat message
            case MessageTypes.MESSAGE:
                // Broadcast chat message to all users
                for (var i = 0; i < clients.length; i++)
                    sendMessage(clients[i], i == index ? "Me" : username, json.data.message);
                break;

            default:
                console.log("Received invaild message type: " + json.type);
                break;
        }          
    });

    // Event handler for closed connection between server and a client
    ws.on('close', function(connection) {
    	console.log("A user disconnected");

        // Remove disconnected client from list of clients
    	clients.splice(index, 1);
    	
    	logClients();
    });
});

// Logs current number of clients to command line
function logClients() {
	console.log("There are currently " + clients.length + " clients online.");
}

// Sends message text along with other user information as JSON to a client
function sendMessage(client, username, message) {
	if (client.readyState == WebSocket.OPEN) {
        client.send(JSON.stringify({
            type : "message",
            data : {
                time : (new Date()).getTime(),
                author : username,
                text : message
            }
        }));
    }
}