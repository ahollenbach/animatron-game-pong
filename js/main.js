const MessageTypes = {
    MESSAGE : "message",
    CONNECTION_SUCCESS : "connection_success",
    CONNECTION_FAILURE : "connection_failure"
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
                addMessageToBox(json.data.message);
                break;

            case MessageTypes.CONNECTION_FAILURE:
                addMessageToBox(json.data.message)
                
                ws.close();
                break;
        }
    };

    initChat(ws, input);
    initUserList();
	initPong(ws);

    function addMessageToBox(message) {
        box.appendChild(document.createTextNode((box.value == "" ? "" : "\n") + message));
        box.scrollTop = box.scrollHeight;
    }

    function initUserList() {
        var users = JSON.stringify({ 
                        type : "user", 
                        data : [{ name : "User 1" }, 
                               { name : "User 2" },
                               { name : "User 3" },
                               { name : "User 3" },
                               { name : "User 3" },
                               { name : "User 3" },
                               { name : "User 3" },
                               { name : "User 3" },
                               { name : "User 3" },
                               { name : "User 4" }] 
                    });
        try {
            var json = JSON.parse(users);
        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ', users);
            return;
        }

        var html = "<ul class=\"scroll\">"
        for (var i = 0; i < json.data.length; i++) {
            html += "<li class=\"user" + (i==0?" firstElem":"") + "\">" + json.data[i].name + "</li>";
        }
        html += "</ul>";
        document.getElementById("user-list").innerHTML = html;

        //add listener to each user button, onclick add to game
        var userElems = document.getElementsByClassName('user');
        for (var i = 0; i < userElems.length; i++) {
            var user = userElems[i];
            user.onclick= function() {
                //alert(this.innerHTML);
            }
        }
    }
});