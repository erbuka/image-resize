#!/usr/bin/env node

const fs = require("fs");
const jimp = require("jimp");
const path = require("path");
const { argv } = require("yargs");

const fileExt = ["jpeg", ".jpg", ".png"];
const targetDir = "./test-folder" || argv.dir;
const targetSize = 1024 || parseInt(argv.size);

const listFiles = function (dir) {
    let result = []
    for (let f of fs.readdirSync(path.resolve(dir))) {
        let file = path.resolve(dir, f);
        if (fileExt.some(ext => file.endsWith(ext)))
            result.push(file);
    }
    return result;
}

for (let f of listFiles(targetDir)) {
    jimp.read(f, (err, val, coords) => {
        if (err) {
            console.error(err.message);
            return;
        }

        let [w, h] = [val.bitmap.width, val.bitmap.height];

        let nw = w >= h ? targetSize : w / h * targetSize;
        let nh = w >= h ? targetSize * h / w : targetSize;

        console.log(`Resize ${path.basename(f)}: [${w} x ${h}] => [${nw} x ${nh}]`);

        val.resize(nw, nh).write(f);

    });
}
