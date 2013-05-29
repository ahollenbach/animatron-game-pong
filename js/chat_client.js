window.addEventListener("load", function() {
    var box = document.querySelector("#messages");
    var input = document.querySelector("#input-message");

    ws = new WebSocket('ws://192.168.40.73:1337');
    ws.onopen = function() {
        //ws.send('something');
    };
    ws.onmessage = function(message) {
        box.appendChild(document.createTextNode((box.value == "" ? "" : "\n") + message.data));
        box.scrollTop = box.scrollHeight;
    };

    input.addEventListener("keydown", (function(e) {
        if (e.keyCode === 13) {
            var msg = this.value;

            if (!msg)
                return;

            ws.send(msg);
           this.value = "";
        }
    }));
});