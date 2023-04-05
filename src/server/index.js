#!/usr/bin/env node

import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import fs from 'fs';
import git from 'isomorphic-git';
import { promisify } from 'util';
import { exec } from 'child_process';
import { CSVS } from '@fetsorn/csvs-js';
import formidable from 'formidable';

const dirname = path.dirname(new URL(import.meta.url).pathname);

const router = express.Router();
const app = express();

app.set('query parser', (queryString) => new URLSearchParams(queryString));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/', router);

async function fetchCallback(filepath) {
  const realpath = path.join(process.cwd(), filepath);

  let contents;

  try {
    contents = await fs.promises.readFile(realpath, { encoding: 'utf8' });

    return contents;
  } catch {
    throw ("couldn't find file", filepath);
  }
}

// TODO: add WASM fallback
async function grepCallback(contentFile, patternFile, isInverse) {
  // console.log("grepCallback")

  const contentFilePath = `/tmp/${crypto.randomUUID()}`;

  const patternFilePath = `/tmp/${crypto.randomUUID()}`;

  await fs.promises.writeFile(contentFilePath, contentFile);

  await fs.promises.writeFile(patternFilePath, patternFile);

  let output = '';

  try {
    // console.log(`grep ${contentFile} for ${patternFile}`)
    const { stdout, stderr } = await promisify(exec)(
      'export PATH=$PATH:~/.nix-profile/bin/; '
        + `rg ${isInverse ? '-v' : ''} -f ${patternFilePath} ${contentFilePath}`,
    );

    if (stderr) {
      console.log('grep cli failed', stderr);
    } else {
      output = stdout;
    }
  } catch (e) {
    // console.log('grep cli returned empty', e);
  }

  await fs.promises.unlink(contentFilePath);

  await fs.promises.unlink(patternFilePath);

  return output;
}

// on POST `/grep` return results of a search
router.get('/query*', async (req, res) => {
  // console.log('post query', req.path, req.query);

  try {
    const data = await (new CSVS({
      readFile: fetchCallback,
      grep: grepCallback,
    })).select(req.query);

    res.send(data);
  } catch (e) {
    // console.log('/query', e);
  }
});

// on GET `/api/path` serve `/path` in current directory
router.get('/api/*', (req, res) => {
  // console.log('get api', req.path);

  const filepath = decodeURI(req.path.replace(/^\/api/, ''));

  const realpath = path.join(process.cwd(), filepath);

  res.sendFile(realpath);
});

// on POST `/api/path` write `/path` in current directory
router.post('/api/*', async (req, res) => {
  // console.log('post api', req.path);

  const { content } = req.body;

  const filepath = decodeURI(req.path.replace(/^\/api/, ''));

  const realpath = path.join(process.cwd(), filepath);

  await fs.promises.writeFile(realpath, content);

  res.end();
});

// on PUT `/api/path` git commit current directory
router.put('/api/*', () => {
  // console.log('put api');

  git.commit({
    fs,
    dir: '.',
    author: {
      name: 'fetsorn',
      email: 'fetsorn@gmail.com',
    },
    message: 'qualia',
  }).then((sha) => console.log(sha));
});

// on POST `/upload` write file to lfs/
router.post('/upload', async (req, res) => {
  const form = formidable({});

  const uploadDir = path.join(process.cwd(), 'lfs');

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
    const { file } = files;

    const fileArrayBuffer = fs.readFileSync(file.filepath);

    const hashArrayBuffer = await crypto.webcrypto.subtle.digest(
      'SHA-256',
      fileArrayBuffer,
    );

    const hashByteArray = Array.from(new Uint8Array(hashArrayBuffer));

    const hashHexString = hashByteArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    const uploadPath = path.join(uploadDir, hashHexString);

    await fs.promises.copyFile(file.filepath, uploadPath);

    res.end();
  });
});

// on `/` serve a react app with hash router
router.get('/', (req, res) => {
  // console.log(req.path);

  res.sendFile(path.join(dirname, 'build', 'index.html'));
});

// serve `build/file` at `/file`
app.use(express.static(path.join(dirname, 'build')));

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);

  console.log('Press Ctrl+C to quit.');
});
