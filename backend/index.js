#!/usr/bin/env node

'use strict';

const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

app.use((req, res, next) => {
    if (/static/i.test(req.path)) {
        // console.log("match static", req.path)
        next()
    } else if (/api\/(hosts|assets)/i.test(req.path)) {
        // console.log("match hosts/assets", req.path)
        // var trim = req.path.replace(/^\/api/, "")
        // console.log(trim)
        // var full = path.join(process.cwd(), trim)
        // console.log(full)
        res.sendFile(path.join(process.cwd(), req.path.replace(/^\/api/, "")));
    } else {
        // console.log("match default", req.path)
        res.sendFile(path.join(__dirname, 'build', 'index.html'));
    }
});

app.use(express.static(path.join(__dirname, 'build')));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
});
