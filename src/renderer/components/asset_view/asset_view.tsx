import React from "react";

export default function IFrames({ event: any }) {
  useEffect(() => {
    inUseEffect();
  }, [eventOriginal]);

  useEffect(() => {
    inUseEffect2();
  }, [event]);

  return (
    <>
      {isIFrameable(event?.FILE_PATH) && iframeFetchPath && (
        <Paragraph>
          <iframe
            title="iframe"
            src={iframeFetchPath}
            width="100%"
            height="800px"
          ></iframe>
        </Paragraph>
      )}
      {iframeConvertPath && (
        <Paragraph>
          <iframe
            title="iframe"
            src={iframeConvertPath}
            width="100%"
            height="800px"
          ></iframe>
        </Paragraph>
      )}
      {event?.FILE_PATH &&
        !iframeConvertPath &&
        !isIFrameable(event?.FILE_PATH) && (
          <Button type="button" onClick={onConvert}>
            Convert
          </Button>
        )}
    </>
  );
}
