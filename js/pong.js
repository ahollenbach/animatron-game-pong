function initPong(ws) {
	/**********************CONSTANTS/GLOBAL VARS**********************/
	//change in time between frames
	const dt = 50/60; //50fps
	//canvas size
	const WIDTH = 800, HEIGHT = 450;
	//reference to canvas
	var canvas = document.getElementById('game-canvas');
	const defaultPos = [0,0];
	var b = Builder._$, C = anm.C;
	//time the last point was scored
	var tLastPoint = 0;

	/**************************MOUSE MOVEMENT**************************/
	//save the current mouse position for reference
	var mousePos = { x: 0, y: 0};

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


	/**************************PUCK PHYSICS**************************/
	//default speed multiplier for ball
	const defaultSpeedMult = 1.06;

	var speedMultiplier = defaultSpeedMult;

	//gets random velocity between lower and lower+range,
	//result is randomly positive or negative
	function getRand(lower, range) {
		return (Math.floor(Math.random() * range) + lower) * (Math.random() > .5 ? 1 : -1);
	}

	//resets the puck to the center and gives it a random velocity
	function resetPuck() {
		puckPosX 	= 0;
		puckPosY 	= 0;
		puckvx		= getRand(10,2);
		puckvy		= getRand(1,5);
		console.log(puckvx,puckvy);
	}

	//bounces the puck (currently does not move puck out of paddle collisions)
	//direction: 'top', 'bottom', 'left', 'right'
	//t: the elapsed time from the beginning of the match
	function bouncePuck(direction,t) {
		switch(direction) {
			case 'top':
				puckPosY = -HEIGHT/2 + puckRadius;
			case 'bottom':
				if (direction == 'bottom') puckPosY = HEIGHT/2 - puckRadius; //doesn't re-assign if falling through from 'top'
				puckvy *= -speedMultiplier;
				puckvx *= speedMultiplier;
				break;
			case 'left':
				//puckPosX = -WIDTH/2 + barOffset + barWidth;
		     	//TODO: when hitting puck from side, puck gets stuck in paddle
			case 'right':
				puckvx *= -speedMultiplier;
				puckvy *= speedMultiplier;
				break;
			default:
				break;
		}
		//adjust speed multiplier based on time
		var elapsed = t-tLastPoint;
		if(elapsed>1) speedMultiplier -= 0.01/elapsed;
		speedMultiplier = Math.max(1.001, speedMultiplier); //clamp it
		//console.log(speedMultiplier);
		//TODO: send the new vector
	}


	/**************************GAME DATA**************************/
	var p1Score = 0, p2Score = 0;

	//adds a point to the player's score
	//t: the elapsed time
	function addPoint(playerNum,t) {
		//TODO: send score here
		if(playerNum == 1) {
			p1ScoreText.unpaint(p1ScoreTextStyle);
			p1ScoreText.paint(p1ScoreTextStyle = generateScoreStyle(1,++p1Score));
		} else {
			p2ScoreText.unpaint(p2ScoreTextStyle);
			p2ScoreText.paint(p2ScoreTextStyle = generateScoreStyle(3,++p2Score));
		}
		tLastPoint = t;
		speedMultiplier = defaultSpeedMult;
	}

	
	/**************************GAME ATTRIBUTES**************************/
	//puck attributes
	var puckPosX 	= WIDTH/2;
	var puckPosY 	= HEIGHT/2;
	var	puckvx		= getRand(10,2);
	var	puckvy		= getRand(1,5);
	var puckRadius 	= 14;

	//bar (paddle) attributes
	var barWidth 	= 14;
	var barHeight 	= 80;
	var barOffset 	= 10; //offset from edge
	var p1posY 		= HEIGHT/2;
	var p1posX 		= barOffset + barWidth/2;
	var p2posY 		= HEIGHT/2;
	var p2posX 		= WIDTH - barOffset - barWidth/2; //all assumes upper right corner as root
	var minY		= barHeight/2;
	var maxY		= HEIGHT - barHeight/2;
	

	/**************************MODIFIERS**************************/

	//tracks mouse location and moves the bar accordingly
	var barMovementMod = function(t) {
		var newPos = mousePos.y;
		newPos = Math.max(minY, Math.min(newPos, maxY)); //clamping
		this.y = newPos-p1posY;
		//ws.send(JSON.stringify({ type : "paddleLocation", data : { yCoord : this.y } }));
		//TODO: send paddle location data
	}

	var puckMovementMod = function(t) {		
		puckPosX += puckvx * dt;
		puckPosY += puckvy * dt;
		this.x = puckPosX;
		this.y = puckPosY;

		// Check for top or bottom wall hit
		if (puckPosY - puckRadius < -HEIGHT/2) {
			bouncePuck('top',t);
		} else if(puckPosY + puckRadius > HEIGHT/2) {
			bouncePuck('bottom',t);
		}

		// Check left or right wall (point scored)
		if (puckPosX - puckRadius < -WIDTH/2 || puckPosX + puckRadius > WIDTH/2) {
			if(puckPosX - puckRadius < -WIDTH/2) addPoint(1,t);
			else addPoint(2,t);
			resetPuck();
		}
	}


	/**************************APPEARANCE/SCORE FORMATTING**************************/
	var player1Color 		= '#BB0000';
	var player2Color 		= '#0088BB';
	var puckColor 	 		= '#000';
	var overlayColor 		= '#000';
	var overlayButtonColor 	= '#EEE';

	var p1ScoreText = b('p1ScoreText'), p2ScoreText = b('p2ScoreText');

	function generateScoreStyle(location,text) {
		return  function(ctx) {
			      ctx.fillStyle = '#444';
			      ctx.font = '30pt sans-serif';
			      ctx.fillText(text, WIDTH*location/4, 50);
				}
	}
	var p1ScoreTextStyle, p2ScoreTextStyle;
	

	/**************************SCENE CREATION**************************/
	//Animatron player declarations
	anm.M[C.MOD_COLLISIONS].predictSpan = 1/150 //smaller means more concise at higher speeds
												//but might defeat the purpose

	var player1 = b('player1'), player2 = b('player2'), puck = b('puck');
	var overlay = b("overlay").rect([WIDTH/2, HEIGHT/2], [WIDTH, HEIGHT])
				              .fill(overlayColor)
				              .modify(function(t) { this.alpha = 0.7; })
	var overlayButton = b("overlayButton")
							.rect([WIDTH/2, HEIGHT/2], [200, 100])
							.fill(overlayButtonColor)
							.paint(function(ctx) {
								ctx.fillStyle = '#222';
								ctx.font = '30pt sans-serif';
								ctx.fillText("START", -100+35, 0+15);
							})
							.on(C.X_MCLICK, function(evt,t) {
								overlay.disable();
								overlayButton.disable();
								//hide cursor
								document.getElementById('game-canvas').style.cursor = 'none';
								startGame(t);
							});

	var scene = b('scene')
				    .add(
				 		player1.rect([p1posX,p1posY], [barWidth,barHeight])
						   	   .fill(player1Color))
				    .add(
						player2.rect([p2posX,p2posY], [barWidth,barHeight])
					   		   .fill(player2Color))
				    .add(
						puck.circle([puckPosX,puckPosY], puckRadius)
		  		   		    .fill(puckColor))
				    .add(
					    p1ScoreText.paint(p1ScoreTextStyle = generateScoreStyle(1,p1Score)))
				    .add(
					    p2ScoreText.paint(p2ScoreTextStyle = generateScoreStyle(3,p2Score)));

	puck.modify(function(t) {
		     this.$.collides(player1.v, function() {
		     	bouncePuck('left',t);
		        //TODO: send new vector
		     })
		  })
		 .modify(function(t) {
		     this.$.collides(player2.v, function() {
		     	bouncePuck('right',t);
		        //TODO: send new vector
		     })
		  });
	puckPosX = 0; 
	puckPosY = 0;

	var pong = createPlayer('game-canvas', {
		//"debug"  : true,
		"mode" : C.M_DYNAMIC,
		"anim" : {
			"fps": 50, //doesn't actually work
			"width" : WIDTH,
			"height" : HEIGHT,
			"bgfill" : { color : "#FFF" }
		} 
	}).load(scene);
	scene.add(overlay);
	scene.add(overlayButton);
	//TODO: only start game when "play" has been hit
	pong.play();

	function startGame(t) {
		//add all the modifiers (puts game into effect)
		puck.modify(puckMovementMod);
		player1.modify(barMovementMod);
		player2.modify(barMovementMod);
		//set current time to start time
		tLastPoint = t;
	}

	return pong;
}