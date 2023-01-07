import React, { useEffect, useState } from "react";
import { Button, convert, fetchBlob, isIFrameable } from "..";

interface IAssetViewProps {
  filepath: any;
}

async function onConvert(filepath: string, setBlob: any) {
  const blob = await convert(filepath);

  setBlob(blob);
}

function onUseEffect(filepath: string, setBlob: any) {
  if (isIFrameable(filepath)) {
    const blob = fetchBlob(filepath);

    setBlob(blob);
  }
}

export default function AssetView({ filepath }: IAssetViewProps) {
  const [blob, setBlob] = useState(undefined);

  useEffect(() => {
    onUseEffect(filepath, setBlob);
  }, [filepath]);

  return (
    <>
      {blob && (
        <iframe title="iframe" src={blob} width="100%" height="800px"></iframe>
      )}
      {filepath && !blob && !isIFrameable(filepath) && (
        <Button
          type="button"
          onClick={async () => {
            await onConvert(filepath, setBlob);
          }}
        >
          Convert
        </Button>
      )}
    </>
  );
}
