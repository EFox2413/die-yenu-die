class Camera {
	x : number = 0;
	get(x : number) {
		return x - this.x;
	}
	center(around_tile:number) {
		// center the camera
		this.x = around_tile*TILE_WIDTH - SCREEN_WIDTH/2;
	}
}


