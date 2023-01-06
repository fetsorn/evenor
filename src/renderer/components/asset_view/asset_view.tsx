import React, { useEffect, useState } from "react";
import { Button } from "..";
import { onUseEffect, onConvert, isIFrameable } from "./tbn";

interface IAssetViewProps {
  filepath: any;
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
