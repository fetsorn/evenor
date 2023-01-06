// import mammoth from "mammoth";
import {
  // docx,
  pptx,
  // xlsx,
  // drawml
} from "docx4js";
import WordExtractor from "word-extractor";
import { RTFJS } from "rtf.js";
import cfb from "cfb";
import PPT from "@fetsorn/ppt";
import { fetchAsset, resolveLFS, getRemote } from "../../workers/git";

declare global {
  interface Window {
    buf?: any;
  }
}

export function onUseEffect(filepath: string, setBlob: any) {
  if (isIFrameable(filepath)) {
    const blob = setIFrameFetch(filepath);

    setBlob(blob);
  }
}

// set iframe blob

async function setIFrameFetch(filepath: string) {
  // fetch FILEPATH as Blob

  let blob: Blob;

  try {
    const lfsPath = "lfs/" + filepath;

    blob = await fetchAsset(lfsPath);
  } catch (e1) {
    /* console.log("fetch lfs/ failed", e1); */

    try {
      const localPath = "local/" + filepath;

      blob = await fetchAsset(localPath);
    } catch (e2) {
      /* console.log("fetch local/ failed", e2); */
    }
  }

  if (blob) {
    // try LFS

    try {
      const content = await blob.text();

      const remote = await getRemote(window.dir);

      const token = "";

      const blobPath = await resolveLFS(filepath, content, remote, token);

      return blobPath;
    } catch (e) {
      /* console.log("lfs failed, setting file", e); */

      const url = URL.createObjectURL(blob);

      return url;
    }
  }
}

export async function onConvert(filepath: string, setBlob: any) {
  const blob = await convert(filepath);

  setBlob(blob);
}

async function convert(filepath: string) {
  const localPath = "local/" + filepath;

  const blob = await fetchAsset(localPath);

  const abuf = await blob.arrayBuffer();

  // try to convert to html

  try {
    const html = await toHtml(localPath, abuf);

    const content = new Blob([html]);

    const blobURL = URL.createObjectURL(content);

    return blobURL;
  } catch (e1) {
    console.log("handleDoc failed", e1);

    // try to fetch plain text

    try {
      // expose buffer to decode alternate encodings in console, e.g.

      /* new TextDecoder("windows-1251").decode(window.buf); */

      window.buf = abuf;

      const text = new TextDecoder("utf-8").decode(abuf);

      const content = new Blob([text]);

      const blobURL = URL.createObjectURL(content);

      return blobURL;
    } catch (e2) {
      /* console.log("handlePlain failed", e2); */
    }
  }
}

const pptxToHtml = async (buf: ArrayBuffer) => {
  const _pptx = await pptx.load(buf);
  const html = await _pptx.render((_type: any, _props: any, children: any) => {
    return children.join("\n");
  });
  return html;
};

const docToHtml = async (buf: ArrayBuffer) => {
  const _buf = Buffer.from(buf);
  const extractor = new WordExtractor();
  const document = await extractor.extract(_buf);
  const html = document.getBody();
  return html;
};

const pptToHtml = async (buf: ArrayBuffer) => {
  const _buf = Buffer.from(buf);
  // ppt requires cfb^0.10.0
  const _cfb = cfb.read(_buf, { type: "buffer" });
  const _ppt = PPT.parse_pptcfb(_cfb);
  // { docs: [ { slideList: [ "" ] } ]
  //   slides: [ { drawing: { groupShape: [ { clientTextbox: { t: "" } } ] } } ] }
  const textboxes = _ppt.slides.map((slide: any) =>
    slide.drawing?.groupShape
      ?.map((shape: any) => shape.clientTextbox?.t)
      .join("\n")
  );
  const headings = _ppt.docs.map((doc: any) => doc.slideList?.join("\n"));
  const html = headings.join("\n") + textboxes.join("\n");
  return html;
};

const rtfToHtml = async (buf: ArrayBuffer) => {
  RTFJS.loggingEnabled(false);
  const doc = new (RTFJS.Document as any)(buf);
  const divs = await doc.render();
  const html = divs.map((e: any) => e.outerHTML);
  return html;
};

export const toHtml = async (path: string, buf: ArrayBuffer) => {
  // mammoth fails in electron with "require is not defined"
  // if (/.docx$/.test(path)) {
  //   return await docxToHtml(buf);
  // }
  if (/.pptx$/.test(path)) {
    return await pptxToHtml(buf);
  }
  if (/.doc$/.test(path)) {
    return await docToHtml(buf);
  }
  if (/.ppt$/.test(path)) {
    return await pptToHtml(buf);
  }
  if (/.rtf$/.test(path)) {
    return await rtfToHtml(buf);
  }

  throw Error("unknown extension");
};

export function isIFrameable(path: string) {
  const regex = /(?:\.([^.]+))?$/;
  const ext = regex.exec(path)[1];

  if (!ext) {
    return false;
  }

  const img = [
    "BMP",
    "GIF",
    "ICO",
    "JPEG",
    "JPG",
    "NPO",
    "PNG",
    "TIF",
    "bmp",
    "eps",
    "gif",
    "ico",
    "jpeg",
    "jpg",
    "png",
    "svg",
    "tif",
    "webp",
    "MPO",
  ];
  const vid = [
    "AVI",
    "BUP",
    "IFO",
    "MOV",
    "MP4",
    "VOB",
    "avi",
    "flv",
    "m2v",
    "m4v",
    "mov",
    "mp4",
    "swf",
    "webm",
  ];
  const src = ["PDF", "Pdf", "acsm", "mobi", "pdf", "xps"];
  const wav = [
    "caf",
    "MOD",
    "aac",
    "m3u",
    "m4a",
    "mid",
    "mp3",
    "ogg",
    "pk",
    "flac",
  ];
  const web = [
    "less",
    "sass",
    "scss",
    "css",
    "htm",
    "html",
    "js",
    "mht",
    "url",
    "xml",
  ];
  const iframeable = img.concat(vid, src, wav, web);

  return iframeable.includes(ext);
}
