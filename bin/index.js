#!/usr/bin/env node

const fs = require("fs");
const jimp = require("jimp");
const path = require("path");
const colors = require("colors");
const { argv } = require("yargs");


const fileExt = ["jpeg", ".jpg", ".png"];
const targetDir = argv.dir || ".";
const targetSize = parseInt(argv.size) || 1024;

const listFiles = function (dir) {
    let result = []
    for (let f of fs.readdirSync(path.resolve(dir))) {
        let file = path.resolve(dir, f);
        if (fileExt.some(ext => file.endsWith(ext)))
            result.push(file);
    }
    return result;
}

const files = listFiles(targetDir);

if (files.length === 0) {
    console.log("No images were found".yellow)
} else {
    for (let f of files) {
        jimp.read(f, (err, val, coords) => {
            if (err) {
                console.error(err.message);
                return;
            }

            let [w, h] = [val.bitmap.width, val.bitmap.height];

            let nw = w >= h ? targetSize : w / h * targetSize;
            let nh = w >= h ? targetSize * h / w : targetSize;

            console.log(`Resize ${colors.yellow(path.basename(f))}: [${w} x ${h}] => [${nw} x ${nh}]`);

            val.resize(nw, nh).write(f);

        });
    }
}