#!/usr/bin/env node

'use strict';

const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const Server = require('node-git-server');

const git = new Server.Git(process.cwd(), {});

git.on('push', (push) => {
    console.log(`push ${push.repo} / ${push.commit} ( ${push.branch} )`); // eslint-disable-line
    push.accept();
});

git.on('fetch', (fetch) => {
    console.log('username', fetch.username); // eslint-disable-line
    console.log('fetch ' + fetch.repo + '/' + fetch.commit); // eslint-disable-line
    fetch.accept();
});

app.use('/git', function(req, res) {
    git.handle(req, res)
});

app.use((req, res, next) => {
    // on / serve a custom overview page in current directory
    if (/^\/$/i.test(req.path)) {
        res.sendFile(path.join(__dirname, 'build', 'index.html'));
    // on /static skip to serving /build/static
    } else if (/static/i.test(req.path)) {
        next()
    // serve wasm module from /build
    } else if (/\.wasm/i.test(req.path)) {
        next()
    // on /api/assets and /api/hosts, serve assets/ and hosts/ in current directory
    } else if (/api/i.test(req.path)) {
        let filepath = decodeURI(req.path.replace(/^\/api/, ""))
        res.sendFile(path.join(process.cwd(), filepath));
    // in other cases serve a react app that routes urls to /api/assets/ and /api/hosts/
    } else {
        console.log(req.path)
        res.sendFile(path.join(__dirname, 'build', 'index.html'));
    }
});

// serve build/ at /, allows to serve build/static at static/
app.use(express.static(path.join(__dirname, 'build')));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
});
