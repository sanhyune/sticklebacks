// https://p5play.org

let player, friend, shark, groundSensor, grass, water, sausages;
let grassImg, waterImg, sausagesImg, charactersImg;
let HP = 5;
let sausage = 0;
let dialogueActive = false;
let dialogueLines = [
  "Hey! You found me!",
  "Watch out for the lava ahead...",
  "Collect all the sausages to win!",
  "Good luck out there!"
];
let dialogueLine = 0;
let friendTalked = false;

function preload() {
	grassImg = loadImage('grass.png');
	waterImg = loadImage('water.png');
	sausagesImg = loadImage('sausages.png');
	lavaImg = loadImage('lava.png');
	charactersImg = loadImage('sticklebacks.png');
	sharkImg = loadImage('shark.gif')
}

function setup() {
	new Canvas(300, 160, 'pixelated');
	world.gravity.y = 10;
	allSprites.pixelPerfect = true;
	pixelDensity(1);


	/*/ Scale the canvas to fill the window with CSS
	let cnv = document.querySelector('canvas');
	cnv.style.width = '100vw';
	cnv.style.height = '100vh';
	cnv.style.objectFit = 'contain';
	cnv.style.imageRendering = 'pixelated';
	cnv.style.display = 'block';
	cnv.style.margin = '0 auto';
	document.body.style.margin = '0';
	document.body.style.background = 'black';
	document.body.style.overflow = 'hidden';*/

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
	sausages.addAni({ w: 16, h: 16, row: 0, frames: 11 });
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
		8, 8, 16, 16
	);

	player = new Sprite(48, 100, 12, 12);
	player.layer = 1;
	player.anis.w = 16;
	player.anis.h = 16;
	player.anis.offset.y = 1;
	player.anis.frameDelay = 8;
	player.spriteSheet = charactersImg;
	player.addAnis({
		idle:      { row: 0, frames: 4 },
		knockback: { row: 0, frames: 1 },
		run:       { row: 0, frames: 4 },
		jump:      { row: 1, col: 3, frames: 2 }
	});
	player.ani = 'idle';
	player.rotationLock = true;
	player.friction = 0;
	player.overlaps(sausages, collectSausage);

	friend = new Sprite(200, 100, 12, 12);
	friend.layer = 1;
	friend.anis.w = 16;
	friend.anis.h = 16;
	friend.anis.offset.y = 1;
	friend.anis.frameDelay = 8;
	friend.spriteSheet = charactersImg;
	friend.addAnis({
		idle:      { row: 1, frames: 4 },
		knockback: { row: 0, frames: 1 },
		run:       { row: 0, frames: 4 },
		jump:      { row: 1, col: 3, frames: 2 }
	});
	friend.ani = 'idle';
	friend.rotationLock = true;

	shark = new Sprite(300, 130);
	shark.ani = sharkImg;
	shark.rotationLock = true;
	shark.anis.offset.y = 1;

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
	if (dialogueActive && key === 'Enter') {
		dialogueLine++;
		if (dialogueLine >= dialogueLines.length) {
			dialogueActive = false;
			dialogueLine = 0;
		}
	}
}

function draw() {
	background('skyblue');

	// --- Dialogue trigger ---
	if (player.overlapping(friend)) {
		if (!friendTalked) {
			dialogueActive = true;
			friendTalked = true;
			dialogueLine = 0;
		}
	} else {
		friendTalked = false;
	}

	// --- Water/lava drag (always applies) ---
	if (groundSensor.overlapping(water) || groundSensor.overlapping(lava)) {
		player.drag = 20;
		player.friction = 35;
	} else {
		player.drag = 0;
		player.friction = 0;
	}

	// --- Movement: fully blocked during dialogue ---
	if (dialogueActive) {
		// Hard stop the player
		player.vel.x = 0;
		player.vel.y = Math.max(player.vel.y, 0); // still allow gravity
		player.ani = 'idle';
	} else {
		if (groundSensor.overlapping(grass) || groundSensor.overlapping(water) || groundSensor.overlapping(shark)) {
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
	}

	// --- Fall / lava damage ---
	if (player.y > 400 || player.colliding(lava)) {
		player.speed = 0;
		player.x = 100;
		player.y = 100;
		HP--;
	}

	// --- Win / Lose ---
	if (sausage >= 10) gamewin();
	if (HP <= 0) gameover();

	function gamewin() {
		background('black');
		textAlign(CENTER);
		fill(255);
		textSize(12);
		text('YOU HAVE WON! / SAUSAGES COLLECTED: ' + sausage, 150, 80);
		player.speed = 0;
		water.visible = false;
		sausages.visible = false;
		grass.visible = false;
		lava.visible = false;
		camera.x = player.x;
	}

	function gameover() {
		background('black');
		textAlign(CENTER);
		fill(255);
		textSize(12);
		text('GAME OVER / SAUSAGES COLLECTED: ' + sausage, 150, 80);
		player.speed = 0;
		water.visible = false;
		sausages.visible = false;
		grass.visible = false;
		lava.visible = false;
		camera.x = player.x;
	}

	camera.x = player.x + 52;
	/*let borderx = -300
	if (camera.x < 150) camera.x = 150;
	if (camera.x > borderx) camera.x = borderx;*/

	// --- HUD + dialogue in screen space ---
	push();
	resetMatrix();
	let s = width / 300;
	scale(s);

	// HUD
	fill(255);
	noStroke();
	textSize(12);
	textAlign(LEFT);
	text('Sausage: ' + sausage, 6, 25);
	text('HP: ' + HP, 6, 13);

	// Dialogue box
	if (dialogueActive) drawDialogue();

	pop();
}