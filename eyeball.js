"use strict";

var ndarrayToVox = require('./'),
    ndarray = require('ndarray'),
    fs = require('fs');

var data = ndarray(new Uint8Array(27), [3,3,3]);

data.set(2, 2, 2, 1);
data.set(0, 0, 0, 1);
data.set(2, 0, 0, 1);
data.set(2, 0, 2, 1);
data.set(0, 0, 2, 1);
data.set(2, 2, 0, 1);
data.set(0, 2, 2, 1);
data.set(0, 2, 0, 1);

var file = ndarrayToVox(data);

var buffer = new Buffer(new Uint8Array(file));

console.log(buffer);

fs.writeFileSync('test.vox', buffer);
