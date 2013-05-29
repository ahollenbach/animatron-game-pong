window.addEventListener("load", function() {
    var box = document.querySelector("#messages");
    var input = document.querySelector("#input-message");

    var ws = new WebSocket('ws://192.168.40.73:1337');
    ws.onopen = function() {
        ws.send('something');
    };
    ws.onmessage = function(message) {
        console.log('received: %s', message);
        box.value += message.data + "\n";
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