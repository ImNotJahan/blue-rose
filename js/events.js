let interval;

let time = 12;
function clickedClock(){
	time = (time % 12) + 1; // Written kind of weird, but just increases time and keeps it 1...12
	clockHandle.component.frames[0].src = "images/objects/clockHands/hand" + (time - 1) + ".png";
	smallClockHandle.component.frames[0].src = "images/objects/clockHands/smallHand" + (time - 1) + ".png";

	if(time === 6) {
		ctx.globalAlpha = .5;
		// add lightswitch down noise
	}
	else if(time === 7) {
		ctx.globalAlpha = 1;
		// add lightswitch up noise
	}
}

let lookingAtHint = false;
function hintButton(){
	lookingAtHint = !lookingAtHint;
}

const availableHints = ["", "clock", "desk", "door", "door-bottom", "window-day", "window-night", "lectern"];
function hintBackground(component){
	if(lookingAtHint){
		if(availableHints.includes(room.zoom)){
			if(room.zoom !== ""){
				component.frames[0].src = "images/backgrounds/hints/" + room.zoom + 0 + ".png";
			} else component.frames[0].src = "images/backgrounds/hints/start" + room.facing + 0 + ".png";
		} else{
			component.frames[0].src = "images/backgrounds/hints/blank" + 0 + ".png";
		}

		component.visible = true;
	} else{
		component.visible = false;
	}
}

let pageComponent;
function handleLectern(){
	if(player.selected === "book"){
		player.selected = "";

		removeFromInventory("book");

		lectern.component.events.clicked = undefined;

		new RoomComponent(395, 116, "images/objects/openBook", 133, 155, 1, "lectern", 3, {}); // Open book
		new RoomComponent(27, 10, "images/objects/smallBook", 153, 198, 1, "", 3, {}); // Unfocused book
		pageComponent = new RoomComponent(395, 116, "images/objects/bookPages/page", 133, 155, 1, "lectern", 3, {}); // Page
	}
}

let page = 0;
const PAGE_COUNT = 4;
function flipPage(direction){
	console.log(pageComponent === undefined);
	if(pageComponent !== undefined)
	{
		page = Math.min(Math.max(0, page + direction), PAGE_COUNT);

		pageComponent.component.frames[0].src = "images/objects/bookPages/page" + page + ".png";
	} else{
		handleLectern();
	}
}

function removeFromInventory(item){
	for(let k = 0; k < player.inventory.length; k++){
		if(player.inventory[k] !== undefined && player.inventory[k].name === item){
			components[player.inventory[k].id] = undefined;
			player.inventory[k] = undefined;
			break;
		}
	}
}

function clockHandInit(self){
	self.frames[0].src = "images/objects/clockHands/hand11.png";
	smallClockHandle.component.frames[0].src = "images/objects/clockHands/smallHand11.png";
}

function handleBrokenCompass(){
	if(player.selected === "compassNeedle"){
		removeFromInventory("compassNeedle");

		components[brokenCompass.numId] = undefined;
		new ItemComponent(75, 71, "images/objects/compass", 382, 204, 1, "desk", 1,
				{clicked: function(){}, invUpdate: handleCompassDirection});
	}
}

function handleWindow(){
	if(time !== 6) room.zoom = "window-day";
	else room.zoom = "window-night";
}

let compassDirection = [2, 0, 3, 1, 2, 3, 1, 2, 1, 2];
let compassIndex = 0;
function handleCompassDirection(self){
	let img = "/images/inventory/compass/";
	const direction = (room.facing - compassDirection[compassIndex] + 4) % 4;

	switch(direction){
		case 0:
			img += "north0.png";
			compassIndex = (compassIndex + 1) % compassDirection.length;
			handleCompassDirection(self); // Stops compass flickering
			break

		case 1:
			img += "east0.png";
			break

		case 2:
			img += "south0.png";
			break

		case 3:
			img += "west0.png";
			break

		default:
			console.log("Compass direction incorrect: " + direction)
	}

	self.frames[0].src = img;
}

function lightOrDarkWindow(){
	if(time === 6) smallWindow.component.frames[0].src = "images/objects/dWindow0.png";
	else smallWindow.component.frames[0].src = "images/objects/window0.png";
}

function fade(zoom){
	ctx.globalAlpha -= .01;

	if(ctx.globalAlpha <= 0.01){
		clearInterval(interval);
		room.zoom = zoom;
		interval = setInterval(function() {
			ctx.globalAlpha += .01;

			if(ctx.globalAlpha >= 1){
				clearInterval(interval);
			}
		}, 25);
	}
}

function turnDoorknob(){
	if(doorUnlocked){
		doorknobTurn.play();
		room.zoom = "openedDoor";
	}
}

function unlockDoor(){
	if(player.selected === "doorKey"){
		doorUnlocked = true;
		keyTurned.play();

		removeFromInventory("doorKey");
	}
}

function backgroundCheck(component){
	if(room.zoom !== ""){
		component.frames[0].src = "images/backgrounds/" + room.zoom + 0 + ".png";
	} else component.frames[0].src = "images/backgrounds/start" + room.facing + 0 + ".png";
}

let spawnedCompassNeedle = false;
function pulledLever(){
	switch(code){
		case "7805":
			code = "";
			room.zoom = "openedSafe";
			latch.play();
			break

		case "2431":
			code = "";
			room.zoom = "openedSafe";
			latch.play();
			break

		case "5973":
			if(!spawnedCompassNeedle)
			{
				new ItemComponent(25, 20, "images/objects/compassNeedle", 270, 292, 1, "openedSafe", 2, {clicked: function () {}});
				spawnedCompassNeedle = true;
			}
			code = "";
			room.zoom = "openedSafe";
			latch.play();
			break
	}
}

function safeButton(component){
	let buttonId = component.src.split("/")[3].split("button")[1];

	safeBeep.play();
	code += parseInt(buttonId) + 1;

	if(code.length >= 4){
		if(code === "7805" || code === "5973" || code === "2431") safeSuccess.play();
		else{
			safeFail.play();
			code = "";
		}
	}
}

function eyesInteract(){
	if(player.selected === "writtenPaper"){
		player.selected = "";

		removeFromInventory("writtenPaper");

		new ItemComponent(50, 23, "images/objects/code", 300, 300, 1, "door-bottom", 3, {clicked: function(){}});

		paperSlide.play();
	}
}

function windowInteract(){
	let paper = -1;
	let pen = -1;

	for(let k = 0; k < player.inventory.length; k++){
		if(player.inventory[k] !== undefined){
			if(player.inventory[k].name === "paper") paper = k;
			else if(player.inventory[k].name === "pen") pen = k;
		}
	}

	if(pen >= 0 && paper >= 0){
		components[player.inventory[paper].id] = undefined;
		player.inventory[paper] = undefined;

		player.inventory[paper] = new InventoryComponent("images/inventory/writtenPaper", paper, "writtenPaper", {});

		writing.play();
	}
}