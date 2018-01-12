#!/usr/bin/env node

const http = require('http');
const path = require('path');
const util = require('util');
const program = require('commander');
const chalk = require('chalk');
const dir = require('node-dir');
const fs = require('fs-extra');
const package = require('./package.json');

program
    .version(package.version);

/**
 * Install sample data responses.
 */
program
    .command('sample')
    .description('Generate a sample data directory with a few sample responses.')
    .option('-d, --dir [directory]', 'Mock data directory [data]', 'data')
    .action(function (env) {
        let src = path.resolve(__dirname, 'data');
        let dest = path.resolve(process.cwd(), env.dir);
        fs.copy(src, dest, err => {
            if (err) { throw err; }
            console.info(chalk.yellowBright('Sample mock API responses created at', dest));
        });
    });

/**
 * Create an API server that serves static files from a specified directory.
 */
program
    .command('static')
    .description('Create a mock API server that uses static directories and data files.')
    .option('-p, --port [port]', 'API webserver port [3000]', 3000)
    .option('-d, --dir [dir]', 'Static response data files directory [data]', 'data')
    .option('-e, --ext [ext]', 'File extension for static response data files [json]', 'json')
    .action(env => {
        const port = env.port;
        const directory = env.dir;
        const extension = env.ext;

        // Server and request handler.
        const server = http.createServer((req, res) => {
            // Get slash-trimmed request URL.
            const reqUrl = req.url.replace(/^\/|\/$/g, '');
            // API resource physical filename on disk.
            let resourceFilename = reqUrl;
            if (extension) {
                resourceFilename += '.' + extension;
            }
            // Create full path to response file.
            const resourceFilePath = path.resolve(process.cwd(), directory, resourceFilename);

            fs.stat(resourceFilePath, (err, stat) => {
                if (err == null) {
                    fs.readFile(resourceFilePath, 'utf8', (err, data) => {
                        res.setHeader('Content-Type', 'application/json');
                        res.end(data);
                    });
                } else {
                    res.statusCode = 404;
                    res.end('Not found');
                }
            });
        });

        server.listen(port, err => {
            if (err) {
                return console.log('Error:', err);
            }

            let regex = new RegExp('.' + extension + '$');
            dir.readFiles(path.resolve(process.cwd(), directory),
                { match: regex },
                (err, content, next) => next(),
                (err, files) => {
                    if (err) {
                        if (err.code == 'ENOENT') {
                            let noRoutesMsg = chalk.yellowBright(`No available routes. Run ${chalk.bgYellow.black('pocketmock sample')} to generate some sample responses.`);
                            console.log(noRoutesMsg);
                            process.exit(0);
                        }

                        throw err;
                    }

                    let srvMsg = chalk.white(util.format('🕹  Mock API Server is listening on %s 🕹', port));
                    let killMsg = chalk.white('💀  Press Ctrl/Cmd + C to stop 💀');
                    console.log("\r\n", srvMsg, "\r\n\r\n", killMsg,  "\r\n");
                    console.log(chalk.white(' Available routes:'));

                    return files.map(file => {
                        let route =  file.replace(path.resolve(process.cwd(), directory), '').replace('.'+extension, '');
                        let fullUrl = 'http://localhost:' + port + route;
                        console.info(chalk.yellowBright(' '+ fullUrl));
                    });
                }
            );
        });
    });

program.parse(process.argv);

if (program.args.length < 1 ) {
    program.help();
}
