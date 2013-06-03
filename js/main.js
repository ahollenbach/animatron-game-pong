const MessageTypes = {
    MESSAGE : "message",
    CONNECTION_SUCCESS : "connection_success",
    CONNECTION_FAILURE : "connection_failure",
    SERVER_STOPPED : "server_stopped",
    GAME_INITIALIZATION : "game_initialization"
}

window.addEventListener("load", function() {
	var box = document.querySelector("#messages");
	var input = document.querySelector("#input-message");

	ws = new WebSocket('ws://192.168.40.73:1337');
    ws.onopen = function() {
        ws.send(JSON.stringify({
            type : "initial",
            data : {
                username : prompt("Enter a username.")
            }
        }));
    };

    ws.onmessage = function(message) {
        try {
            var json = JSON.parse(message.data);
        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ', message.data);
            return;
        }

        // console.log(json);

        switch (json.type) {
            case MessageTypes.MESSAGE:
                addMessageToBox(
                    (json.data.author ?
                        "(" + dateFormat(new Date(json.data.time), "mediumTime") + ") " +
                        json.data.author + ": "
                        : "") +
                    json.data.text
                );
                break;

            case MessageTypes.CONNECTION_SUCCESS:
            case MessageTypes.SERVER_STOPPED:
                addMessageToBox(json.data.message);
                break;

            case MessageTypes.CONNECTION_FAILURE:
                addMessageToBox(json.data.message)

                ws.close();
                break;
        }
    };

    ws.onclose = function() {
        addMessageToBox("You have been disconnected from the chat server.");
    };

    initChat(ws, input);
	initPong(ws); 

    function addMessageToBox(message) {
        box.appendChild(document.createTextNode((box.value == "" ? "" : "\n") + message));
        box.scrollTop = box.scrollHeight;
    }
});