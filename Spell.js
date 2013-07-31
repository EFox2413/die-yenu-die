var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Spell = (function () {
    function Spell(name) {
        this.range = 1;
        this.level = 0;
        this.name = name;
    }
    Spell.prototype.getEffectImage = function () {
        return null;
    };

    Spell.prototype.getAttackDamage = function () {
        return this.baseDamage * this.level;
    };

    Spell.prototype.getManaCost = function () {
        return this.level / 2 * 10;
    };
    return Spell;
})();

var Slash = (function (_super) {
    __extends(Slash, _super);
    function Slash() {
        _super.call(this, "Slash");
        this.type = "blade";
        this.level = 1;
        this.range = 1;
        this.baseDamage = 25;
    }
    Slash.prototype.getEffectImage = function () {
        return effect_slash;
    };
    return Slash;
})(Spell);

var Fireball = (function (_super) {
    __extends(Fireball, _super);
    function Fireball() {
        _super.call(this, "Fireball");
        this.type = "fire";
        this.range = 3;
        this.baseDamage = 50;
    }
    Fireball.prototype.getEffectImage = function () {
        return effect_fire;
    };
    return Fireball;
})(Spell);
