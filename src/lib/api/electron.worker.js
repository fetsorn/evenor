import fs from 'fs';
import path from 'path';
import { URLSearchParams } from 'url';
import { CSVS } from '@fetsorn/csvs-js';
import crypto from 'crypto';
import { workerData, parentPort } from 'worker_threads';
import wasm from '@fetsorn/wasm-grep/pkg/nodejs/index.js';
import { promisify } from 'util';
import { exec } from 'child_process';
import commandExists from 'command-exists';

async function grepCLI(contentFile, patternFile, isInverted) {
  try {
    await fs.promises.mkdir('/tmp/grep');
  } catch {
    // do nothing
  }

  const contentFilePath = `/tmp/grep/${crypto.randomUUID()}`;

  const patternFilePath = `/tmp/grep/${crypto.randomUUID()}`;

  await fs.promises.writeFile(contentFilePath, contentFile);

  await fs.promises.writeFile(patternFilePath, patternFile);

  let output = '';

  try {
    const { stdout, stderr } = await promisify(exec)(
      'export PATH=$PATH:~/.nix-profile/bin/; '
        + `rg ${isInverted ? '-v' : ''} -f ${patternFilePath} ${contentFilePath}`,
    );

    if (stderr) {
      // console.log('grep cli failed', stderr);
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

async function grep(contentFile, patternFile, isInverted) {
  try {
    await commandExists('rg');

    return grepCLI(contentFile, patternFile, isInverted);
  } catch {
    return wasm.grep(contentFile, patternFile, isInverted ?? false);
  }
}

async function readFile(filepath) {
  const { dir } = workerData;

  const file = path.join(dir, filepath);

  const content = fs.readFileSync(file, { encoding: 'utf8' });

  return content;
}

async function writeFile(filepath, content) {
  const { home, uuid } = workerData;

  const appdata = path.join(home, '.evenor');

  const store = path.join(appdata, 'store');

  const file = path.join(store, uuid, filepath);

  // if path doesn't exist, create it
  // split path into array of directory names
  const pathElements = ['store', uuid].concat(filepath.split('/'));

  // remove file name
  pathElements.pop();

  let root = '';

  for (let i = 0; i < pathElements.length; i += 1) {
    const pathElement = pathElements[i];

    root += '/';

    const files = await fs.promises.readdir(path.join(appdata, root));

    if (!files.includes(pathElement)) {
      // try/catch because csvs can call this in parallel and fail with EEXIST
      try {
        await fs.promises.mkdir(path.join(appdata, root, pathElement));
      } catch {
        // do nothing
      }
    } else {
      // console.log(`${root} has ${pathElement}`)
    }

    root += pathElement;
  }

  await fs.promises.writeFile(file, content);
}

async function select() {
  const { searchParamsString } = workerData;

  const searchParams = new URLSearchParams(searchParamsString);

  const query = await new CSVS({
    readFile,
    grep,
  });

  const entries = await query.select(searchParams);

  parentPort.postMessage(entries);
}

async function updateEntry() {
  const { entry } = workerData;

  const entryNew = await new CSVS({
    readFile,
    writeFile,
    randomUUID: crypto.randomUUID,
  }).update(entry);

  parentPort.postMessage(entryNew);
}

async function deleteEntry() {
  const { entry } = workerData;

  await new CSVS({
    readFile,
    writeFile,
    randomUUID: crypto.randomUUID,
  }).delete(entry);

  parentPort.postMessage({});
}

async function run() {
  const { msg } = workerData;

  switch (msg) {
    case 'select':
      return select();

    case 'update':
      return updateEntry();

    case 'delete':
      return deleteEntry();

    default:
      // do nothing
      return undefined;
  }
}

run();
