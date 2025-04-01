import { Buffer } from "buffer";
import { ReadableStream as ReadableStreamPolyfill } from "web-streams-polyfill";
import { WritableStream as WritableStreamPolyfill } from "web-streams-polyfill";

function myArrayBuffer() {
  // this: File or Blob
  return new Promise((resolve) => {
    let fileReader = new FileReader();

    fileReader.onload = () => {
      resolve(fileReader.result);
    };

    fileReader.readAsArrayBuffer(this);
  });
}

export function polyfill() {
  window.Buffer = window.Buffer || Buffer;

  if (!window.WritableStream) {
    window.WritableStream = WritableStreamPolyfill;
    window.ReadableStream = ReadableStreamPolyfill;
  }

  File.prototype.arrayBuffer = File.prototype.arrayBuffer || myArrayBuffer;
  Blob.prototype.arrayBuffer = Blob.prototype.arrayBuffer || myArrayBuffer;
}

export default { polyfill };
