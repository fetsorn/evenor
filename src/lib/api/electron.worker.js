import fs from 'fs';
import path from 'path';
import { URLSearchParams } from 'url';
import { CSVS } from '@fetsorn/csvs-js';
import crypto from 'crypto';

const { workerData, parentPort } = require('worker_threads');
const wasm = require('@fetsorn/wasm-grep/pkg/nodejs/index.js');

async function grep(contentFile, patternFile, isInverted) {
  return wasm.grep(contentFile, patternFile, isInverted ?? false);
}

async function readFile(filepath) {
  const { dir } = workerData;

  const file = path.join(dir, filepath);

  const content = fs.readFileSync(file, { encoding: 'utf8' });

  return content;
}

async function writeFile(filepath, content) {
  const { home } = workerData;

  const appdata = path.join(home, '.qualia');

  const store = path.join(appdata, 'store');

  const file = path.join(store, this.uuid, filepath);

  // if path doesn't exist, create it
  // split path into array of directory names
  const pathElements = ['store', this.uuid].concat(filepath.split('/'));

  // remove file name
  pathElements.pop();

  let root = '';

  for (let i = 0; i < pathElements.length; i += 1) {
    const pathElement = pathElements[i];

    root += '/';

    const files = await fs.promises.readdir(path.join(appdata, root));

    if (!files.includes(pathElement)) {
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

  const entries = await (new CSVS({
    readFile,
    randomUUID: crypto.randomUUID,
    grep,
  })).select(searchParams);

  parentPort.postMessage(entries);
}

async function updateEntry() {
  const { entry } = workerData;

  return new CSVS({
    readFile: (filepath) => readFile(filepath),
    writeFile: (filepath, content) => writeFile(filepath, content),
    randomUUID: crypto.randomUUID,
    grep,
  }).update(entry);
}

async function deleteEntry() {
  const { entry } = workerData;

  return new CSVS({
    readFile: (filepath) => readFile(filepath),
    writeFile: (filepath, content) => writeFile(filepath, content),
    randomUUID: crypto.randomUUID,
    grep,
  }).delete(entry);
}

async function run() {
  const { msg } = workerData;

  switch (msg) {
    case 'query':
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
