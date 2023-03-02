#!/usr/bin/env node

const fs = require("fs");
const jimp = require("jimp");
const path = require("path");
const colors = require("colors");
const { argv } = require("yargs");


const fileExt = ["jpeg", ".jpg", ".png"];
const targetDir = argv.dir || ".";
const targetSize = parseInt(argv.size) || 1024;
const recursive = argv.recursive || false;

const listFiles = function (dir) {
	let result = []
	for (let f of fs.readdirSync(path.resolve(dir))) {
		let file = path.resolve(dir, f);
		if (fs.lstatSync(file).isFile() && fileExt.some(ext => file.endsWith(ext)))
			result.push(file);
	}
	return result;
}

const listFolders = function (dir) {
	let result = [path.resolve(dir)];
	for (let f of fs.readdirSync(path.resolve(dir))) {
		let file = path.resolve(dir, f);
		if (fs.lstatSync(file).isDirectory())
			result.push(...listFolders(file));
	}
	return result;
}

const processImages = async function (files) {

	await Promise.all(files.map(async (f) => {
		let val = await jimp.read(f);

		let [w, h] = [val.bitmap.width, val.bitmap.height];

		let nw = w >= h ? targetSize : w / h * targetSize;
		let nh = w >= h ? targetSize * h / w : targetSize;

		if (w >= nw || h >= nh) {
			console.log(`Resize ${colors.yellow(path.basename(f))}: [${w} x ${h}] => [${nw} x ${nh}]`);
			return new Promise((resolve) => val.resize(nw, nh).write(f, () => resolve()));
		}
	}));

}

const folders = recursive ? listFolders(targetDir) : [path.resolve(targetDir)];

for (let dir of folders)
	processImages(listFiles(dir));