function initPong(ws) {
	//save the current mouse position for reference
	var mousePos = { x: 0, y: 0};
	const dt = 50/60; //50 FPS

	//find out where the mouse is on the canvas
	function setMousePos(canvas, evt) {
		var rect = canvas.getBoundingClientRect();
	    mousePos.x = evt.clientX - rect.left;
		mousePos.y = evt.clientY - rect.top;
	}

	//add a listener for changes in mouse
	var canvas = document.getElementById('game-canvas');
	canvas.addEventListener('mousemove', function(evt) {
		setMousePos(canvas, evt);
	}, false);

	//gets random velocity between lower and upper,
	//result is randomly positive or negative
	function getRand(lower, upper) {
		return (Math.random() * upper + lower) * (Math.random() > .5 ? 1 : -1);
	}

	//adds a point to the player's score
	function addPoint(playerNum) {
		if(playerNum == 1) {
			p1ScoreText.unpaint(p1ScoreTextStyle);
			p1ScoreText.paint(p1ScoreTextStyle = generateScoreStyle(1,++p1Score));
		} else {
			p2ScoreText.unpaint(p2ScoreTextStyle);
			p2ScoreText.paint(p2ScoreTextStyle = generateScoreStyle(3,++p2Score));
		}
	}

	//resets the puck to the center and gives it a random velocity
	function resetPuck() {
		puckPosX 	= 0;
		puckPosY 	= 0;
		puckvx		= getRand(10,15);
		puckvy		= getRand(5,10);
	}

	//Animatron player declarations
	var b = Builder._$, C = anm.C;
	anm.M[C.MOD_COLLISIONS].predictSpan = 1/150 //smaller means more concise at higher speeds
												//but might defeat the purpose

	//canvas size
	const WIDTH = 800, HEIGHT = 450;
	//reference to canvas
	var canvas = document.getElementById('game-canvas');

	var defaultPos = [0,0];

	//puck attributes
	var puckPosX 	= WIDTH/2;
	var puckPosY 	= HEIGHT/2;
	var puckvx		= getRand(10,15);
	var puckvy		= getRand(5,10);

	var puckRadius 	= 14;
	var speedMultiplier = 1.001;

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
	var p1Score = 0, p2Score = 0;

	//tracks mouse location and moves the bar accordingly
	var barMovementMod = function(t) {
		var newPos = mousePos.y;
		newPos = Math.max(minY, Math.min(newPos, maxY)); //clamping
		this.y = newPos-p1posY;
		//this.y = -t * 35;
	}

	var puckMovementMod = function(t) {		
		puckPosX += puckvx * dt;
		puckPosY += puckvy * dt;
		this.x = puckPosX;
		this.y = puckPosY;

		// Check for top or bottom wall hit
		if (puckPosY - puckRadius < -HEIGHT/2 || puckPosY + puckRadius > HEIGHT/2) {
			puckPosY = puckPosY - puckRadius < -HEIGHT/2 ? -HEIGHT/2 + puckRadius : HEIGHT/2 - puckRadius; 
			puckvy *= -speedMultiplier;
			puckvx *= speedMultiplier;
		}

		// Check left or right wall (point scored)
		if (puckPosX - puckRadius < -WIDTH/2) {
			addPoint(1);
			resetPuck()

		} else if (puckPosX + puckRadius > WIDTH/2) {
			addPoint(2);
			resetPuck()
		}
		
	}
	var player1 = b('player1'), player2 = b('player2'), puck = b('puck');
	var p1ScoreText = b('p1ScoreText'), p2ScoreText = b('p2ScoreText');

	function generateScoreStyle(location,text) {
		return  function(ctx) {
			      ctx.fillStyle = '#444';
			      ctx.font = '30pt sans-serif';
			      ctx.fillText(text, WIDTH*location/4, 50);
				}
	}
	var p1ScoreTextStyle, p2ScoreTextStyle;
	//initialize and begin
	var scene = b('scene')
					.fill("#000")
				    .add(
				 		player1.rect([p1posX,p1posY], [barWidth,barHeight])
						   	   .fill('#000')
				   			   .modify(barMovementMod))
				    .add(
						player2.rect([p2posX,p2posY], [barWidth,barHeight])
					   		   .fill('#000')
			    			   .modify(barMovementMod))
				    .add(
						puck.circle([puckPosX,puckPosY], puckRadius)
		  		   		    .fill('#000')
						    .modify(puckMovementMod))
				    .add(
					    p1ScoreText.paint(p1ScoreTextStyle = generateScoreStyle(1,p1Score)))
				    .add(
					    p2ScoreText.paint(p2ScoreTextStyle = generateScoreStyle(3,p2Score)));

	puck.modify(function(t) {
		     this.$.collides(player1.v, function() {
		     	//puckPosX = -WIDTH/2 + barOffset + barWidth;
		     	puckvx *= -speedMultiplier;
				puckvy *= speedMultiplier;
		         console.log("p1collision");
		     })
		  })
		 .modify(function(t) {
		     this.$.collides(player2.v, function() {
		     	puckvx *= -speedMultiplier;
				puckvy *= speedMultiplier;
		         console.log("p2collision");
		     })
		  });
	puckPosX = 0; 
	puckPosY = 0;

	createPlayer('game-canvas', {
		//"debug"  : true,
		"mode" : C.M_DYNAMIC,
		"anim" : {
			"fps": 50, //doesn't actually work
			"width" : WIDTH,
			"height" : HEIGHT,
			"bgfill" : { color : "#FFF" }	
		} 
	})
		.load(scene)
		.play();
}