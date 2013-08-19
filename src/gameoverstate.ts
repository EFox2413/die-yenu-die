// game over and restart screen
class GameOverState implements GameState {
	keydown(c:string) {
		switch(c) {
			case "r":
			case "R":
				restart();
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
