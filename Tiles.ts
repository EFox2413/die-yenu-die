// Base tile interface. All tiles implement this.

interface Tile {
	getImage() : heart.HeartImage;
	isSolid() : bool;
}

class Wall implements Tile {
	getImage() { return tile_top; }
	isSolid() { return true; }
}

// Base actor class. Players and enemies inherit from this.

class Actor implements Tile {
	x : number;
	maxHealth : number = 100;
	maxMana : number = 100;
	health : number = 100;
	mana : number = 100;
	level : number;
	baseXPDrop : number = 25;
	alive : bool = true;
	spell : Spell = null;
	spells : Spell[] = [];
	effectImg : heart.HeartImage = null;

	constructor(x:number, level:number=1) {
		this.x = x;
		this.spells = newSpellList();
		this.spell = this.spells[0];
		this.level = level;
		this.maxHealth = 100 + 5*this.level
		this.health = this.maxHealth
	}

	isSolid() { return this.alive }
	getImage() : heart.HeartImage { return null }
	getEffectImage() : heart.HeartImage { return this.effectImg }

	move(to:number) {
		map.pushTile(to, this);
		map.removeTile(this.x, this);
		this.x = to;
	}

	turn() {
		this.effectImg = null;
	}

	die() {
		this.alive = false;
		// todo: drops
	}

	damage(amount:number) {
		this.health -= amount;
		if(this.health <= 0) {
			this.health = 0;
			this.die();
		}
	}

	heal(amount:number) {
		this.health += amount;
		if(this.health > this.maxHealth)
			this.health = this.maxHealth;
		//this.effectImg = effect_heal; // todo
	}

	consumeMana(amount : number) {
		this.mana -= Math.min(amount, this.mana);
	}

	replinishMana(amount : number) {
		this.mana += Math.min(this.maxMana-this.mana, amount);
		//this.effectImg = effect_replinish; // todo
	}

	attacked(attacker:Actor) {
		this.damage(attacker.getAttackDamage());
		var ef = attacker.spell.getEffectImage();
		if(ef)
			this.effectImg = ef;
	}

	cast(victim:Actor) {
		if(distance(this.x, victim.x) <= this.spell.range) {
			this.consumeMana(this.spell.getManaCost());
			victim.attacked(this);
			console.log("someone casted " + this.spell.name);
		}
	}

	getSpell(name:string) : Spell {
		for(var i = 0; i < this.spells.length; i++) {
			if(this.spells[i].name == name)
				return this.spells[i]
		}
		return null;
	}

	hasSpell(name:string) {
		var spell = this.getSpell(name);
		return spell != null && spell.level > 0
	}

	getAttackDamage() {
		return this.spell.getAttackDamage() + Math.round(2.5*this.level)
	}
}

class Player extends Actor {
	x : number = 0;
	img : heart.HeartImage = null;
	xp : number = 975;
	upgradePoints : number = 1;

	constructor() {
		super(0);
		this.getSpell("Slash").level = 2;
	}

	getImage() { return this.img }

	damage(amount:number) {
		super.damage(amount);
		console.log("You take " + amount + " damage");
		if(!this.alive) {
			console.log("You are dead...");
		}
	}

	gainXP(amount:number) {
		this.xp += amount;
		if(this.xp >= this.getNextUpgradeXP()) {
			this.level++;
			this.upgradePoints++;
			console.log("level up");
		}
	}

	getNextUpgradeXP() {
		return Math.floor(Math.pow(this.level,1.5) * 1000);
	}
}

// Base enemy class

class Enemy extends Actor {
	constructor(x:number, level:number=1) {
		super(x, level);
	}

	getXPDropped() {
		return this.level * this.baseXPDrop
	}

	die() {
		super.die();
		player.gainXP(this.getXPDropped());
	}

	turn() {
		super.turn();
		if(!this.alive) return;

		// see if we can attack the player
		if(distance(this.x, player.x) <= this.spell.range) {
				//player.attacked(this);
				this.cast(player);
		}
		else {
			// move enemies left towards player
			if(this.x > 0 && !map.tiles[this.x-1][0].isSolid() && player.x != this.x-1) {
				this.move(this.x-1);
			}
		}
	}
}

// Enemies in the game

class Zombie extends Enemy {
	getImage() { return tile_zombie; }
}

class UpgradeStation implements Tile {
	getImage() { return tile_idk; }
	isSolid() { return false }
}

class Fireplace implements Tile {
	getImage() { return tile_fireplace; }
	isSolid() { return false }
}

class Door implements Tile {
	getImage() { return tile_door; }
	isSolid() { return false }
}

class Air implements Tile {
	getImage() : heart.HeartImage { return tile_wall; }
	isSolid() { return false }
}


