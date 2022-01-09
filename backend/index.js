#!/usr/bin/env node

'use strict';

const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

app.use((req, res, next) => {
    if (/(.ico|.js|.css|.jpg|.png|.map)$/i.test(req.path)) {
        next();
    } else if (/^\/(assets|hosts)\//i.test(req.path)) {
        var options = {
            root: path.join(process.cwd())
        };
        res.sendFile(req.path, options, function (err) {
            if (err) {
                next(err);
            }
        });
    } else {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');
        res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
    }
});

app.use(express.static(path.join(__dirname, 'build')));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
});
