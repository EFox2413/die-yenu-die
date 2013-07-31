class Spell {
	name : string;
	type : string;
	range : number = 1;
	level : number = 0;
	baseDamage : number;

	constructor(name:string) {
		this.name = name;
	}
	
	getEffectImage() : heart.HeartImage { return null }

	getAttackDamage() {
		return this.baseDamage * this.level
	}

	getManaCost() {
		return this.level/2 * 10
	}
}

class Slash extends Spell {
	constructor() {
		super("Slash");
		this.type = "blade";
		this.level = 1; // start with it by default
		this.range = 1;
		this.baseDamage = 25;
	}

	getEffectImage() { return effect_slash }
}

class Fireball extends Spell {
	constructor() {
		super("Fireball");
		this.type = "fire";
		this.range = 3;
		this.baseDamage = 50;
	}

	getEffectImage() { return effect_fire }
}
