#!/usr/bin/env node

import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import formidable from 'formidable';
import { ServerAPI } from 'evenor/src/lib/api/server.mjs';

const dirname = path.dirname(new URL(import.meta.url).pathname);

console.log(process.cwd());
const api = new ServerAPI(process.cwd());

const router = express.Router();
const app = express();

app.set('query parser', (queryString) => new URLSearchParams(queryString));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/', router);

// on POST `/grep` return results of a search
router.get('/query*', async (req, res) => {
  // console.log('post query', req.path, req.query);

  const overview = await api.select(req.query);

  res.send(overview);
});

// on GET `/api/path` serve `/path` in current directory
router.get('/api/*', async (req, res) => {
  // console.log('get api', req.path);

  const filepath = decodeURI(req.path.replace(/^\/api/, ''));

  const content = await api.fetchFile(filepath);

  res.send(content);
});

// on POST `/api/path` write `/path` in current directory
router.post('/api/*', async (req, res) => {
  // console.log('post api', req.path);

  const { content } = req.body;

  const filepath = decodeURI(req.path.replace(/^\/api/, ''));

  await api.writeFile(filepath, content);

  res.end();
});

// on PUT `/api/path` git commit current directory
router.put('/api/*', async (_, res) => {
  // console.log('put api');

  await api.commit();

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

    const [filehash, filename] = await api.uploadFile(file);

    res.send([filehash, filename]);
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
