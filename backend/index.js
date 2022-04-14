#!/usr/bin/env node

'use strict';

const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const Server = require('node-git-server');
const { spawn } = require('child_process');

const git = new Server.Git(process.cwd(), {});

git.on('fetch', (fetch) => {
    // console.log('username', fetch.username); // eslint-disable-line
    console.log('fetch ' + fetch.repo + '/' + fetch.commit); // eslint-disable-line
    fetch.accept();
});

const spawn_cmd = (cmd) => new Promise((res,rej) => {

  const ps = spawn(cmd[0], cmd.slice(1))

  ps.stderr.on('data', (data) => {
    console.error("spawn stderr:", data.toString());
  });

  ps.on('exit', async (code) => {
    if (code !== 0) {
      console.log(`spawn failed ${code}, "${cmd}"`);
      rej(code)
    } else {
      console.log(`spawn succeeded ${code}, "${cmd}"`);
      res(code)
    }
  })
})

git.on('push', async (push) => {
    try {
        console.log(`try to push ${push.repo} / ${push.commit} ( ${push.branch} )`); // eslint-disable-line
        // if there are changes on checkout, log and do nothing
        await spawn_cmd(['git', 'diff-index', '--quiet', 'HEAD'])
        // set local repo to bare
        await spawn_cmd(['git', 'config', '--bool', 'core.bare', 'true'])
        // prepare cleanup after push
        push.res.on('finish', async () => {
            console.log(`push finished ${push.repo} / ${push.commit} ( ${push.branch} )`); // eslint-disable-line
            // set local repo to not bare
            await spawn_cmd(['git', 'config', '--bool', 'core.bare', 'false'])
            // set working tree to new HEAD
            await spawn_cmd(['git', 'reset', '--hard'])
        })
        // accept push
        push.accept()
    } catch(e) {
        console.log("push failed", e)
        // set local repo to not bare
        await spawn_cmd(['git', 'config', '--bool', 'core.bare', 'false'])
    }
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
