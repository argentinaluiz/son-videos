#!/usr/bin/env node
const { Videos} = require("./files");

const fs = require('fs');

const program = require('commander');

program
    .version('0.0.1')
    .command('time [prefix] [dir] [regex]')
    .action(function (prefix,dir, regex) {
        const path = dir || process.cwd();
        const regexFiles = regex || '\.mp4$';
        const videosCollection = new Videos(regexFiles);
        const promiseCollection = [];
        fs.readdir(path, (err, files) => {
            for (let file of files) {
                const isDir = fs.statSync(`${path}/${file}`).isDirectory();
                if(isDir){
                    continue;
                }
                promiseCollection.push(videosCollection.addIfVideo(path, file));
            }
            Promise.all(promiseCollection).then(() => {
                if (!videosCollection.files.length) {
                    console.log(`Files not found to ${regexFiles}`);
                    return;
                }
                videosCollection.renameFiles(prefix);
                for (let video of videosCollection.files) {
                    console.log(`${video.filename} - ${video.duration}`);
                }
            })
        });
        // fs.readdir(path, (err, files) => {
        //     files.forEach(file => {
        //         if (new RegExp(regexFiles).test(file)) {
        //             countFilesTest++;
        //             getDuration(`${path}/${file}`).then((seconds) => {
        //                 const time = moment().startOf('day')
        //                     .seconds(seconds)
        //                     .format('mm:ss');
        //                 console.log(`${file} - ${time}`);
        //             });
        //         }
        //     });
        //     if (!countFilesTest) {
        //         console.log(`Files not found to ${regexFiles}`);
        //     }
        // })

    });
program.parse(process.argv);