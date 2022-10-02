#!/usr/bin/env node

'use strict';

import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import fs from 'fs';
import git from 'isomorphic-git';
// import http from 'isomorphic-git/http/node/index.cjs';
import { promisify } from 'util';
import { exec } from 'child_process';
import { queryMetadir } from '@fetsorn/csvs-js';
import formidable from 'formidable';

const __dirname = path.dirname(new URL(import.meta.url).pathname)

const router = express.Router();
const app = express();

app.set('query parser', (queryString) => new URLSearchParams(queryString))

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/", router);

async function fetchCallback(filepath) {
  const realpath = path.join(process.cwd(), filepath)
  let contents
  try {
    contents = await fs.promises.readFile(realpath, { encoding: 'utf8' })
    return contents
  } catch {
    throw("couldn't find file", filepath)
  }
}

async function grepCallback(contentFile, patternFile) {
  // console.log("grepCallback")
  const contentFilePath = "/tmp/content";
  const patternFilePath = "/tmp/pattern";

  await fs.promises.writeFile(contentFilePath, contentFile);
  await fs.promises.writeFile(patternFilePath, patternFile);

  // const { stdout, stderr } = await promisify(exec)(
  //   'export PATH=$PATH:~/.nix-profile/bin/; ' +
  //     `rg -f ${patternFilePath} ${contentFilePath}`);

  let output = '';
  try {
    // console.log(`grep ${contentFile} for ${patternFile}`)
    const { stdout, stderr } = await promisify(exec)(
      'export PATH=$PATH:~/.nix-profile/bin/; ' +
        `rg -f ${patternFilePath} ${contentFilePath}`);

    if (stderr) {
      console.log('grep cli failed');
    } else {
      output = stdout;
    }
  } catch {
    console.log('grep cli returned empty');
  }

  await fs.promises.unlink(contentFilePath);
  await fs.promises.unlink(patternFilePath);

  return output;
}

// on POST `/grep` return results of a search
router.get('/query*', async (req, res) => {
  console.log("post query", req.path, req.query)
  const data = await queryMetadir(
    req.query,
    {
      fetch: fetchCallback,
      grep: grepCallback
    })
  res.send(data)
})

// on GET `/api/path` serve `/path` in current directory
router.get('/api/*', (req, res) => {
  console.log("get api", req.path)
  const filepath = decodeURI(req.path.replace(/^\/api/, ""))
  const realpath = path.join(process.cwd(), filepath)
  res.sendFile(realpath);
})

// on POST `/api/path` write `/path` in current directory
router.post('/api/*', async (req, res) => {
  console.log("post api", req.path)
  const content = req.body.content;
  const filepath = decodeURI(req.path.replace(/^\/api/, ""));
  const realpath = path.join(process.cwd(), filepath)
  await fs.promises.writeFile(realpath, content);
  res.end()
});

// on PUT `/api/path` git commit current directory
router.put('/api/*', () => {
  console.log("put api")
  git.commit({
    fs,
    dir: '.',
    author: {
      name: 'fetsorn',
      email: 'fetsorn@gmail.com',
    },
    message: 'qualia'
  }).then((sha) => console.log(sha))
})

// on POST `/upload` write file to local/
router.post('/upload', async (req, res) => {
  const form = formidable({});
  const uploadDir = path.join(process.cwd(), "local/");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
    // console.log(`Directory ${root} is created.`);
  } else {
    // console.log(`Directory ${root} already exists.`);
  }
  form.uploadDir = uploadDir;
  form.keepExtensions = true;
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.log(err);
      // next(err);
      return;
    }
    const file = files.file;
    const uploadPath = path.join(uploadDir, file.originalFilename);
    await fs.promises.rename(file.filepath, uploadPath)
    res.end()
  });
});

// on `/` serve a react app with hash router
router.get('/', (req, res) => {
  console.log(req.path)
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
})

// serve `build/file` at `/file`
app.use(express.static(path.join(__dirname, 'build')))

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
