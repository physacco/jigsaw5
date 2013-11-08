/*global $: false, window: false, document: false */
$(document).ready(function () {
    "use strict";

    // Check for the various File API support.
    if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
        window.alert('The File APIs are not fully supported in this browser.');
        return;
    }

    var fileInput = $("#file");
    fileInput.on('change', function (evt) {
        var files, file, reader;

        files = evt.target.files;
        if (files.length < 1) {
            return;
        }

        file = files[0];
        if (!file.type.match(/^image\//)) {
            window.alert('not an image file');
            return;
        }

        reader = new window.FileReader();
        reader.readAsDataURL(file);
        reader.onload = function (evt) {
            var image = new window.Image();
            image.src = evt.target.result;
            image.onload = function () {
                var body, width, height, panel, tileXN, tileYN,
                    tileWidth, tileHeight, panelWidth, panelHeight,
                    i, j, sx, sy, px, py, tile, div;

                body = document.getElementsByTagName('body')[0];

                tileWidth = 100;
                tileHeight = 100;

                width = image.width;
                height = image.height;

                tileXN = (width - width % tileWidth) / tileWidth;
                tileYN = (height - height % tileHeight) / tileHeight;

                panel = document.createElement('div');
                panel.setAttribute('class', 'panel');

                panelWidth = (tileWidth + 2) * (tileXN + 1) + 20;
                panelHeight = (tileHeight + 2) * (tileYN + 1) + 20;
                panel.setAttribute('style', 'width:' + panelWidth + 'px; height:' + panelHeight + 'px');

                for (j = 0; j < tileYN; j += 1) {
                    for (i = 0; i < tileXN; i += 1) {
                        sx = i * tileWidth;
                        sy = j * tileHeight;
                        px = i * (tileWidth + 2);
                        py = j * (tileHeight + 2);

                        tile = document.createElement('canvas');
                        tile.setAttribute('class', 'tile');
                        tile.setAttribute('width', tileWidth);
                        tile.setAttribute('height', tileHeight);
                        tile.setAttribute('style', 'left: ' + px + 'px; top: ' + py + 'px');
                        tile.setAttribute('data-row', j);
                        tile.setAttribute('data-col', i);
                        tile.getContext('2d').drawImage(image, sx, sy, tileWidth, tileHeight, 0, 0, tileWidth, tileHeight);
                        panel.appendChild(tile);
                    }
                }

                body.appendChild(panel);
            };
        };
    });
});
