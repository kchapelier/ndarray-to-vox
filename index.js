"use strict";

var cwise = require('cwise');

var getVoxels = cwise({
    funcName: 'getVoxels',
    args: ['index', 'array'],
    pre: function() {
        this.voxels = [];
    },
    body:  function(i, a) {
        if (a > 0) {
            this.voxels.push([i[0], i[1], i[2], Math.ceil(a) - 1]);
        }
    },
    post: function() {
        return this.voxels;
    }
});

var checkNdarray = function checkNdarray (ndarray) {
    if (ndarray.dimension !== 3) {
        throw new Error('Only 3d ndarray are accepted.');
    }

    if (
        ndarray.shape[0] < 1 || ndarray.shape[0] > 126 ||
        ndarray.shape[1] < 1 || ndarray.shape[1] > 126 ||
        ndarray.shape[2] < 1 || ndarray.shape[2] > 126
    ) {
        throw new Error('All sizes must be in the [1-126] range');
    }
};

var ndarrayToVox = function ndarrayToVox (ndarray) {
    checkNdarray(ndarray);

    return generateVox(ndarray);
};

var generateVox = function generateVox (ndarray) {
    // calculate the number of voxel, the chunk sizes and the total size of the resulting file
    var voxels = getVoxels(ndarray),
        nbVoxels = voxels.length,
        xyziChunkNbBytes = 4 + nbVoxels * 4,
        mainChunkNbBytes = 24 + 12 + xyziChunkNbBytes,
        totalNbBytes = 20 + mainChunkNbBytes;

    var buffer = new ArrayBuffer(totalNbBytes),
        data = new DataView(buffer);

    data.setUint32(0, 542658390, true); //VOX
    data.setUint32(4, 150, true); //version

    data.setUint32(8, 1313423693, true); //MAIN
    data.setUint32(12, 0, true); //main content size
    data.setUint32(16, mainChunkNbBytes, true); //main children size

    data.setUint32(20, 1163544915, true); //SIZE
    data.setUint32(24, 12, true); //size content size
    data.setUint32(28, 0, true); //size children size
    data.setUint32(32, ndarray.shape[0], true); //size x
    data.setUint32(36, ndarray.shape[1], true); //size y
    data.setUint32(40, ndarray.shape[2], true); //size z

    data.setUint32(44, 1230657880, true); //XYZI
    data.setUint32(48, xyziChunkNbBytes, true); //xyzi content size
    data.setUint32(52, 0, true); //xyzi children size
    data.setUint32(56, nbVoxels, true); //xyzi children size

    var startVoxelData = 60;

    for (var i = 0; i < nbVoxels; i++) {
        data.setUint8(startVoxelData, voxels[i][0], true); // x
        data.setUint8(startVoxelData + 1, voxels[i][1], true); // y
        data.setUint8(startVoxelData + 2, voxels[i][2], true); // z
        data.setUint8(startVoxelData + 3, voxels[i][3], true); // color index
        startVoxelData +=4;
    }

    return buffer;
};

module.exports = ndarrayToVox;
