import React, { useState } from 'react';
import { API } from 'lib/api';
import { useStore } from '@/store/index.js';
import { convert, isIFrameable } from './asset_view_controller.js';

function FileView({ downloadUrl, mimetype }) {
  console.log('FileView', downloadUrl, mimetype);

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

  return <object aria-label="file view" type={mimetype} data={downloadUrl} />;
}

export function AssetView({ schema, entry }) {
  const [blobURL, setBlobURL] = useState(undefined);

  const [mimetype, setMimetype] = useState('');

  const branch = entry._;

  const filehashBranch = Object.keys(schema).find(
    (b) => schema[b].trunk === branch && schema[b].task === 'filehash',
  );

  const filenameBranch = Object.keys(schema).find(
    (b) => schema[b].trunk === branch && schema[b].task === 'filename',
  );

  const repoUUID = useStore((state) => state.repoUUID);

  const api = new API(repoUUID);

  async function onView() {
    const { tags } = await api.getSettings();

    const firstRemote = tags?.items?.find((item) => item._ === 'remote_tag');

    const token = firstRemote?.remote_tag_token;

    let contents = await api.fetchAsset(entry[filehashBranch], token);

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

  return (
    <>
      {!blobURL ? entry[filehashBranch] && entry[filenameBranch] && (
        <div>
          <button type="button" onClick={() => onView()}>▶️</button>

          <p>{entry[filehashBranch]}</p>

          <p>{entry[filenameBranch]}</p>
        </div>
      ) : (
        <div>
          <div>
            <button type="button" onClick={() => setBlobURL(undefined)}>🔽</button>

            <p>{entry[filehashBranch]}</p>

            <p>{entry[filenameBranch]}</p>
          </div>

          <FileView downloadUrl={blobURL} mimetype={mimetype} />
        </div>
      )}
    </>
  );
}
