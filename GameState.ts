// Game States are basically scenes. The game uses a game state stack where multiple
// scenes can stack upon eachother. The play state (i.e. the world) is usually the
// bottom-most state. On top of it are usually menu states, like UpgradeState.

interface GameState {
	keydown(c:string);
	draw();
}

function pushState(state) { gameStates.unshift(state); }
function popState() { return gameStates.shift(); }


// Main menu splash screen
class MainMenuState implements GameState {
	keydown(c:string) {
		if(c == " ")
			pushState(new PlayState());
	}

	draw() {
		var BASE_X = SCREEN_WIDTH/3;
		var BASE_Y = SCREEN_HEIGHT/2;
		heart.graphics.setColor(255, 255, 0);
		heart.graphics.print("Press Space to start.", BASE_X, BASE_Y - 10);
	}
}

class PlayState implements GameState {
	keydown(c:string) {
		// don't do anything if the player is dead
		if(!player.alive) {
			pushState(new GameOverState());
		}

		// space (attack)
		if(c == " ") {
			for(var i = player.x; i < map.width; i++) {
				if(map.tileAt(i) instanceof Enemy) {
					var e = <Enemy> map.tileAt(i);
					if(!e.alive) continue;

					if(distance(i, player.x) <= player.spell.range) {
						//e.attacked(player);
						player.cast(e);
						break;
					}
				}
			}

			turn();
		}

		// go right
		if(c == "right") {
			turn();
			if(player.x+1 < map.width && !map.isSolidAt(player.x+1)) {
				player.x++;
				camera.center(player.x);
			}
		}
		// go left
		else if(c == "left") {
			turn();
			if(player.x-1 >= 0 && !map.isSolidAt(player.x-1)) {
				player.x--;
				camera.center(player.x);
			}
		}
		// use
		else if(c == "up") {
			if(map.tileAt(player.x) instanceof UpgradeStation) {
				console.log("upgrade...");
				pushState(new UpgradeState());
				return;
			}
			else if(map.tileAt(player.x) instanceof Fireplace) {
				// heal up
				player.heal(player.maxHealth-player.health);
				player.replinishMana(player.maxMana-player.mana);
			}
			else if(map.tileAt(player.x) instanceof Door) {
				if(map.name == "home") {
					// home -> new random dungeon
					dungeonLevel++;
					console.log("dungeon level = " + dungeonLevel);
					loadmap(new MapParser("randumb", getRandomMap(), dungeonLevel));
				}
				else {
					// anywhere -> home
					loadmap(_home);
				}
			}
		}
		else if(c == "k") pushState(new SpellState());

		// debug key to load a new randomly generated map
		else if(c == "i") {
			// debug - generate new random dungeon
			var rmap = getRandomMap();
			loadmap(new MapParser("randumb", rmap));
		}
	}

	draw() {
		var BASE_Y = SCREEN_HEIGHT / 2 - TILE_HEIGHT;

		for(var i = 0; i < map.width; i++) {
			heart.graphics.draw(tile_top, camera.get(i*TILE_WIDTH), BASE_Y);
			heart.graphics.draw(tile_top, camera.get(i*TILE_WIDTH), BASE_Y + TILE_HEIGHT*2);
		}

		for(var i = 0; i < map.width; i++) {
			var t = map.tileAt(i);
			if(t instanceof Actor)
				drawActor(<Actor>t, BASE_Y);
			else
				heart.graphics.draw(t.getImage(), camera.get(i*TILE_WIDTH), BASE_Y+TILE_HEIGHT);
		}

		// draw the player
		drawActor(player, BASE_Y);

		// draw UI
		heart.graphics.setColor(255, 255, 0);
		heart.graphics.print("level " + dungeonLevel, 10, 90);

		// health and mana bar
		var xp = player.getNextUpgradeXP();
		drawBar(10, 20, "HP: " + player.health + "/" + player.maxHealth, player.health, player.maxHealth);
		drawBar(10, 40, "MP: " + player.mana + "/" + player.maxMana, player.mana, player.maxMana, [0,0,200]);
		drawBar(10, 60, "XP: " + player.xp + "/" + xp, player.xp, xp, [0,200,0]);

		// todo: lighting
		/*
		var g = heart.ctx.createRadialGradient(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 0, SCREEN_WIDTH/2+16, SCREEN_HEIGHT/2+16, 360);
		g.addColorStop(0.10, "#ffffff");
		g.addColorStop(0.8, "rgba(0, 0, 0, .5)");
		heart.ctx.fillStyle = g;
		heart.ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);*/
	}
}


