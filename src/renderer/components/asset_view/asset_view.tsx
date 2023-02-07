import React, { useEffect, useState } from "react";
import { Button, convert, fetchBlob, isIFrameable } from "..";
import { useStore } from "@/store";

interface IAssetViewProps {
  filepath: any;
}

async function onConvert(repoRoute: string, filepath: string, setBlob: any) {
  const blob = await convert(repoRoute, filepath);

  setBlob(blob);
}

async function onUseEffect(repoRoute: string, filepath: string, setBlob: any) {
  if (isIFrameable(filepath)) {
    const blob = await fetchBlob(repoRoute, filepath);

    setBlob(blob);
  }
}

export default function AssetView({ filepath }: IAssetViewProps) {
  const [blob, setBlob] = useState(undefined);

  const repoRoute = useStore((state) => state.repoRoute)

  useEffect(() => {
    onUseEffect(repoRoute, filepath, setBlob);
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
            await onConvert(repoRoute, filepath, setBlob);
          }}
        >
          Convert
        </Button>
      )}
    </>
  );
}
