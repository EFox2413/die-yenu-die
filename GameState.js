function pushState(state) {
    gameStates.unshift(state);
}
function popState() {
    return gameStates.shift();
}

var UpgradeState = (function () {
    function UpgradeState() {
        this.index = 0;
    }
    UpgradeState.prototype.keydown = function (c) {
        switch (c) {
            case "escape":
            case "backspace":
            case "q":
                popState();
                return;

            case "up":
                this.index--;
                if (this.index < 0)
                    this.index = 0;
                break;
            case "down":
                this.index++;
                if (this.index >= player.spells.length)
                    this.index--;
                break;
            case "u":
            case " ":
                if (player.upgradePoints > 0) {
                    var spell = player.spells[this.index];
                    spell.level++;
                    player.upgradePoints--;
                    console.log("upgraded spell " + spell.name + " to level " + spell.level);
                    popState();
                }
                break;
        }
    };

    UpgradeState.prototype.draw = function () {
        var BASE_X = SCREEN_WIDTH / 3;
        var BASE_Y = SCREEN_HEIGHT / 2;
        heart.graphics.setColor(255, 255, 0);
        heart.graphics.print("What to buy? You have " + player.upgradePoints + " points", BASE_X, BASE_Y - 10);

        for (var i = 0; i < player.spells.length; i++) {
            heart.graphics.rectangle("stroke", BASE_X, BASE_Y + i * 25, 150, 20);
            if (i == this.index) {
                heart.graphics.setColor(200, 200, 0);
                heart.graphics.rectangle("fill", BASE_X, BASE_Y + i * 25, 150, 20);
                heart.graphics.setColor(255, 255, 0);
            }
            var spell = player.spells[i];
            var txt = spell.name;
            if (spell.level == 0)
                txt += " (learn)"; else
                txt += " (" + spell.level + ")";
            heart.graphics.print(txt, BASE_X + 150 / 2 - spell.name.length * 3, BASE_Y + 12 + i * 25);
        }
    };
    return UpgradeState;
})();

var GameOverState = (function () {
    function GameOverState() {
    }
    GameOverState.prototype.keydown = function (c) {
        switch (c) {
            case "r":
                popState();
                break;

            case "R":
                popState();
                break;
        }
    };

    GameOverState.prototype.draw = function () {
        var BASE_X = SCREEN_WIDTH / 3;
        var BASE_Y = SCREEN_HEIGHT / 2;
        heart.graphics.setColor(255, 255, 0);
        heart.graphics.print("Game Over, Press R to try again.", BASE_X, BASE_Y - 10);
    };
    return GameOverState;
})();

var PlayState = (function () {
    function PlayState() {
    }
    PlayState.prototype.keydown = function (c) {
        if (!player.alive) {
            pushState(new GameOverState());
            return;
        }

        if (c == " ") {
            for (var i = player.x; i < map.width; i++) {
                if (map.tileAt(i) instanceof Enemy) {
                    var e = map.tileAt(i);
                    if (!e.alive)
                        continue;

                    if (distance(i, player.x) <= player.spell.range) {
                        player.cast(e);
                        break;
                    }
                }
            }

            turn();
        }

        if (c == "right") {
            turn();
            if (player.x + 1 < map.width && !map.isSolidAt(player.x + 1)) {
                player.x++;
                camera.center(player.x);
            }
        } else if (c == "left") {
            turn();
            if (player.x - 1 >= 0 && !map.isSolidAt(player.x - 1)) {
                player.x--;
                camera.center(player.x);
            }
        } else if (c == "up") {
            if (map.tileAt(player.x) instanceof UpgradeStation) {
                console.log("upgrade...");
                pushState(new UpgradeState());
                return;
            } else if (map.tileAt(player.x) instanceof Fireplace) {
                player.heal(player.maxHealth - player.health);
                player.replinishMana(player.maxMana - player.mana);
            } else if (map.tileAt(player.x) instanceof Door) {
                if (map.name == "home") {
                    dungeonLevel++;
                    console.log("dungeon level = " + dungeonLevel);
                    loadmap(new MapParser("randumb", getRandomMap(), dungeonLevel));
                } else {
                    loadmap(_home);
                }
            }
        } else if (c == "i") {
            var rmap = getRandomMap();
            loadmap(new MapParser("randumb", rmap));
        }
    };

    PlayState.prototype.draw = function () {
        var BASE_Y = SCREEN_HEIGHT / 2 - TILE_HEIGHT;

        for (var i = 0; i < map.width; i++) {
            heart.graphics.draw(tile_top, camera.get(i * TILE_WIDTH), BASE_Y);
            heart.graphics.draw(tile_top, camera.get(i * TILE_WIDTH), BASE_Y + TILE_HEIGHT * 2);
        }

        for (var i = 0; i < map.width; i++) {
            var t = map.tileAt(i);
            if (t instanceof Actor)
                drawActor(t, BASE_Y); else
                heart.graphics.draw(t.getImage(), camera.get(i * TILE_WIDTH), BASE_Y + TILE_HEIGHT);
        }

        drawActor(player, BASE_Y);

        heart.graphics.setColor(255, 255, 0);
        heart.graphics.print("level " + dungeonLevel, 10, 90);

        var xp = player.getNextUpgradeXP();
        drawBar(10, 20, "HP: " + player.health + "/" + player.maxHealth, player.health, player.maxHealth);
        drawBar(10, 40, "MP: " + player.mana + "/" + player.maxMana, player.mana, player.maxMana, [0, 0, 200]);
        drawBar(10, 60, "XP: " + player.xp + "/" + xp, player.xp, xp, [0, 200, 0]);
    };
    return PlayState;
})();
