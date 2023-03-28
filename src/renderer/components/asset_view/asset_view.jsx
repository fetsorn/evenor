import React, { useState } from 'react';
import { API } from 'lib/api';
import { useStore } from '@/store/index.js';
import { convert, isIFrameable } from './asset_view_controller.js';

function FileView({downloadUrl, mimetype}) {
  console.log("FileView", downloadUrl, mimetype)
  if (mimetype.includes('image')) {
    return <img width="100%" src={downloadUrl} type={mimetype} />;
  }

  if (mimetype.includes('audio')) {
    return <audio controls><source src={downloadUrl} type={mimetype} /></audio>;
  }

  if (mimetype.includes('video')) {
    return <video width="100%" controls><source src={downloadUrl} type={mimetype} /></video>;
  }

  return <object type={mimetype} data={downloadUrl} />;
}

export function AssetView({ filepath }) {
  const [blobURL, setBlobURL] = useState(undefined);

  const [mimetype, setMimetype] = useState("");

  const repoUUID = useStore((state) => state.repoUUID);

  const api = new API(repoUUID);

  async function onView() {
    const { tags } = await api.getSettings();

    const firstRemote = tags?.items?.find((item) => item._ === 'remote_tag');

    const token = firstRemote?.remote_tag_token;

    let contents = await api.fetchAsset(filepath, token);

    if (!isIFrameable(filepath)) {
      contents = await convert(filepath, contents);
    }

    const mime = await import('mime');

    const mimetypeNew = mime.getType(filepath);

    setMimetype(mimetypeNew)

    const blob = new Blob([contents], { type: mimetypeNew });

    const blobURLNew = URL.createObjectURL(blob);

    setBlobURL(blobURLNew);
  }

  return (
    <>
      {!blobURL ? filepath && (
        <div>
          <button type="button" onClick={() => onView()}>▶️</button>

          {filepath}
        </div>
      ) : (
        <div>
          <div>
            <button type="button" onClick={() => setBlobURL(undefined)}>🔽</button>

            {filepath}
          </div>

          <FileView downloadUrl={blobURL} mimetype={mimetype} />
        </div>
      )}
    </>
  );
}
