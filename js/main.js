window.addEventListener("load", function() {
    $("#lobby").hide();
    $("#game").hide();
});

$("input[type=submit]").click(function() {
    var box = document.querySelector("#messages");
    var input = document.querySelector("#input-message");
    var game,playerId;

    ws = new WebSocket('ws://192.168.40.73:1337');
    ws.onopen = function() {
        var username = $("input[name=username]").val();
        ws.send(JSON.stringify({
            type : ClientMessage.INITIAL,
            data : {
                username : username
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
            case ServerMessage.MESSAGE:
                addMessageToBox(
                    (json.data.author ?
                        "(" + dateFormat(new Date(json.data.time), "mediumTime") + ") " +
                        json.data.author + ": "
                        : "") +
                    json.data.text
                );
                break;

            case ServerMessage.CONNECTION_SUCCESS:
                initUserList(json.data.userList);
                addMessageToBox(json.data.message);
                $("#login").hide();
                $("#lobby").show();
                break;

            case ServerMessage.SERVER_STOPPED:
                addMessageToBox(json.data.message);
                break;

            case ServerMessage.NEW_USER:
                addMessageToBox(json.data.message);
                var userList = $("ul.scroll");
                var firstElem = (userList.children().length == 0) ? true : false;
                userList.append(makeUser(json.data.username,firstElem));
                var user = $("#"+json.data.username);
                attachListener(user);
                break;

            case ServerMessage.INVITE:
                var sender = json.data.sender;
                var result = confirm(sender + " invites you to play " + json.data.gameType);
                var type = result ? ClientMessage.ACCEPT_INVITE : ClientMessage.DECLINE_INVITE;
                sendMessage(ws,type,{inviterUsername : sender, gameType : json.data.gameType});
                break;

            case ServerMessage.INVITE_DECLINED:
                alert("You were declined by " + json.data.inviteeUsername + ".");
                break;

            case ServerMessage.LOAD_GAME:
                game = initPong(ws);
                $("#game").show();
                $("#lobby").hide();
                break;

            case "game_initialization":
                playerId = json.data.id;
                game.startGame(playerId);
                break;

            case "paddle_location":
                game.setOpponentData(json.data.location);
                break;

            case ServerMessage.USER_LEFT:
                addMessageToBox(json.data.message);
                var element = document.getElementById(json.data.username);
                element.parentNode.removeChild(element);
                break;

            case ServerMessage.CONNECTION_FAILURE:
                addMessageToBox(json.data.message)

                ws.close();
                break;
        }
    };

    ws.onclose = function() {
        addMessageToBox("You have been disconnected from the chat server.");
    };

    initChat(ws, input);

    function addMessageToBox(message) {
        box.appendChild(document.createTextNode((box.value == "" ? "" : "\n") + message));
        box.scrollTop = box.scrollHeight;
    }

    function initUserList(users) {
        var html = "<ul class=\"scroll\">"
        if(users != null) {
            for (var i = 0; i < users.length; i++) {
                var user = users[i];
                if(i==0) html += makeUser(user,true);
                else     html += makeUser(user);
            }
        }
        html += "</ul>";
        document.getElementById("user-list").innerHTML = html;

        //add listener to each user button, onclick invite to game
        var userElems = $('.user');
        for (var i = 0; i < userElems.length; i++) {
            var user = $(userElems[i]);
            attachListener(user);
        }
    }

    function makeUser(user,firstElem) {
        return "<li id=\"" + user + "\" class=\"user" + (firstElem?" firstElem":"") + "\">" + user + "</li>";
    }

    function attachListener(user) {
        user.click(function() {
            var username = this.id;
            sendMessage(ws,ClientMessage.SEND_INVITE,{ inviteeUsername : username, gameType : "Pong" });
        });
    }
});