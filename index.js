#!/usr/bin/env node
const fs = require('fs');
const getDuration = require('get-video-duration');
const program = require('commander');
const moment = require('moment');

program
    .version('0.0.1')
    .command('time [dir] [regex]')
    .action(function (dir, regex) {
        const path = dir || process.cwd();
        const regexFiles = regex || '\.mp4$';
        let countFilesTest = 0;
        fs.readdir(path, (err, files) => {
            files.forEach(file => {
                if (new RegExp(regexFiles).test(file)) {
                    countFilesTest++;
                    getDuration(`${path}/${file}`).then((seconds) => {
                        const time = moment().startOf('day')
                            .seconds(seconds)
                            .format('mm:ss');
                        console.log(`${file} - ${time}`);
                    });
                }
            });
            if(!countFilesTest.length){
                console.log(`Files not found to ${regexFiles}`);
            }
        })

    });
program.parse(process.argv);