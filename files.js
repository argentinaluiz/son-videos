const fs = require("fs");
const {promisify} = require('util');
const getDuration = require('get-video-duration');
const moment = require('moment');
const fsstat = promisify(fs.stat);

class File {
    constructor(path, filename) {
        this.path = path;
        this.filename = filename;
    }

    async prepareFile() {
        const file = await fsstat(this.fullPath);
        this.lastModified = new Date(file.mtime);

        const seconds = await getDuration(`${this.path}/${this.filename}`);
        this.duration = moment()
            .startOf('day')
            .seconds(seconds)
            .format('mm:ss');
    }

    get fullPath() {
        return `${this.path}/${this.filename}`;
    }

    get filenameNormalized() {
        var map = {
            "a": "á|à|ã",
            "A": "Á|À|Ã",
            "e": "é|ê",
            "E": "É|Ê",
            "i": "í",
            "I": "Í",
            "o": "ó|õ|ô",
            "O": "Ó|Õ|Ô",
            "u": "ú",
            "U": "Ú",
            "c": "ç",
            "C": "Ç"
        };
        let str = this.filename;
        for (var i in map) {
            str = str.replace(new RegExp(map[i], "g"), i);
        }
        return str;
    }
}

class Videos {
    constructor(regexVideo) {
        this.regexVideo = regexVideo;
        this.files = [];
    }

    async addIfVideo(path, filename) {
        if (this.hasVideo(filename)) {
            const file = new File(path, filename);
            await file.prepareFile();
            this.files.push(file);
        }
    }

    hasVideo(fileName) {
        return new RegExp(this.regexVideo).test(fileName);
    }

    renameFiles(prefix) {
        const newPrefix = typeof prefix !== "undefined" ? `${prefix}-` : '';
        const pad = "00";
        this.orderByLastModified();
        this.files.forEach((file, index) => {
            const pos = index + 1;
            fs.renameSync(file.fullPath, `${file.path}/${newPrefix}${(pad + pos).slice(-pad.length)}-${file.filenameNormalized}`);

            file.filename = `${newPrefix}${(pad + pos).slice(-pad.length)}-${file.filenameNormalized}`;
        });
    }

    orderByLastModified() {
        this.files.sort((a, b) => {
            return b.lastModified.getTime() - a.lastModified.getTime() < 0 ? -1 : 1;
        });
    }
}

module.exports = {File, Videos};