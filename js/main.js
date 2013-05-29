window.addEventListener("load", function() {
	//Animatron player declarations
	var b = Builder._$, C = anm.C;

	//canvas size
	const WIDTH = 800, HEIGHT = 450;

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
						   .fill('#000'));

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