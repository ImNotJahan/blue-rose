/* 
Facing | North: 0, East: 1, South: 2, West: 3
*/

// References
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false; // Since a bit pixelated, this looks better

// Events
function getCursorPosition(canvas, event) {
	const rect = canvas.getBoundingClientRect();
	mousePosition.x = event.clientX - rect.left;
	mousePosition.y = event.clientY - rect.top;
}

canvas.addEventListener('mousedown', function(e) {
	getCursorPosition(canvas, e);
	leftClick = true;
});

// Sounds
const safeBeep = new Sound("sounds/safeBeep.mp3");
const safeSuccess = new Sound("sounds/safeSuccess.mp3");
const safeFail = new Sound("sounds/safeFail.mp3");
const keyTurned = new Sound("sounds/keyTurned.wav");
const writing = new Sound("sounds/writing.wav");
const paperSlide = new Sound("sounds/paperSlide.wav");
const latch = new Sound("sounds/latch.wav");
const doorknobTurn = new Sound("sounds/doorknob.mp3")

// Temporary storage
const room = {facing:0, zoom: "", look: function(left){
		if(room.zoom !== ""){
			room.zoom = "";
			return;
		}

		if(left) this.facing--;
		else this.facing++;

		this.facing = mod(this.facing, 4);
	},
	pause: function(){
		room.zoom = "pause";
	}};
let player = {inventory:[undefined, undefined, undefined, undefined, undefined, undefined], selected:""};
let mousePosition = {x:0, y:0};
let leftClick = true;
let components = [];
let slotApx = 0;
let code = "";
let clickHeat = 2;
let doorUnlocked = false;

let scale = 1;

const backgrounds = ["clock", "desk", "door", "door-bottom", "dresser",
"man", "open-dresser", "openedDoor", "openedSafe", "safe", "start0",
"start1", "start2", "start3", "window-day", "window-night"];

// Objects
new Component(640, 360, "images/backgrounds/start0", 0, 0, 1, {updated: backgroundCheck});
new Component(40, 40, "images/ui/arrows/left", 40, 160, 4, {clicked: function(){room.look(true)}});
new Component(40, 40, "images/ui/arrows/right", 560, 160, 4, {clicked: function(){room.look(false)}});
new Component(40, 40, "images/ui/hint/hint", 600, 0, 4, {clicked: hintButton});

new RoomComponent(54, 10, "images/objects/empty", 471, 309, 1, "window-day", 0, {clicked: windowInteract})
new RoomComponent(54, 10, "images/objects/empty", 471, 309, 1, "window-night", 0, {clicked: windowInteract})

slotApx = components.length;

// Draw inventory slots
for(let k = 0; k < 6; k++){
	new Component(50, 50, "images/ui/slot", 90 + 80 * k, 300, 1, {});
}

