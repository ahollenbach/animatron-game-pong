const MessageTypes = {
    MESSAGE : "message",
    ADDED : "added"
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

        console.log(message);

        switch (json.type) {
            case MessageTypes.MESSAGE:
                addMessageToBox(
                    (json.data.author ?
                        "(" + dateFormat(new Date(json.data.time), "h:MM:ss TT") + ") " +
                        json.data.author + ": "
                        : "") +
                    json.data.text
                );
                break;

            case MessageTypes.ADDED:
                addMessageToBox("Welcome to the chat.");

        }
    };

    initChat(ws, input);
	initPong(ws); 

    function addMessageToBox(message) {
        box.appendChild(document.createTextNode((box.value == "" ? "" : "\n") + message));
        box.scrollTop = box.scrollHeight;
    }
});