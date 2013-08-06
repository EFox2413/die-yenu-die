function restart() {
	player.init();
	_mapone = new MapParser("mapone", "  U $      $ $ U    D ");
	map = _mapone;
	dungeonLevel = 0;
}
