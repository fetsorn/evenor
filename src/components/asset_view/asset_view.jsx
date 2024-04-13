import React, { useState } from "react";
import { API } from "../../api";
import { useStore } from "../../store/index.js";
import { convert, isIFrameable } from "./asset_view_controller.js";

function FileView({ downloadUrl, mimetype }) {
  if (mimetype.includes("image")) {
    return (
      <img alt="file view" width="100%" src={downloadUrl} type={mimetype} />
    );
  }

  if (mimetype.includes("audio")) {
    return (
      <audio controls>
        <track kind="captions" />
        <source src={downloadUrl} type={mimetype} />
      </audio>
    );
  }

  if (mimetype.includes("video")) {
    return (
      <video width="100%" controls>
        <track kind="captions" />
        <source src={downloadUrl} type={mimetype} />
      </video>
    );
  }

  if (mimetype.includes("pdf")) {
    return (
      <iframe
        title={downloadUrl}
        width="100%"
        height="1000"
        src={downloadUrl}
      />
    );
  }

  return <object aria-label="file view" type={mimetype} data={downloadUrl} />;
}

export function AssetView({ schema, record }) {
  const [blobURL, setBlobURL] = useState(undefined);

  const [mimetype, setMimetype] = useState("");

  const branch = record._;

  const filehashBranch = Object.keys(schema).find(
    (b) =>
      (schema[b].trunk === branch || b === branch) &&
      schema[b].task === "filehash",
  );

  const fileextBranch = Object.keys(schema).find(
    (b) => schema[b].trunk === branch && schema[b].task === "fileext",
  );

  const filenameBranch = Object.keys(schema).find(
    // when file is object, filename is a leaf
    // when file is a string, it is also a filename
    (b) =>
      (schema[b].trunk === branch || b === branch) &&
      schema[b].task === "filename",
  );

  const filenameFull = `${record[filenameBranch]}.${record[fileextBranch]}`

  const { repo: repoUUID } = useStore((state) => state.repo);

  const api = new API(repoUUID);

  async function fetchAsset() {
    let contents;

    try {
      contents = await api.fetchAsset(record[filehashBranch]);
    } catch (e) {
      console.log(e);
    }

    // if no contents, try to fetch record[filenameBranch]
    if (contents === undefined) {
      try {
        contents = await api.fetchAsset(filenameFull);
      } catch (e) {
        console.log(e);
      }
    }

    if (contents === undefined) {
      console.log("assetView failed", record);

      return;
    }

    return contents;
  }

  async function onView() {
    let contents = await fetchAsset();

    // if cannot be shown in the browser, try to convert to something that can be shown
    if (!isIFrameable(filenameFull)) {
      contents = await convert(record[filehashBranch], contents);
    }

    const mime = await import("mime");

    const mimetypeNew = mime.getType(filenameFull);

    setMimetype(mimetypeNew);

    const blob = new Blob([contents], { type: mimetypeNew });

    const blobURLNew = URL.createObjectURL(blob);

    setBlobURL(blobURLNew);
  }

  async function onDownload() {
    let contents = await fetchAsset();

    api.downloadAsset(
      contents,
      filenameFull ?? record[filehashBranch],
    );
  }

  if (!blobURL) {
    if (record[filehashBranch] || filenameFull) {
      return (
        <div>
          <p>{record[filehashBranch]}</p>

          <p>{filenameFull}</p>

          <button type="button" onClick={() => onView()}>
            ▶️
          </button>

          <button type="button" onClick={() => onDownload()}>
            ⬇️
          </button>
        </div>
      );
    }
  } else {
    return (
      <div>
        <div>
          <p>{record[filehashBranch]}</p>

          <p>{filenameFull}</p>

          <button type="button" onClick={() => setBlobURL(undefined)}>
            🔽
          </button>

          <button type="button" onClick={() => onDownload()}>
            ⬇️
          </button>
        </div>

        <FileView downloadUrl={blobURL} mimetype={mimetype} />
      </div>
    );
  }
}
