// https://p5play.org

let player, friend, groundSensor, grass, water, sausages;
let grassImg, waterImg, sausagesImg, charactersImg;
let HP = 3;
let sausage = 0;
// --- Dialogue system ---
let dialogueActive = false;
let dialogueLines = [
  "Hey! You found me!",
  "Watch out for the lava ahead...",
  "Collect all the sausages to win!",
  "Good luck out there!"
];
let dialogueLine = 0;
let friendTalked = false; // so dialogue only triggers once per approach


function preload() {
	grassImg = loadImage('grass.png');
	waterImg = loadImage('water.png');
	sausagesImg = loadImage('sausages.png');
	lavaImg = loadImage('lava.png')
	charactersImg = loadImage('sticklebacks.png');
}


function setup() {

	if (keyIsDown(13) === true && TimeElapsed < 3773) {
		TimeElapsed = 10
		start()
	}	
	
	new Canvas(300, 160, 'pixelated');
	world.gravity.y = 10;
	allSprites.pixelPerfect = true;

	grass = new Group();
	grass.layer = 0;
	grass.collider = 'static';
	grass.img = grassImg;
	grass.tile = 'g';

	water = new Group();
	water.layer = 2;
	water.collider = 'static';
	water.img = waterImg;
	water.h = 8;
	water.tile = 'w';

	lava = new Group();
	lava.layer = 2;
	lava.collider = 'static';
	lava.img = lavaImg;
	lava.h = 8;
	lava.tile = 'v';

	sausages = new Group();
	sausages.collider = 'static';
	sausages.spriteSheet = sausagesImg;
	sausages.addAni({
		w: 16,
		h: 16,
		row: 0,
		frames: 11
	});
	sausages.tile = 'c';

	new Tiles(
		[
			'cc',
			'gg                                     g',
			' ',
			'   gg',
			'       c                        c  g',
			'      ggg    c                  g',
			'            ggg             g                 ccc',
			'                                              ccc',
			'     c c c       c c                          ccc                       cccccccccccccccccccccccc',
			'gggggggggggwwwwwggggg  gggggvvvvvvvvvvvvvggg  ggg    gggggggggggggggggggggggggggggggggggggggggggggggggggggggg'
		],
		8,
		8,
		16,
		16
	);

	player = new Sprite(48, 100, 12, 12);
	player.layer = 1;
	player.anis.w = 16;
	player.anis.h = 16;
	player.anis.offset.y = 1;
	player.anis.frameDelay = 8;
	player.spriteSheet = charactersImg;
	player.addAnis({
		idle: {
			row: 0,
			frames: 4
		},
		knockback: {
			row: 0,
			frames: 1
		},
		run: {
			row: 0,
			frames: 4
		},
		jump: {
			row: 1,
			col: 3,
			frames: 2
		}
	});
	player.ani = 'idle';
	player.rotationLock = true;

	friend = new Sprite(200, 100, 12, 12);
	friend.layer = 1;
	friend.anis.w = 16;
	friend.anis.h = 16;
	friend.anis.offset.y = 1;
	friend.anis.frameDelay = 8;
	friend.spriteSheet = charactersImg;
	friend.addAnis({
		idle: {
			row: 1,
			frames: 4
		},
		knockback: {
			row: 0,
			frames: 1
		},
		run: {
			row: 0,
			frames: 4
		},
		jump: {
			row: 1,
			col: 3,
			frames: 2
		}
	});
	friend.ani = 'idle';
	friend.rotationLock = true;

	// IMPORTANT! prevents the player from sticking to the sides of walls
	player.friction = 0;

	player.overlaps(sausages, collectSausage);

	// This groundSensor sprite is used to check if the player
	// is close enough to the ground to jump. But why not use
	// `player.colliding(grass)`? Because then the player could
	// jump if they were touching the side of a wall!
	// Also the player's collider bounces a bit when it hits
	// the ground, even if its bounciness is set to 0. When
	// making a platformer game, you want the player to 
	// be able to jump right after they land.
	// This approach was inspired by this tutorial:
	// https://www.iforce2d.net/b2dtut/jumpability
	groundSensor = new Sprite(48, 106, 6, 12, 'n');
	groundSensor.visible = false;
	groundSensor.mass = 0.01;

	let j = new GlueJoint(player, groundSensor);
	j.visible = false;

	textAlign(CENTER);
}

