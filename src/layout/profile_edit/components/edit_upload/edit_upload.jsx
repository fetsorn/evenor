import React from "react";
import { useTranslation } from "react-i18next";
import { API } from "../../../../api";
import { useStore } from "../../../../store/index.js";
import { Button, AssetView } from "../../../../components/index.js";
import styles from "./edit_upload.module.css";
import { InputText } from "../index.js";

function UploadButton({ onUpload, title }) {
  // if (__BUILD_MODE__ === "electron") {
  //   return (
  //     <Button type="button" onClick={() => onUpload()}>
  //       {title}
  //     </Button>
  //   );
  // }

  return <input type="file" onChange={(e) => onUpload(e.target.files[0])} />;
}

export function EditUpload({ schema, record, onFieldChange }) {
  const { t } = useTranslation();

  const branch = record._;

  const filehashBranch = Object.keys(schema).find(
    (b) => schema[b].trunk === branch && schema[b].task === "filehash",
  );

  const fileextBranch = Object.keys(schema).find(
    (b) => schema[b].trunk === branch && schema[b].task === "fileext",
  );

  const filenameBranch = Object.keys(schema).find(
    (b) => schema[b].trunk === branch && schema[b].task === "filename",
  );

  const { repo: repoUUID } = useStore((state) => state.repo);

  async function onRename(_, filenameValue) {
    const recordNew = { ...record };

    recordNew[filenameBranch] = filenameValue;

    onFieldChange(branch, recordNew);
  }

  async function onExtension(_, fileextValue) {
    const recordNew = { ...record };

    recordNew[fileextBranch] = fileextValue;

    onFieldChange(branch, recordNew);
  }

  async function onUpload(file) {
    const api = new API(repoUUID);

    const [filehash, filename, fileext] = await api.uploadFile(file);

    const recordNew = { ...record };

    recordNew[filehashBranch] = filehash;

    recordNew[filenameBranch] = filename;

    recordNew[fileextBranch] = fileext;

    onFieldChange(branch, recordNew);
  }

  const notUploaded = record[filehashBranch] === undefined;

  return (
    <div>
      {/* <div>{record.UUID}</div> */}

      <InputText
        {...{
          branch: filenameBranch,
          value: record[filenameBranch] ?? "",
          onFieldChange: onRename,
        }}
      />

      <InputText
        {...{
          branch: fileextBranch,
          value: record[fileextBranch] ?? "",
          onFieldChange: onExtension,
        }}
      />

      {record[filehashBranch] ?? ""}

      {notUploaded && (
        <UploadButton
          onUpload={(file) => onUpload(file)}
          title={t("line.button.upload")}
        />
      )}

      {record[filenameBranch] && record[filehashBranch] && (
        <AssetView {...{ record, schema }} />
      )}
    </div>
  );
}
