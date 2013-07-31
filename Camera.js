var Camera = (function () {
    function Camera() {
        this.x = 0;
    }
    Camera.prototype.get = function (x) {
        return x - this.x;
    };
    Camera.prototype.center = function (around_tile) {
        this.x = around_tile * TILE_WIDTH - SCREEN_WIDTH / 2;
    };
    return Camera;
})();
