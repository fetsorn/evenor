import React, { useState } from 'react';
import { API } from 'lib/api';
import { Button } from '@/components/index.js';
import { useStore } from '@/store/index.js';
import { convert, isIFrameable } from './asset_view_controller.js';

export function AssetView({ filepath }) {
  const [blobURL, setBlobURL] = useState(undefined);

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

    const mimetype = mime.getType(filepath);

    const blob = new Blob([contents], { type: mimetype });

    const blobURLNew = URL.createObjectURL(blob);

    setBlobURL(blobURLNew);
  }

  return (
    <>
      <p>{filepath}</p>
      {blobURL && (
        <iframe title="iframe" src={blobURL} width="100%" height="800px" />
      )}
      {filepath && !blobURL && (
        <Button
          type="button"
          onClick={() => onView()}
        >
          View
        </Button>
      )}
    </>
  );
}
