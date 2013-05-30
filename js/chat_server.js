var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({port: 1337});

console.log("Server started");

var clients = [];

wss.on('connection', function(ws) {
	var index = clients.push(ws) - 1;
	var username = "Bob Loblaw";

    ws.send('New user in chat');
    logClients();

    ws.on('message', function(message) {    
        for (var i = 0; i < clients.length; i++)
        	sendMessage(clients[i], i == index ? "Me" : username, message);
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
	if (client)
		client.send(username + ": " + message);
}