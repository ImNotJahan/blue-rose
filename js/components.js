function InventoryComponent(image, id, name, events){
	this.id = components.length;
	this.name = name;
	this.slotId = id + slotApx;

	let componentEvents = {};

	componentEvents.clicked = function()
	{
		if (player.selected === name)
		{
			player.selected = "";
			components[id + slotApx].frames[0].src = "images/ui/slot0.png";
		} else
		{
			if (player.selected !== "")
			{
				for (let k = 0; k < player.inventory.length; k++)
				{
					if (player.inventory[k] !== undefined && player.inventory[k].name === player.selected)
					{
						components[player.inventory[k].slotId].frames[0].src = "images/ui/slot0.png";
					}
				}
			}

			player.selected = name;

			components[id + slotApx].frames[0].src = "images/ui/selected0.png";
		}
	}

	if(events.updated !== undefined) componentEvents.updated = events.updated;

	this.component = new Component(50, 50, image, 90 + 80 * id, 300, 1, componentEvents);

	this.update = function(){
		this.component.update();
	}
}

function ItemComponent(width, height, image, x, y, frameCount, zoom, facing, events){
	if(events.clicked === undefined) events.clicked = function(){};

	this.component = new RoomComponent(width, height, image, x, y, frameCount, zoom, facing, events);

	components[components.length - 1] = this;
	this.id = components.length - 1;

	this.update = function(){
		this.component.update();

		if(this.component.component.wasClicked){
			components[this.id] = undefined;

			let nextFreeID = -1;
			for(let k = 0; k < player.inventory.length; k++){
				if(player.inventory[k] === undefined) nextFreeID = k;
			}

			let invEvents = {};
			if(events.invUpdate !== undefined) invEvents.updated = events.invUpdate;

			player.inventory[nextFreeID] = new InventoryComponent("images/inventory/" + image.split("/")[2], nextFreeID, image.split("/")[2], invEvents);
		}
	}
}

function RoomComponent(width, height, image, x, y, frameCount, zoom, facing, events){
	this.component = new Component(width, height, image, x, y, frameCount, events);

	this.zoom = zoom;
	this.facing = facing;

	this.numId = components.length - 1;
	components[components.length - 1] = this;

	this.update = function(){
		if(room.zoom === this.zoom && room.facing === this.facing) this.component.update();
		else if(frame === 0) this.component.update(); // So image loads
	}
}

function Component(width, height, image, x, y, frameCount, events) {
	let frames = [];

	for(let k = 0; k < frameCount; k++){
		frames[k] = new Image();
		frames[k].src = image + k + ".png";
	}

	this.src = image;
	this.frames = frames;

	this.width = width;
	this.height = height;

	this.x = x;
	this.y = y;

	this.events = events;

	this.wasClicked = false;

	this.visible = true;

	components[components.length] = this;

	if(this.events.init !== undefined) this.events.init(this);

	this.update = function() {
		this.draw();

		this.wasClicked = false;

		if(leftClick && clickHeat > 1 && hasClickEvent(this.events)){
			let mx = mousePosition.x;
			let my = mousePosition.y;

			let ox = this.x * scale;
			let oy = this.y * scale;

			let ow = this.width * scale;
			let oh = this.height * scale;

			if(mx > ox && mx < ox + ow && my > oy && my < oy + oh){
				if(this.events.zoomOn !== undefined) room.zoom = this.events.zoomOn;
				if(this.events.clicked !== undefined) this.events.clicked();
				if(this.events.parameterClicked !== undefined) this.events.parameterClicked(this);

				this.wasClicked = true;
				clickHeat = 0;
			}
		}

		if(this.events.updated !== undefined) this.events.updated(this);
	}

	this.draw = function(){
		if(this.visible) {
			ctx.drawImage(this.frames[mod(frame, frameCount)],
					this.x * scale, this.y * scale,
					this.width * scale, this.height * scale);
		}

	}
}