var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Map = (function () {
    function Map() {
    }
    Map.prototype.isSolidAt = function (x) {
        for (var i = 0; i < this.tiles[x].length; i++) {
            if (this.tiles[x][i].isSolid())
                return true;
        }
        return false;
    };

    Map.prototype.tileAt = function (x) {
        return this.tiles[x][0];
    };

    Map.prototype.pushTile = function (x, t) {
        this.tiles[x].unshift(t);
    };

    Map.prototype.popTile = function (x) {
        return this.tiles[x].shift();
    };

    Map.prototype.removeTile = function (x, tile) {
        var i = this.tiles[x].indexOf(tile);
        if (i == -1) {
            console.log("error: no tile");
            return;
        }
        this.tiles[x].splice(i, 1);
    };
    return Map;
})();

var MapParser = (function (_super) {
    __extends(MapParser, _super);
    function MapParser(name, map, level) {
        if (typeof level === "undefined") { level = 1; }
        _super.call(this);
        this.name = name;
        this.tiles = emptyTiles(map.length);
        this.width = map.length;
        for (var i = 0; i < map.length; i++) {
            switch (map[i]) {
                case '$':
                    this.pushTile(i, new Zombie(i, level));
                    break;
                case 'U':
                    this.pushTile(i, new UpgradeStation());
                    break;
                case 'F':
                    this.pushTile(i, new Fireplace());
                    break;
                case 'D':
                    this.pushTile(i, new Door());
                    break;
            }
        }
    }
    return MapParser;
})(Map);