// game over and restart screen
class GameOverState implements GameState {
	keydown(c:string) {
		switch(c) {
			case "r":
				popState(); //back out of game over screen
				break;

			case "R":
				popState(); //back out of game over screen
				break;
		}
	}

	draw() {
		var BASE_X = SCREEN_WIDTH/3;
		var BASE_Y = SCREEN_HEIGHT/2;
		heart.graphics.setColor(255, 255, 0);
		heart.graphics.print("Game Over, Press R to try again.", BASE_X, BASE_Y - 10);
	}
}

// The upgrade menu
class UpgradeState implements GameState {
	index : number = 0; // index of the menu item

	keydown(c:string) {
		switch(c) {
			case "escape":
			case "backspace":
			case "q":
				// back out of the menu
				popState();
				return;

			case "up":
				this.index--;
				if(this.index < 0) this.index = 0;
				break;
			case "down":
				this.index++;
				if(this.index >= player.spells.length) this.index--;
				break;
			case "u":
			case " ":
				// buy an upgade
				// todo: confirmation screen
				if(player.upgradePoints > 0) {
					var spell = player.spells[this.index];
					spell.level++;
					player.upgradePoints--;
					console.log("upgraded spell " + spell.name + " to level " + spell.level);
					popState();
				}
				break;
		}
	}

	draw() {
		var BASE_X = SCREEN_WIDTH/3;
		var BASE_Y = SCREEN_HEIGHT/2;
		heart.graphics.setColor(255, 255, 0);
		heart.graphics.print("What to buy? You have " + player.upgradePoints + " points", BASE_X, BASE_Y - 10);

		for(var i = 0; i < player.spells.length; i++) {
			heart.graphics.rectangle("stroke", BASE_X, BASE_Y+i*25, 150, 20);
			if(i == this.index) {
				heart.graphics.setColor(200, 200, 0);
				heart.graphics.rectangle("fill", BASE_X, BASE_Y+i*25, 150, 20);
				heart.graphics.setColor(255, 255, 0);
			}
			var spell = player.spells[i];
			var txt = spell.name;
			if(spell.level == 0) txt += " (learn)";
			else txt += " ("+spell.level+")";
			heart.graphics.print(txt, BASE_X + 150/2 - spell.name.length*3, BASE_Y+12+i*25);
		}
	}
}

// The spell/ability selection menu
class SpellState implements GameState {
	keydown(c:string) {
		switch(c) {
			case "a":
				//slash selected
				popState();
				break;
			case "b":
				//fireball selected
				popState();
				break;
			case "escape":
			case "backspace":
			case "q":
				popState();
				return;
		}
	}

	draw() {
		var BASE_X = SCREEN_WIDTH/3;
		var BASE_Y = SCREEN_HEIGHT/2;
		heart.graphics.setColor(255, 255, 0);
		heart.graphics.print("Select a spell/ability", BASE_X, BASE_Y - 10);

		for(var i = 0; i < player.spells.length; i++) {
			var spell = player.spells[i];
			var txt = spell.name;
			txt += " ("+spell.level+")";
			heart.graphics.print(txt, BASE_X + 150/2 - spell.name.length*3, BASE_Y+12+i*25);
		}
	}
}
