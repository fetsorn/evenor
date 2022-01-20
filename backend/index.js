#!/usr/bin/env node

'use strict';

const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

app.use((req, res, next) => {
    // on / serve a custom overview page in current directory
    if (/^\/$/i.test(req.path)) {
      res.sendFile(path.join(process.cwd(), "index.html"));
    // on /static skip to serving /build/static
    } else if (/static/i.test(req.path)) {
        next()
    // on /api/assets and /api/hosts, serve assets/ and hosts/ in current directory
    } else if (/api\/(hosts|assets)/i.test(req.path)) {
        res.sendFile(path.join(process.cwd(), req.path.replace(/^\/api/, "").replace(/%20/g, "\ ")));
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