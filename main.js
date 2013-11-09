/*global $: false, window: false, document: false */
$(document).ready(function () {
    "use strict";

    // Check for the various File API support.
    if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
        window.alert('The File APIs are not fully supported in this browser.');
        return;
    }

    var coordToIndex = function (nrow, ncol, row, col) {
        return row * ncol  + col;
    };

    var indexToCoord = function (nrow, ncol, index) {
        var row, col;

        col = index % ncol;
        row = (index - col) / ncol;

        return [row, col];
    };

    var generateMap = function (row, col) {
        var i, j, x;

        for (j = 0; j < row; j += 1) {
            for (i = 0; i < col; i += 1) {
                x = j * col + i;
                console.log(j, i, x);
            }
        }
    };

    var moveTile = function (row, col, direction) {
    };


    function TileMatrix(image, tileSize) {
        this.init(image, tileSize);
    }

    TileMatrix.prototype = {
        init: function (image, tileSize) {
            var i, j, sx, sy, px, py, tile;

            this.image = image;
            this.tileSize = tileSize;

            this.tileXN = (image.width - image.width % tileSize) / tileSize;
            this.tileYN = (image.height - image.height % tileSize) / tileSize;

            this.tiles = [];

            for (j = 0; j < this.tileYN; j += 1) {
                for (i = 0; i < this.tileXN; i += 1) {
                    sx = i * tileSize;
                    sy = j * tileSize;
                    px = i * (tileSize + 2);
                    py = j * (tileSize + 2);

                    tile = document.createElement('canvas');
                    tile.setAttribute('class', 'tile');
                    tile.setAttribute('width', tileSize);
                    tile.setAttribute('height', tileSize);
                    tile.setAttribute('data-row', j);
                    tile.setAttribute('data-col', i);
                    tile.getContext('2d').drawImage(image, sx, sy, tileSize, tileSize, 0, 0, tileSize, tileSize);

                    this.tiles.push(tile);
                }
            }
        },

        getTile: function (row, col) {
            var index = row * this.tileXN + col;
            return this.tiles[index];
        }
    };

    function Panel(tileSize, tileXN, tileYN) {
        this.panel = document.createElement('div');
        this.panel.setAttribute('class', 'panel');

        this.width = (tileSize + 2) * (tileXN + 1) + 20;
        this.height = (tileSize + 2) * (tileYN + 1) + 20;

        this.panel.setAttribute('style', 'width:' + this.width + 'px; height:' + this.height + 'px');
    }

    Panel.prototype = {
    };

    var readImageFile = function (file, callback) {
        var reader = new window.FileReader();
        reader.readAsDataURL(file);
        reader.onload = function (evt) {
            var image = new window.Image();
            image.src = evt.target.result;
            image.onload = function () {
                callback(image);
            };
        };
    };

    var createPanel = function (image) {
        var body, tiles, panel, tileSize, i, j, px, py, tile;

        tileSize = parseInt($("#tile-size").val(), 10);
        tiles = new TileMatrix(image, tileSize);
        panel = new Panel(tileSize, tiles.tileXN, tiles.tileYN);

        for (j = 0; j < tiles.tileYN; j += 1) {
            for (i = 0; i < tiles.tileXN; i += 1) {
                px = i * (tileSize + 2);
                py = j * (tileSize + 2);
                tile = tiles.getTile(j, i);
                tile.setAttribute('style', 'left: ' + px + 'px; top: ' + py + 'px');
                panel.panel.appendChild(tile);
            }
        }

        return panel;
    };

    $("#file").on('click', function (evt) {
        var tileSize = parseInt($("#tile-size").val(), 10);

        if (isNaN(tileSize)) {
            window.alert("Invalid value for tile size!");
            return false;
        }

        if (tileSize < 10) {
            window.alert("Tile size is too small!");
            return false;
        }

        if (tileSize > 500) {
            window.alert("Tile size is too big!");
            return false;
        }
    });

    $("#file").on('change', function (evt) {
        var file = evt.target.files[0];
        if (!file) {
            return false;
        }

        if (!file.type.match(/^image\//)) {
            window.alert('not an image file');
            return false;
        }

        readImageFile(file, function (image) {
            var panel, body;
            panel = createPanel(image);
            body = document.getElementsByTagName('body')[0];
            body.appendChild(panel.panel);
        });
    });
});
