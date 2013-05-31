function initPong(ws) {
	/**********************CONSTANTS/GLOBAL VARS**********************/
	//change in time between frames
	const dt = 50/60; //50fps
	//how far ahead the player looks for collisions
	const PREDICT_SPAN = 1/75;
	const SENTINEL = Math.pow(2,32) - 1;
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
	//const defaultSpeedMult = 1.06;
	const defaultSpeedMult = 1;
	const MAX_BOUNCE_ANGLE = Math.PI/3; //60 degrees

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
		puckvx		= getRand(15,2);
		//puckvx		= getRand(1,2);
		puckvy		= getRand(1,5);
		//puckvy		= getRand(0,0);
	}

	//bounces the puck and if the puck would get stuck, moves it out or lets the goal in
	//direction: 'top', 'bottom', 'left', 'right'
	//t: the elapsed time from the beginning of the match
	function bouncePuck(direction,t,player) {
		switch(direction) {
			case 'top':
				puckPosY = -HEIGHT/2 + puckRadius;
			case 'bottom':
				if (direction == 'bottom') puckPosY = HEIGHT/2 - puckRadius; //doesn't re-assign if falling through from 'top'
				puckvy *= -speedMultiplier;
				puckvx *= speedMultiplier;
				break;
			case 'left':
				var frontOfPaddleX = -WIDTH/2+paddleOffset+paddleWidth;
				var frontOfPuckX = puckPosX-puckRadius;
				if(frontOfPuckX < frontOfPaddleX /*&& (frontOfPuckX > frontOfPaddleX-puckRadius/2)*/) {
					//puck must be AT MOST 1/4th past paddle front
					puckPosX = frontOfPaddleX+puckRadius+1;
					adjustVelocity(1,player);
				}
				break;
			case 'right':
				var frontOfPaddleX = WIDTH/2-paddleOffset-paddleWidth;
				var frontOfPuckX = puckPosX+puckRadius;
				if(frontOfPuckX > frontOfPaddleX /*&& (frontOfPuckX < frontOfPaddleX+puckRadius/2)*/) { 
					//puck must be at most 1/4th past paddle front
					puckPosX = frontOfPaddleX-puckRadius-1;
					adjustVelocity(2,player);
				}
				break;
			default:
				break;
		}
	}

	//adjusts and reverses the velocity based on where the hit occurred on the paddle
	//Precondition: puck should have collided with paddle and deemed bouncable
	function adjustVelocity(playerNum,player) {
		var paddleY = player.y;
		var relIntersect = (paddleY - puckPosY) / (paddleHeight/2); //distance of ball center from paddle center
		var bounceAngle = -relIntersect * MAX_BOUNCE_ANGLE;
		var curBallSpeed = Math.sqrt(Math.pow(puckvx,2) + Math.pow(puckvy,2)); //a^2+b^2=c^2
		if(playerNum == 2) bounceAngle = Math.PI - bounceAngle; //reverse direction
		puckvx = curBallSpeed*Math.cos(bounceAngle);
		puckvy = curBallSpeed*Math.sin(bounceAngle);
		//speedMultiplier deprecated for now (set at 1)
		puckvx *= speedMultiplier;
		puckvy *= speedMultiplier;
		//adjust speed multiplier based on time
		//var elapsed = t-tLastPoint;
		//if(elapsed>1) speedMultiplier -= 0.01/elapsed;
		//speedMultiplier = Math.max(1.001, speedMultiplier); //clamp it
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
	var	puckvx		= getRand(15,2);
	var	puckvy		= getRand(1,5);
	var puckRadius 	= 14;

	//paddle attributes
	var paddleWidth 	= 14;
	var paddleHeight 	= 80;
	var paddleOffset 	= 10; //offset from edge
	var p1posY 		= HEIGHT/2;
	var p1posX 		= paddleOffset + paddleWidth/2;
	var p2posY 		= HEIGHT/2;
	var p2posX 		= WIDTH - paddleOffset - paddleWidth/2; //all assumes upper right corner as root
	var minY		= paddleHeight/2;
	var maxY		= HEIGHT - paddleHeight/2;
	

	/**************************MODIFIERS**************************/

	//tracks mouse location and moves the paddle accordingly
	var paddleMovementMod = function(t) {
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
	anm.M[C.MOD_COLLISIONS].predictSpan = PREDICT_SPAN //smaller means more concise at higher speeds
												//but might defeat the purpose

	var player1 = b('player1'), player2 = b('player2'), puck = b('puck');
	var overlay = b("overlay").rect([WIDTH/2, HEIGHT/2], [WIDTH, HEIGHT])
				              .fill(overlayColor)
				              .alpha([0,SENTINEL],[.7,.7])
				              
	var overlayButton = b("overlayButton")
							.rect([WIDTH/2, HEIGHT/2], [200, 100])
							.fill(overlayButtonColor)
							.paint(function(ctx) {
								ctx.fillStyle = '#222';
								ctx.font = '30pt sans-serif';
								ctx.fillText("START", -100+35, 0+15);
							})
							.on(C.X_MCLICK, function(evt,t) {
								overlay.alpha([t,t+1], [.7,0])
								overlay.alpha([t+1,SENTINEL], [0,0])
								//overlay.disable();
								overlayButton.disable();
								//hide cursor
								document.getElementById('game-canvas').style.cursor = 'none';
								startGame(t);
							});

	var scene = b('scene')
				    .add(
				 		player1.rect([p1posX,p1posY], [paddleWidth,paddleHeight])
						   	   .fill(player1Color))
				    .add(
						player2.rect([p2posX,p2posY], [paddleWidth,paddleHeight])
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
		     	bouncePuck('left',t,player1.v.state);
		        //TODO: send new vector
		     })
		  })
		 .modify(function(t) {
		     this.$.collides(player2.v, function() {
		     	bouncePuck('right',t,player2.v.state);
		        //TODO: send new vector
		     })
		  });
	puckPosX = 0; 
	puckPosY = 0;

	//make the game only check the inner-facing wall for collisions
	player1.v.reactAs(Builder.path([[paddleWidth/2,-paddleHeight/2],[paddleWidth/2,paddleHeight/2]]));
	player2.v.reactAs(Builder.path([[-paddleWidth/2,-paddleHeight/2],[-paddleWidth/2,paddleHeight/2]]));


	var pong = createPlayer('game-canvas', {
		"debug"  : true,
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
		player1.modify(paddleMovementMod);
		player2.modify(paddleMovementMod);
		//set current time to start time
		tLastPoint = t;
	}

	return pong;
}