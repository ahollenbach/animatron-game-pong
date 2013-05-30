const MessageTypes = {
    INITIAL : "initial",
    MESSAGE : "message",
    SEND_INVITE : "send_invite",
    ACCEPT_INVITE : "accept_invite",
    START_PONG : "start_pong"
}

var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({port: 1337});

console.log("Server started");

var clients = [];

wss.on('connection', function(ws) {
	var index = clients.push(ws) - 1;
	var username = "Bob Loblaw";

    //ws.send('New user in chat');
    logClients();

    ws.on('message', function(message) {
        try {
            var json = JSON.parse(message);
        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ', message);
            return;
        }

        switch (json.type) {
            case MessageTypes.INITIAL:
                username = json.data.username;
                ws.send(JSON.stringify({
                    type : "added"
                }));
                break;

            case MessageTypes.MESSAGE:
                for (var i = 0; i < clients.length; i++)
                    sendMessage(clients[i], i == index ? "Me" : username, json.data.message);
                break;

            default:
                console.log("Received invaild message type: " + json.type);
                break;
        }          
    });

    ws.on('close', function(connection) {
    	console.log("A user disconnected");

    	clients.splice(index, 1);
    	
    	logClients();
    });
});

function logClients() {
	console.log("There are currently " + clients.length + " clients online.");
}

function sendMessage(client, username, message) {
	if (client) {
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