function frameIncrease(){
	frame++;
	clickHeat++;
}

function hasClickEvent(events){
	if(events.clicked !== undefined) return true;
	if(events.parameterClicked !== undefined) return true;
	if(events.zoomOn !== undefined) return true;
}

function Sound(src) {
	this.sound = document.createElement("audio");
	this.sound.src = src;
	this.sound.setAttribute("preload", "auto");
	this.sound.setAttribute("controls", "none");
	this.sound.style.display = "none";
	document.body.appendChild(this.sound);
	this.play = function(){
		this.sound.play();
	}
	this.stop = function(){
		this.sound.pause();
	}
}

// Modulus fix
function mod(n, m) {
	return ((n % m) + m) % m;
}