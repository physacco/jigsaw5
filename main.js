/*jslint bitwise: true */
/*global $: false, window: false, document: false */
$(document).ready(function () {
    "use strict";

    var coordToIndex, indexToCoord, moveTile, readImageFile, createPanel;

    // Check for the various File API support.
    if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
        window.alert('The File APIs are not fully supported in this browser.');
        return;
    }

    coordToIndex = function (nrow, ncol, row, col) {
        return row * ncol  + col;
    };

    indexToCoord = function (nrow, ncol, index) {
        var row, col;

        col = index % ncol;
        row = (index - col) / ncol;

        return [row, col];
    };

    moveTile = function (row, col, direction) {
    };

    Array.prototype.shuffle = function () {
        var counter = this.length, temp, index;

        // While there are elements in the array
        while (counter) {
            counter -= 1;

            // Pick a random index
            index = (Math.random() * counter) | 0;

            // And swap the last element with it
            temp = this[counter];
            this[counter] = this[index];
            this[index] = temp;
        }
    };

    function Map(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.init();
    }

    Map.prototype = {
        init: function () {
            var i, j, row;

            this.matrix = [];
            for (j = 0; j < this.rows; j += 1) {
                row = [];
                for (i = 0; i < this.cols + 1; i += 1) {
                    row.push(null);
                }
                this.matrix.push(row);
            }
        },

        regularize: function () {
            var i, j, seq;

            seq = [];
            for (i = 0; i < this.rows * this.cols; i += 1) {
                seq.push(i);
            }

            for (j = 0; j < this.rows; j += 1) {
                for (i = 0; i < this.cols; i += 1) {
                    this.matrix[j][i] = seq[j * this.cols + i];
                }
                if (j === this.rows - 1) {
                    this.matrix[j][i] = -1;
                }
            }
        },

        randomize: function () {
            var i, j, seq;

            seq = [];
            for (i = 0; i < this.rows * this.cols; i += 1) {
                seq.push(i);
            }
            seq.shuffle();

            for (j = 0; j < this.rows; j += 1) {
                for (i = 0; i < this.cols; i += 1) {
                    this.matrix[j][i] = seq[j * this.cols + i];
                }
                if (j === this.rows - 1) {
                    this.matrix[j][i] = -1;
                }
            }
        },

        getCell: function (row, col) {
            if (row < 0 || row >= this.rows) {
                return null;
            }

            if (col < 0 || col > this.cols) {
                return null;
            }

            return this.matrix[row][col];
        },

        findPath: function (row, col) {
            var i, choices, choice, cell;

            // up, down, left, right
            choices = [[row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]];

            for (i = 0; i < choices.length; i += 1) {
                choice = choices[i];
                cell = this.getCell(choice[0], choice[1]);
                if (cell === -1) {  // empty
                    return choice;
                }
            }

            return null;
        },

        swapCells: function (row1, col1, row2, col2) {
            var tmp;

            tmp = this.matrix[row1][col1];
            this.matrix[row1][col1] = this.matrix[row2][col2];
            this.matrix[row2][col2] = tmp;
        }
    };

    function TileMatrix(image, tileSize) {
        this.init(image, tileSize);
    }

    TileMatrix.prototype = {
        init: function (image, tileSize) {
            var i, j, sx, sy, px, py, tile;

            this.image = image;
            this.tileSize = tileSize;

            this.cols = (image.width - image.width % tileSize) / tileSize;
            this.rows = (image.height - image.height % tileSize) / tileSize;

            this.tiles = [];

            for (j = 0; j < this.rows; j += 1) {
                for (i = 0; i < this.cols; i += 1) {
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
            var index = row * this.cols + col;
            return this.tiles[index];
        }
    };

    function Panel(tileSize, rows, cols) {
        this.tileSize = tileSize;
        this.rows = rows;
        this.cols = cols;

        this.panel = document.createElement('div');
        this.panel.setAttribute('class', 'panel');

        this.width = (tileSize + 2) * (cols + 1) + 20;
        this.height = (tileSize + 2) * (rows + 1) + 20;

        this.panel.setAttribute('style', 'width:' + this.width + 'px; height:' + this.height + 'px');
    }

    Panel.prototype = {
        addTile: function (row, col, tile) {
            var x, y, self;

            self = this;
            tile.setAttribute('data-map-row', row);
            tile.setAttribute('data-map-col', col);
            tile.addEventListener('click', function (evt) {
                self.onMoveTile(tile, evt);
            });

            x = col * (this.tileSize + 2);
            y = row * (this.tileSize + 2);
            tile.setAttribute('style', 'left: ' + x + 'px; top: ' + y + 'px');
            this.panel.appendChild(tile);
        },

        applyMap: function (map, tileMatrix) {
            var i, j, index, row, col, tile;

            this.map = map;
            this.tileMatrix = tileMatrix;

            for (j = 0; j < this.rows; j += 1) {
                for (i = 0; i < this.cols; i += 1) {
                    index = map.getCell(j, i);
                    col = index % this.cols;
                    row = (index - col) / this.cols;
                    tile = tileMatrix.getTile(row, col);
                    this.addTile(j, i, tile);
                }
            }
        },

        onMoveTile: function (tile, evt) {
            var row, col, path, newrow, newcol;

            row = parseInt(tile.getAttribute('data-map-row'), 10);
            col = parseInt(tile.getAttribute('data-map-col'), 10);

            path = this.map.findPath(row, col);
            if (!path) {  // no way to go
                return;
            }

            newrow = path[0];
            newcol = path[1];
            this.map.swapCells(row, col, newrow, newcol);
            this.moveTile(newrow, newcol, tile);
        },

        moveTile: function (row, col, tile) {
            var x, y;

            tile.setAttribute('data-map-row', row);
            tile.setAttribute('data-map-col', col);

            x = col * (this.tileSize + 2);
            y = row * (this.tileSize + 2);
            tile.setAttribute('style', 'left: ' + x + 'px; top: ' + y + 'px');
        }
    };

    readImageFile = function (file, callback) {
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

    createPanel = function (image) {
        var tiles, panel, map, tileSize;

        tileSize = parseInt($("#tile-size").val(), 10);
        if (image.width < tileSize) {
            window.alert('Image width is less than tile size!');
            return null;
        }
        if (image.height < tileSize) {
            window.alert('Image height is less than tile size!');
            return null;
        }

        tiles = new TileMatrix(image, tileSize);
        panel = new Panel(tileSize, tiles.rows, tiles.cols);
        map = new Map(tiles.rows, tiles.cols);
        //map.regularize();
        map.randomize();

        panel.applyMap(map, tiles);

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
            if (panel) {
                body = document.getElementsByTagName('body')[0];
                body.appendChild(panel.panel);
            }
        });
    });
});
