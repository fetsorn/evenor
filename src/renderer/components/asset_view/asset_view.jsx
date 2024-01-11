import React, { useState } from 'react';
import { API } from '../../../api';
import { useStore } from '@/store/index.js';
import { convert, isIFrameable } from './asset_view_controller.js';

function FileView({ downloadUrl, mimetype }) {
  if (mimetype.includes('image')) {
    return <img alt="file view" width="100%" src={downloadUrl} type={mimetype} />;
  }

  if (mimetype.includes('audio')) {
    return (
      <audio controls>
        <track kind="captions" />
        <source src={downloadUrl} type={mimetype} />
      </audio>
    );
  }

  if (mimetype.includes('video')) {
    return (
      <video width="100%" controls>
        <track kind="captions" />
        <source src={downloadUrl} type={mimetype} />
      </video>
    );
  }

  if (mimetype.includes('pdf')) {
    return (
      <iframe title={downloadUrl} width="100%" height="1000" src={downloadUrl} />
    );
  }

  return <object aria-label="file view" type={mimetype} data={downloadUrl} />;
}

export function AssetView({ schema, entry }) {
  const [blobURL, setBlobURL] = useState(undefined);

  const [mimetype, setMimetype] = useState('');

  const branch = entry._;

  const filehashBranch = Object.keys(schema).find(
    (b) => (schema[b].trunk === branch || b === branch) && schema[b].task === 'filehash',
  );

  const filenameBranch = Object.keys(schema).find(
    // when file is object, filename is a leaf
    // when file is a string, it is also a filename
    (b) => (schema[b].trunk === branch || b === branch) && schema[b].task === 'filename',
  );

  const [repoUUID, isView] = useStore((state) => [state.repoUUID, state.isView]);

  const api = new API(repoUUID);

  async function fetchAsset() {
    let contents;

    try {
      contents = await api.fetchAsset(entry[filehashBranch]);
    } catch(e) {
      console.log(e)
    }

    // if no contents, try to fetch entry[filenameBranch]
    if (contents === undefined) {
      try {
        contents = await api.fetchAsset(entry[filenameBranch])
      } catch(e) {
        console.log(e)
      }
    }

    if (contents === undefined) {
      console.log("assetView failed", entry);

      return;
    }

    return contents
  }

  async function onView() {
    let contents = await fetchAsset();

    // if cannot be shown in the browser, try to convert to something that can be shown
    if (!isIFrameable(entry[filenameBranch])) {
      contents = await convert(entry[filehashBranch], contents);
    }

    const mime = await import('mime');

    const mimetypeNew = mime.getType(entry[filenameBranch]);

    setMimetype(mimetypeNew);

    const blob = new Blob([contents], { type: mimetypeNew });

    const blobURLNew = URL.createObjectURL(blob);

    setBlobURL(blobURLNew);
  }

  async function onDownload() {
    let contents = await fetchAsset();

    api.downloadAsset(contents, entry[filenameBranch] ?? entry[filehashBranch])
  }

  if (!blobURL) {
    if (entry[filehashBranch] || entry[filenameBranch]) {
      return (
        <div>
          <p>{entry[filehashBranch]}</p>

          <p>{entry[filenameBranch]}</p>

          <button type="button" onClick={() => onView()}>▶️</button>

          <button type="button" onClick={() => onDownload()}>⬇️</button>
        </div>
      );
    }
  } else {
    return (
      <div>
        <div>
          <p>{entry[filehashBranch]}</p>

          <p>{entry[filenameBranch]}</p>

          <button type="button" onClick={() => setBlobURL(undefined)}>🔽</button>

          <button type="button" onClick={() => onDownload()}>⬇️</button>
        </div>

        <FileView downloadUrl={blobURL} mimetype={mimetype} />
      </div>
    );
  }
}
