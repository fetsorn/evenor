#!/usr/bin/env node

import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import fs from 'fs';
import git from 'isomorphic-git';
import crypto from 'crypto';
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

  // TODO: add try/catch in case file doesn't exist
  const realpath = path.join(process.cwd(), filepath);

  console.log(realpath);

  res.sendFile(realpath);
});

// on POST `/api/path` write `/path` in current directory
router.post('/api/*', async (req, res) => {
  // console.log('post api', req.path);

  const { content } = req.body;

  const filepath = decodeURI(req.path.replace(/^\/api/, ''));

  // TODO: add try/catch and mkdir in case file doesn't exist
  const realpath = path.join(process.cwd(), filepath);

  console.log(realpath);

  await fs.promises.writeFile(realpath, content);

  res.end();
});

// on PUT `/api/path` git commit current directory
router.put('/api/*', async (_, res) => {
  // console.log('put api');

  const dir = '.';

  const message = [];

  const statusMatrix = await git.statusMatrix({
    fs,
    dir,
  });

  for (let [
    filepath,
    HEADStatus,
    workingDirStatus,
    stageStatus,
  ] of statusMatrix) {
    if (HEADStatus === workingDirStatus && workingDirStatus === stageStatus) {
      await git.resetIndex({
        fs,
        dir,
        filepath,
      });

      [filepath, HEADStatus, workingDirStatus, stageStatus] = await git.statusMatrix({
        fs,
        dir,
        filepaths: [filepath],
      });

      if (HEADStatus === workingDirStatus && workingDirStatus === stageStatus) {
        // eslint-disable-next-line
          continue;
      }
    }

    if (workingDirStatus !== stageStatus) {
      let status;

      if (workingDirStatus === 0) {
        status = 'deleted';

        await git.remove({
          fs,
          dir,
          filepath,
        });
      } else {
        // if file in lfs/ add as LFS
        if (filepath.startsWith('lfs')) {
          const { addLFS } = await import('qualia/src/lib/api/lfs.js');

          await addLFS({
            fs,
            dir,
            filepath,
          });
        } else {
          await git.add({
            fs,
            dir,
            filepath,
          });
        }

        if (HEADStatus === 1) {
          status = 'modified';
        } else {
          status = 'added';
        }
      }

      message.push(`${filepath} ${status}`);
    }
  }

  if (message.length !== 0) {
    await git.commit({
      fs,
      dir,
      author: {
        name: 'name',
        email: 'name@mail.com',
      },
      message: message.toString(),
    });
  }

  res.end();
});

// on POST `/upload` write file to lfs/
router.post('/upload', async (req, res) => {
  const form = formidable({});

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

    const uploadDir = path.join(process.cwd(), 'lfs');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
      // console.log(`Directory ${root} is created.`);
    } else {
      // console.log(`Directory ${root} already exists.`);
    }

    const uploadPath = path.join(uploadDir, hashHexString);

    await fs.promises.rename(file.filepath, uploadPath);

    res.send([hashHexString, file.originalFilename]);
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