function collectSausage(player, sausages) {
	sausages.remove();
	sausage++;
}

// Draw the dialogue box using p5's 2D drawing (in screen space)
function drawDialogue() {
	// Position box near bottom of screen, always in screen coords
	let bx = 90, by = 25, bw = 200, bh = 45;

	// Semi-transparent dark box
	noStroke();
	fill(0, 0, 0, 180);
	rect(bx, by, bw, bh, 4);

	// White border
	stroke(255);
	strokeWeight(1);
	noFill();
	rect(bx, by, bw, bh, 4);

	// Dialogue text
	noStroke();
	fill(255);
	textAlign(LEFT);
	textSize(10);
	text(dialogueLines[dialogueLine], bx + 8, by + 14, bw - 16, bh - 10);

	// "Press Z" prompt
	textAlign(RIGHT);
	fill(200, 200, 100);
	text('[ENTER] next', bx + bw - 6, by + bh - 5);
	textAlign(CENTER); // reset
}

function keyPressed() {
	// Advance or close dialogue with Z key
	if (dialogueActive && (key === 'Enter' || key === 'Enter')) {
		dialogueLine++;
		if (dialogueLine >= dialogueLines.length) {
			dialogueActive = false;
			dialogueLine = 0;
		}
	}
}

function draw() {
	background('skyblue');
	fill(255);

	text('Sausage: ' + sausage, 47, 32);
	text('HP: ' + HP, 31, 20);

	// --- Check if player touches friend and open dialogue ---
	if (player.overlapping(friend)) {
		if (!friendTalked) {
			dialogueActive = true;
			friendTalked = true;
			dialogueLine = 0;
		}
	} else {
		// Allow dialogue to trigger again next time they meet
		friendTalked = false;
	}
	
	if (!dialogueActive) {
		// make the player slower in water/lava
		if (groundSensor.overlapping(water) || groundSensor.overlapping(lava)) {
			player.drag = 20;
			player.friction = 35;
		} else {
			player.drag = 0;
			player.friction = 0;
		}
	}
	
	// make the player slower in water
	if (groundSensor.overlapping(water) ||
		groundSensor.overlapping(lava)) {
		player.drag = 20;
		player.friction = 35;
	} else {
		player.drag = 0;
		player.friction = 0;
	}

	if (groundSensor.overlapping(grass) ||
		groundSensor.overlapping(water)) {
		if (kb.presses('up') || kb.presses('space')) {
			player.ani = 'jump';
			player.vel.y = -4.5;
		}
	}

	if (kb.pressing('left')) {
		player.ani = 'run';
		player.vel.x = -1.5;
		player.mirror.x = true;
	} else if (kb.pressing('right')) {
		player.ani = 'run';
		player.vel.x = 1.5;
		player.mirror.x = false;
	} else {
		player.ani = 'idle';
		player.vel.x = 0;
	}

	// if player falls, reset them
	if ((player.y > 400) ||
		player.colliding(lava)) {
		player.speed = 0;
		player.x = 100;
		player.y = 100;
		HP = HP - 1
	}

	if (sausage == 10) {
		gamewin()
	}

	function gamewin() {
		textAlign(CENTER);
		background('black')
		text('YOU HAVE WON THE GAME! / FINAL SCORE: ' + sausage, 140, 60);
		player.speed = 0
		water.visible = false
		sausages.visible = false
		grass.visible = false
		lava.visible = false
		camera.x = player.x
	}

	if (HP == 0) {
		gameover()
	}

	function gameover() {
		textAlign(CENTER);
		background('black')
		text('GAMEOVER / FINAL SCORE: ' + sausage, 140, 60);
		player.speed = 0
		water.visible = false
		sausages.visible = false
		grass.visible = false
		lava.visible = false
		camera.x = player.x
	}

	camera.x = player.x + 52;

		// Draw dialogue on top (in screen space, after camera is set)
	if (dialogueActive) {
		push();
		resetMatrix();
		let s = width / 300; // scale factor based on canvas size
		scale(s);
		drawDialogue();
		pop();
	}
}