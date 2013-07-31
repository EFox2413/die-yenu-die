var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Wall = (function () {
    function Wall() {
    }
    Wall.prototype.getImage = function () {
        return tile_top;
    };
    Wall.prototype.isSolid = function () {
        return true;
    };
    return Wall;
})();

var Actor = (function () {
    function Actor(x, level) {
        if (typeof level === "undefined") { level = 1; }
        this.maxHealth = 100;
        this.maxMana = 100;
        this.health = 100;
        this.mana = 100;
        this.baseXPDrop = 25;
        this.alive = true;
        this.spell = null;
        this.spells = [];
        this.effectImg = null;
        this.x = x;
        this.spells = newSpellList();
        this.spell = this.spells[0];
        this.level = level;
        this.maxHealth = 100 + 5 * this.level;
        this.health = this.maxHealth;
    }
    Actor.prototype.isSolid = function () {
        return this.alive;
    };
    Actor.prototype.getImage = function () {
        return null;
    };
    Actor.prototype.getEffectImage = function () {
        return this.effectImg;
    };

    Actor.prototype.move = function (to) {
        map.pushTile(to, this);
        map.removeTile(this.x, this);
        this.x = to;
    };

    Actor.prototype.turn = function () {
        this.effectImg = null;
    };

    Actor.prototype.die = function () {
        this.alive = false;
    };

    Actor.prototype.damage = function (amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            this.die();
        }
    };

    Actor.prototype.heal = function (amount) {
        this.health += amount;
        if (this.health > this.maxHealth)
            this.health = this.maxHealth;
    };

    Actor.prototype.consumeMana = function (amount) {
        this.mana -= Math.min(amount, this.mana);
    };

    Actor.prototype.replinishMana = function (amount) {
        this.mana += Math.min(this.maxMana - this.mana, amount);
    };

    Actor.prototype.attacked = function (attacker) {
        this.damage(attacker.getAttackDamage());
        var ef = attacker.spell.getEffectImage();
        if (ef)
            this.effectImg = ef;
    };

    Actor.prototype.cast = function (victim) {
        if (distance(this.x, victim.x) <= this.spell.range) {
            this.consumeMana(this.spell.getManaCost());
            victim.attacked(this);
            console.log("someone casted " + this.spell.name);
        }
    };

    Actor.prototype.getSpell = function (name) {
        for (var i = 0; i < this.spells.length; i++) {
            if (this.spells[i].name == name)
                return this.spells[i];
        }
        return null;
    };

    Actor.prototype.hasSpell = function (name) {
        var spell = this.getSpell(name);
        return spell != null && spell.level > 0;
    };

    Actor.prototype.getAttackDamage = function () {
        return this.spell.getAttackDamage() + Math.round(2.5 * this.level);
    };
    return Actor;
})();

var Player = (function (_super) {
    __extends(Player, _super);
    function Player() {
        _super.call(this, 0);
        this.x = 0;
        this.img = null;
        this.xp = 975;
        this.upgradePoints = 1;
        this.getSpell("Slash").level = 2;
    }
    Player.prototype.getImage = function () {
        return this.img;
    };

    Player.prototype.damage = function (amount) {
        _super.prototype.damage.call(this, amount);
        console.log("You take " + amount + " damage");
        if (!this.alive) {
            console.log("You are dead...");
        }
    };

    Player.prototype.gainXP = function (amount) {
        this.xp += amount;
        if (this.xp >= this.getNextUpgradeXP()) {
            this.level++;
            this.upgradePoints++;
            console.log("level up");
        }
    };

    Player.prototype.getNextUpgradeXP = function () {
        return Math.floor(Math.pow(this.level, 1.5) * 1000);
    };
    return Player;
})(Actor);

var Enemy = (function (_super) {
    __extends(Enemy, _super);
    function Enemy(x, level) {
        if (typeof level === "undefined") { level = 1; }
        _super.call(this, x, level);
    }
    Enemy.prototype.getXPDropped = function () {
        return this.level * this.baseXPDrop;
    };

    Enemy.prototype.die = function () {
        _super.prototype.die.call(this);
        player.gainXP(this.getXPDropped());
    };

    Enemy.prototype.turn = function () {
        _super.prototype.turn.call(this);
        if (!this.alive)
            return;

        if (distance(this.x, player.x) <= this.spell.range) {
            this.cast(player);
        } else {
            if (this.x > 0 && !map.tiles[this.x - 1][0].isSolid() && player.x != this.x - 1) {
                this.move(this.x - 1);
            }
        }
    };
    return Enemy;
})(Actor);

var Zombie = (function (_super) {
    __extends(Zombie, _super);
    function Zombie() {
        _super.apply(this, arguments);
    }
    Zombie.prototype.getImage = function () {
        return tile_zombie;
    };
    return Zombie;
})(Enemy);

var UpgradeStation = (function () {
    function UpgradeStation() {
    }
    UpgradeStation.prototype.getImage = function () {
        return tile_idk;
    };
    UpgradeStation.prototype.isSolid = function () {
        return false;
    };
    return UpgradeStation;
})();

var Fireplace = (function () {
    function Fireplace() {
    }
    Fireplace.prototype.getImage = function () {
        return tile_fireplace;
    };
    Fireplace.prototype.isSolid = function () {
        return false;
    };
    return Fireplace;
})();

var Door = (function () {
    function Door() {
    }
    Door.prototype.getImage = function () {
        return tile_door;
    };
    Door.prototype.isSolid = function () {
        return false;
    };
    return Door;
})();

var Air = (function () {
    function Air() {
    }
    Air.prototype.getImage = function () {
        return tile_wall;
    };
    Air.prototype.isSolid = function () {
        return false;
    };
    return Air;
})();
