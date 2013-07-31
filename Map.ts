// The game world map
// Tile cells are actually stacks of tiles, so that when another tile moves into it,
// such as an enemy, it doesn't remove it, just sits on top of it.

class Map {
	tiles : Tile[][];
	width : number;
	name : string;

	//isSolidAt(x:number) : bool;
	isSolidAt(x:number) {
		for(var i = 0; i < this.tiles[x].length; i++) {
			if(this.tiles[x][i].isSolid())
				return true;
		}
		return false;
	}

	tileAt(x:number) {
		return this.tiles[x][0];
	}

	pushTile(x:number, t:Tile) {
		this.tiles[x].unshift(t);
	}

	popTile(x:number) {
		return this.tiles[x].shift();
	}

	removeTile(x:number, tile:Tile) {
		var i = this.tiles[x].indexOf(tile);
		if(i == -1) {
			console.log("error: no tile");
			return;
		}
		this.tiles[x].splice(i, 1);
	}
}

// Parses a simple text format into a tilemap

class MapParser extends Map {
	constructor(name, map, level=1) {
		super();
		this.name = name;
		this.tiles = emptyTiles(map.length);
		this.width = map.length;
		for(var i = 0; i < map.length; i++) {
			switch(map[i]) {
				case '$': this.pushTile(i, new Zombie(i, level)); break;
				case 'U': this.pushTile(i, new UpgradeStation()); break;
				case 'F': this.pushTile(i, new Fireplace()); break;
				case 'D': this.pushTile(i, new Door()); break;
			}
		}
	}
}


