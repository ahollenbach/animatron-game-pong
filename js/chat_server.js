// Possible message types that can be received from clients
const MessageTypes = {
    INITIAL : "initial",
    MESSAGE : "message",
    SEND_INVITE : "send_invite",
    ACCEPT_INVITE : "accept_invite",
    START_GAME : "start_game"
};

// Regular expression used to check username validity. The rules are as follows:
// Usernames can consist of lowercase and capitals
// Usernames can consist of alphanumeric characters
// Usernames can consist of underscore and hyphens and spaces
// Cannot be two underscores, two hypens or two spaces in a row
// Cannot have a underscore, hypen or space at the start or end
var usernameValidator = /^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/;

// Module imports
var WebSocket = require('ws');
var WebSocketServer = WebSocket.Server;
var Client = require('client-list').Client;
var ClientList = require('client-list').ClientList;

var clients = new ClientList();

// Open server on port 1337
var wss = new WebSocketServer({port: 1337});

console.log("Server started");

wss.on('connection', function(ws) {
	// var index = clients.push(ws) - 1;
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

                    clients.pushClient(new Client(username, ws));

                    // Send connection success message
                    ws.send(JSON.stringify({
                        type : "connection_success",
                        data : {
                            message : "Welcome to the chat " + username
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
                clients.forEach(function() {
                    sendMessage(this, json.data.message);
                });
                break;

            case MessageTypes.START_PONG:
                var game = require(json.data.gameName);
                game.init();
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

// Send message to connected clients when closed
process.on("SIGINT", function() {
    console.log("\nServer stopped gracefully via Ctrl + C.");

    clients.forEach(function(client) {
        if (client.readyState == WebSocket.OPEN)
            client.send(JSON.stringify({
                type : "server_stopped",
                data : {
                    message : "The server was manually stopped."
                }
            }));
    });

    wss.close();
    process.exit();
});

// Logs current number of clients to command line
function logClients() {
	console.log("There are currently " + clients.size() + " clients online.");
}

// Sends message text along with other user information as JSON to a client
function sendMessage(client, message) {
	if (client.connection.readyState == WebSocket.OPEN) {
        client.connection.send(JSON.stringify({
            type : "message",
            data : {
                time : (new Date()).getTime(),
                author : client.username,
                text : message
            }
        }));
    }
}