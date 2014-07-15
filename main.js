/*jslint bitwise: true */
/*global window: false, document: false */
(function () {
    "use strict";

    // Check for the various File API support.
    if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
        window.alert('The File APIs are not fully supported in this browser.');
        return;
    }

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

    window.Image.fromLocalFile = function (file) {
        var image, reader;

        image = new window.Image();
        reader = new window.FileReader();
        reader.readAsDataURL(file);
        reader.onload = function (evt) {
            window.localStorage.setItem('imgSrc', evt.target.result);
            image.src = evt.target.result;
        };
        return image;
    };

    window.Image.fromSourceURL = function (url) {
        var image;

        image = new window.Image();
        image.src = url;
        return image;
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

        isRegular: function () {
            var i, j;

            for (j = 0; j < this.rows; j += 1) {
                for (i = 0; i < this.cols; i += 1) {
                    if (this.matrix[j][i] !== (j * this.cols + i)) {
                        return false;
                    }
                }
            }

            return true;
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
        },

        findBlank: function () {
            var i, j;

            for (i = 0; i < this.rows; i += 1) {
                for (j = 0; j <= this.cols; j += 1) {
                    if (this.matrix[i][j] === -1) {
                        return [i, j];
                    }
                }
            }

            return null;
        },

        findPathForBlank: function (row, col) {
            var i, paths, choices, choice, cell;

            paths = [];

            // up, down, left, right
            choices = [[row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]];

            for (i = 0; i < choices.length; i += 1) {
                choice = choices[i];
                cell = this.getCell(choice[0], choice[1]);
                if (cell !== null && cell >= 0) {  // non-null, non-empty
                    paths.push(choice);
                }
            }

            return paths;
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

        this.width = (tileSize + 2) * (cols + 1);
        this.height = (tileSize + 2) * rows;

        this.panel.setAttribute('style', 'width:' + this.width + 'px; height:' + this.height + 'px');
    }

    Panel.create = function (image) {
        var i, ftile, tiles, panel, map, tileSize;

        tileSize = parseInt(document.querySelector("#tile-size").value, 10);
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
        map.regularize();
        //map.randomize();

        panel.applyMap(map, tiles);

        panel.randomlyMoveBlank(tiles.rows * tiles.cols * 20);
        panel.resetBlank();
        //panel.moveBlank(tiles.rows - 1, tiles.cols - 1);

        for (i = 0; i < tiles.rows - 1; i += 1) {
            ftile = document.createElement('div');
            ftile.style.padding = "1px";
            ftile.style.width = tileSize + "px";
            ftile.style.height = tileSize + "px";
            ftile.style.position = "absolute";
            ftile.style.top = (tileSize + 2) * i + "px";
            ftile.style.left = (tileSize + 2) * tiles.cols + "px";
            ftile.style["background-color"] = "#fff";
            panel.panel.appendChild(ftile);
        }

        // reset counters
        document.querySelector("#step").textContent = '0';
        document.querySelector("#time").textContent = '0.0';

        // start timer
        panel.beginTime = new Date();
        panel.timer = setInterval(function () {
            var now, elapse, time;
            now = new Date();
            elapse = (now - panel.beginTime) / 1000.0;
            time = document.querySelector("#time");
            time.textContent = elapse.toFixed(1);
        }, 100);

        return panel;
    };

    Panel.prototype = {
        show: function () {
            var parent = document.querySelector('#game-area');
            parent.appendChild(this.panel);
        },

        remove: function () {
            var parent = document.querySelector('#game-area');
            parent.removeChild(this.panel);
            if (this.timer) {
                clearInterval(this.timer);
            }
        },

        freeze: function () {
            var i, tiles, tile, row, col, left, top;

            tiles = document.querySelectorAll(".tile");
            for (i = 0; i < tiles.length; i += 1) {
                tile = tiles[i];
                row = parseInt(tile.dataset.mapRow, 10);
                col = parseInt(tile.dataset.mapCol, 10);
                left = parseInt(tile.style.left, 10);
                top = parseInt(tile.style.top, 10);

                tile.style.margin = "0px";
                tile.style.left = (left - col * 2) + "px";
                tile.style.top = (top - row * 2) + "px";

                tile.removeEventListener("click", tile.clickListener);
            }

            clearInterval(this.timer);

            this.panel.style["background-color"] = "#fff";
        },

        addTile: function (row, col, tile) {
            var x, y, self, listener;

            self = this;
            listener = function (evt) {
                self.onMoveTile(tile, evt);
            };

            tile.setAttribute('data-map-row', row);
            tile.setAttribute('data-map-col', col);

            tile.addEventListener('click', listener);
            tile.clickListener = listener;

            x = col * (this.tileSize + 2);
            y = row * (this.tileSize + 2);
            tile.setAttribute('style', 'left: ' + x + 'px; top: ' + y + 'px');
            this.panel.appendChild(tile);
        },

        getTile: function (row, col) {
            var i, tiles, tile, x, y;

            tiles = this.panel.querySelectorAll(".tile");
            for (i = 0; i < tiles.length; i += 1) {
                tile = tiles[i];
                x = parseInt(tile.getAttribute("data-map-row"), 10);
                y = parseInt(tile.getAttribute("data-map-col"), 10);
                if (x === row && y === col) {
                    return tile;
                }
            }

            return null;
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
            var row, col, step;

            row = parseInt(tile.getAttribute('data-map-row'), 10);
            col = parseInt(tile.getAttribute('data-map-col'), 10);
            if (this.moveTile(row, col)) {
                step = document.querySelector("#step");
                step.textContent = parseInt(step.textContent, 10) + 1;
            }

            if (this.map.isRegular()) {
                this.freeze();
            }
        },

        moveTile: function (row, col) {
            var path, newrow, newcol, tile;

            path = this.map.findPath(row, col);
            if (!path) {  // no way to go
                return false;
            }

            newrow = path[0];
            newcol = path[1];
            this.map.swapCells(row, col, newrow, newcol);

            tile = this.getTile(row, col);
            this.moveTile1(newrow, newcol, tile);
            return true;
        },

        moveTile1: function (row, col, tile) {
            var x, y;

            tile.setAttribute('data-map-row', row);
            tile.setAttribute('data-map-col', col);

            x = col * (this.tileSize + 2);
            y = row * (this.tileSize + 2);
            tile.setAttribute('style', 'left: ' + x + 'px; top: ' + y + 'px');
        },

        moveBlank: function (newrow, newcol) {
            var i, coord, row, col, paths, path;

            coord = this.map.findBlank();
            if (coord === null) {
                return;
            }

            row = coord[0];
            col = coord[1];

            paths = this.map.findPathForBlank(row, col);
            if (paths === null) {
                return;
            }

            for (i = 0; i < paths.length; i += 1) {
                path = paths[i];
                if (path[0] === newrow && path[1] === newcol) {
                    this.moveTile(newrow, newcol);
                    break;
                }
            }
        },

        randomlyMoveBlank: function (steps, sleep) {
            if (!(typeof steps === "number" && steps > 0)) {
                return;
            }

            this.randomlyMoveBlank1();

            if (sleep) {
                setTimeout(function (self) {
                    self.randomlyMoveBlank(steps - 1, sleep);
                }, sleep, this);
            } else {
                this.randomlyMoveBlank(steps - 1, sleep);
            }
        },

        randomlyMoveBlank1: function () {
            var coord, paths, path;

            coord = this.map.findBlank();
            if (coord === null) {
                return;
            }

            paths = this.map.findPathForBlank(coord[0], coord[1]);
            if (paths === null) {
                return;
            }

            path = paths[Math.floor(Math.random() * paths.length)];
            if (path) {
                this.moveBlank(path[0], path[1]);
            }
        },

        resetBlank: function (sleep) {
            var coord, dest, distance, paths, path;

            coord = this.map.findBlank();
            if (coord === null) {
                return;
            }

            dest = [this.map.rows - 1, this.map.cols];
            distance = dest[0] - coord[0] + dest[1] - coord[1];
            if (distance === 0) {
                return;
            }

            paths = this.map.findPathForBlank(coord[0], coord[1]);
            if (paths === null) {
                return;
            }

            paths.sort(function (a, b) {
                var da, db;

                da = dest[0] - a[0] + dest[1] - a[1];
                db = dest[0] - b[0] + dest[1] - b[1];
                return da - db;
            });

            path = paths[0];
            this.moveBlank(path[0], path[1]);

            if (sleep) {
                setTimeout(function (self) {
                    self.resetBlank(sleep);
                }, sleep, this);
            } else {
                this.resetBlank(sleep);
            }
        }
    };

    function FileInput(parent) {
        this.parent = parent;
        this.init();
    }

    FileInput.prototype = {
        init: function () {
            var wrapper;

            wrapper = document.createElement("div");
            wrapper.setAttribute("class", "file-input-wrapper");
            wrapper.textContent = "Browse...";
            this.wrapper = wrapper;
            this.show();
        },

        show: function () {
            this.parent.appendChild(this.wrapper);
            this.refresh();
        },

        refresh: function () {
            var self = this;

            if (this.input) {
                this.wrapper.removeChild(this.input);
            }

            this.input = document.createElement("input");
            this.input.setAttribute("type", "file");
            this.input.setAttribute("class", "file-input");
            this.wrapper.appendChild(this.input);

            this.input.addEventListener("click", function (evt) {
                self.onclick(evt);
            });
            this.input.addEventListener("change", function (evt) {
                self.onchange(evt);
                self.refresh();
            });
        },

        remove: function () {
            this.parent.removeChild(this.wrapper);
        },

        onclick: function (evt) {
            var tileSize = parseInt(document.querySelector("#tile-size").value, 10);

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
        },

        onchange: function (evt) {
            var file, image;

            file = evt.target.files[0];
            if (!file) {
                return false;
            }

            if (!file.type.match(/^image\//)) {
                window.alert('not an image file');
                return false;
            }

            image = window.Image.fromLocalFile(file);
            image.onload = function () {
                if (window.panel) {
                    window.panel.remove();
                }

                window.panel = Panel.create(image);
                if (window.panel) {
                    window.panel.show();
                }
            };
        }
    };

    function Game() {
    }

    Game.prototype = {
        load: function () {
            var imgSrc, image;

            imgSrc = this.read('imgSrc');
            if (!imgSrc) {
                return;
            }

            image = window.Image.fromSourceURL(imgSrc);
            image.onload = function () {
                if (window.panel) {
                    window.panel.remove();
                }

                window.panel = Panel.create(image);
                if (window.panel) {
                    window.panel.show();
                }
            };
        },

        keys: function () {
            var i, result;

            result = [];
            for (i = 0; i < window.localStorage.length; i += 1) {
                result.push(window.localStorage.key(i));
            }
            return result;
        },

        read: function (key) {
            return window.localStorage.getItem(key);
        },

        write: function (key, value) {
            return window.localStorage.setItem(key, value);
        },

        remove: function (key) {
            return window.localStorage.removeItem(key);
        },

        clear: function () {
            return window.localStorage.clear();
        }
    };

    if (typeof window.game === "undefined") {
        window.game = new Game();
    }

    window.game.fileInput = new FileInput(document.querySelector('#get-file'));
    window.game.load();

    document.querySelector("#reset").addEventListener("click", function () {
        window.game.load();
    });
}());
