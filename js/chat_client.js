function initChat(ws, input) {
    input.addEventListener("keydown", (function(e) {
        if (e.keyCode === 13) {
            var msg = this.value;

            if (!msg)
                return;

            ws.send(JSON.stringify({ type : "message", data : { message : msg } }));
           this.value = "";
        }
    }));
};