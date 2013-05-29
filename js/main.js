window.addEventListener("load", function() {
		//save the current mouse position for reference
	var mousePos = { x: 0, y: 0};

	//find out where the mouse is on the canvas
	function setMousePos(canvas, evt) {
		var rect = canvas.getBoundingClientRect();
	    mousePos.x = evt.clientX - rect.left;
		mousePos.y = evt.clientY - rect.top;
	}

	//add a listener for changes
	var canvas = document.getElementById('game-canvas');
	
	canvas.addEventListener('mousemove', function(evt) {
		setMousePos(canvas, evt);
		//var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;
		//$("#coord").text(message);
	}, false);


	//Animatron player declarations
	var b = Builder._$, C = anm.C;

	//canvas size
	const WIDTH = 800, HEIGHT = 450;
	//reference to canvas
	var canvas = document.getElementById('game-canvas');

	var defaultPos = [0,0];

	//puck attributes
	var puckPosX 	= WIDTH/2;
	var puckPosY 	= HEIGHT/2;
	var puckRadius 	= 14;

	//bar attributes
	var barWidth 	= 14;
	var barHeight 	= 80;
	var barOffset 	= 10; //offset from edge
	var p1posY 		= HEIGHT/2;
	var p1posX 		= barOffset + barWidth/2;
	var p2posY 		= HEIGHT/2;
	var p2posX 		= WIDTH - barOffset - barWidth/2; //all assumes upper right corner as root
	var minY		= barHeight/2;
	var maxY		= HEIGHT - barHeight/2;

	//tracks mouse location and moves the bar accordingly
	var barMovementMod = function(t) {
		var cur = this.$;
		//var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;
		//$("#coord").text(message);
		var newPos = mousePos.y;
		newPos = Math.max(minY, Math.min(newPos, maxY)); //clamp it
		this.y = newPos-p1posY;
	}

	//initialize and begin
	var scene = b('scene')
					.fill("#000")
					.add(
						b('puck').circle([puckPosX, puckPosY], puckRadius)
				  		   		 .fill('#000'))
				    .add(
				 		b('player1').rect([p1posX, p1posY], [barWidth,barHeight])
						   			.fill('#000'))
				    .add(
						b('player2').rect([p2posX, p2posY], [barWidth,barHeight])
						   			.fill('#000')
				    				.modify(barMovementMod));

	createPlayer('game-canvas', {
		"mode" : C.M_DYNAMIC,
		"anim" : {
			"width" : WIDTH,
			"height" : HEIGHT,
			"bgfill" : { color : "#FFF" }
		} 
	})
		.load(scene)
		.play();
});