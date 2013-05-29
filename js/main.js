window.addEventListener("load", function() {
	//Animatron player declarations
	var b = Builder._$, C = anm.C;

	//canvas size
	const WIDTH = 800, HEIGHT = 450;

	var defaultPos = [0,0];

	//puck attributes
	var puckPosX 	= 0;
	var puckPosY 	= 0;
	var puckRadius 	= 10;

	//bar attributes
	var barWidth 	= 14;
	var barHeight 	= 80;
	var barOffset 	= 10; //offset from edge
	var p1posY 		= 0;
	var p1posX 		= barOffset;
	var p2posY 		= 0;
	var p2posX 		= WIDTH - barOffset - barWidth/2; //all assumes upper right corner as root

	//initialize and begin
	var scene = b().add(
						b().circle([puckPosX, puckPosY], puckRadius)
				  		   .fill('#FFF'))
				   .add(
				 		b().rect([p1posX, p1posY], [barWidth,barHeight])
						   .fill('#FFF'))
				   .add(
						b().rect([p2posX, p2posY], [barWidth,barHeight])
						   .fill('#FFF'));

	createPlayer('game-canvas', { 
		"mode" : C.M_DYNAMIC,
		"anim" : {
			"width" : WIDTH,
			"height" : HEIGHT,
			"bgfill" : { color : "#000" }
		} 
	})
		.load(scene)
		.play();
});