const smallWindow = new RoomComponent(100, 75, "images/objects/window", 270, 120, 1, "", 0, {clicked: handleWindow, updated: lightOrDarkWindow}); // Window
new RoomComponent(354, 300, "images/objects/empty", 221, 42, 1, "open-dresser", 0, {}); // Open dresser
new RoomComponent(213, 300, "images/objects/empty", 221, 42, 1, "dresser", 0, {zoomOn: "open-dresser"}); // Closeup dresser
new RoomComponent(100, 100, "images/objects/empty", 200, 200, 1, "", 0, {zoomOn: "dresser"}); // Dresser
new RoomComponent(50, 50, "images/objects/empty", 295, 60, 1, "", 2, {zoomOn: "clock"}); // Clock
const smallClockHandle = new RoomComponent(17, 17, "images/objects/clockHands/smallHand", 314, 79, 1, "", 2, {})
new RoomComponent(100, 117, "images/objects/empty", 268, 96, 1, "", 3, {zoomOn: "door"}); // Door
new RoomComponent(100, 83, "images/objects/empty", 268, 213, 1, "", 3, {zoomOn: "door-bottom"}); // Door bottom
new ItemComponent(55, 33, "images/objects/book", 294, 264, 1, "open-dresser", 0, {}); // Book
new RoomComponent(50, 50, "images/objects/empty", 150, 250, 1, "", 1, {zoomOn: "goatSkull"}); // Goat skull
new RoomComponent(100, 100, "images/objects/empty", 260, 210, 1, "", 2, {zoomOn: "safe"}); // Safe
new RoomComponent(150, 100, "images/objects/empty", 250, 200, 1, "", 1, {zoomOn: "desk"}); // Desk
new ItemComponent(132, 215, "images/objects/paper", 125, 107, 1, "desk", 1, {}); // Paper
new ItemComponent(57, 57, "images/objects/pen", 400, 140, 1, "desk", 1, {}); // Pen
new RoomComponent(306, 11, "images/objects/empty", 177, 290, 1, "door-bottom", 3, {parameterClicked: eyesInteract}); // Eyes at bottom of door
new RoomComponent(214, 73, "images/objects/empty", 121, 200, 1, "safe", 2, {clicked: pulledLever}); // Safe lever
new ItemComponent(25, 20, "images/objects/doorKey", 234, 292, 1, "openedSafe", 2, {}); // Door key
new RoomComponent(16, 21, "images/objects/empty", 126, 242, 1, "door", 3, {clicked: unlockDoor}); // Keyhole
new RoomComponent(32, 31, "images/objects/empty", 119, 208, 1, "door", 3, {clicked: turnDoorknob}); // Doorknob
new RoomComponent(373, 360, "images/objects/empty", 122, 0, 1, "openedDoor", 3, {clicked: function() {interval = setInterval(fade, 25, "man");}}); // Man
new RoomComponent(260, 90, "images/objects/empty", 150, 140, 1, "clock", 2, {clicked: clickedClock}); //Clock body
const clockHandle = new RoomComponent(37, 37, "images/objects/clockHands/hand", 315, 139, 1, "clock", 2, {init: clockHandInit});
new RoomComponent(640, 360, "images/objects/man/man", 0, 0, 3, "man", 3, {clicked: function(){interval = setInterval(fade, 25, "");}}); // Man
const brokenCompass = new RoomComponent(75, 71, "images/objects/brokenCompass", 382, 204, 1, "desk", 1, {clicked: handleBrokenCompass});
new RoomComponent(33, 34, "images/objects/empty", 443, 123, 1, "", 3, {zoomOn: "symbolGuide"}); // Symbols guide paper
const lectern = new RoomComponent(60, 120, "images/objects/empty", 137, 194, 1, "", 3, {zoomOn: "lectern"}); // Lectern
new RoomComponent(200, 116, "images/objects/empty", 133, 155, 1, "lectern", 3, {clicked: function(){flipPage(-1)}}); // Left page
new RoomComponent(190, 116, "images/objects/empty", 333, 155, 1, "lectern", 3, {clicked: function(){flipPage(1)}}); // Right page
new RoomComponent(472, 156, "images/objects/empty", 84, 131, 1, "lectern", 3, {clicked: handleLectern}); // Lectern click area

for(let x = 0; x < 3; x++){
	for(let y = 0; y < 3; y++){
		new RoomComponent(25, 15, "images/objects/buttons/button" + (x + y * 3), 400 + 30 * x, 30 + 20 * y, 1, "safe", 2, {parameterClicked: safeButton});
	}
}

// Load backgrounds
backgrounds.forEach(background => new RoomComponent(640, 360, "images/backgrounds/" + background, 0, 0, 1, "never", "never", 0, {}));

new RoomComponent(25, 15, "images/objects/buttons/button-1", 430, 90, 1, "safe", 2, {parameterClicked: safeButton});

new Component(640, 360, "images/backgrounds/hints/start0", 0, 0, 1, {updated: hintBackground});

new RoomComponent(640, 360, "images/ui/loading", 0, 0, 1, "never", 0, {});

setInterval(update, 20); // 50 FPS
setInterval(frameIncrease, 250); // 4 FPS
let frame = 0;

function update(){
	ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

	components.forEach(component => { if(component !== undefined) component.update(); });

	if(leftClick) leftClick = false;
}