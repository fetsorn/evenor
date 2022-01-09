#!/usr/bin/env node

'use strict';

const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

app.use((req, res, next) => {
    if (/static/i.test(req.path)) {
        next()
    } else if (/api\/(hosts|assets)/i.test(req.path)) {
        res.sendFile(path.join(process.cwd(), req.path.replace(/^\/api/, "")));
    } else {
        res.sendFile(path.join(__dirname, 'build', 'index.html'));
    }
});

app.use(express.static(path.join(__dirname, 'build')));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
});
