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
// import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg'
// import mime from 'mime'

declare global {
  interface Window {
    buf?: any;
  }
}

// fetch asset blob url
export async function fetchBlob(filepath: string): string {
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

async function pptxToHtml(buf: ArrayBuffer): string {
  const _pptx = await pptx.load(buf);

  const html = await _pptx.render((_type: any, _props: any, children: any) => {
    return children.join("\n");
  });

  return html;
}

async function docToHtml(buf: ArrayBuffer): string {
  const _buf = Buffer.from(buf);

  const extractor = new WordExtractor();

  const document = await extractor.extract(_buf);

  const html = document.getBody();

  return html;
}

async function pptToHtml(buf: ArrayBuffer): string {
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
}

async function rtfToHtml(buf: ArrayBuffer): string {
  RTFJS.loggingEnabled(false);

  const doc = new (RTFJS.Document as any)(buf);

  const divs = await doc.render();

  const html = divs.map((e: any) => e.outerHTML);

  return html;
}

// importing mammoth fails
// export async function docxToHtml(buf: ArrayBuffer): string {
//   const html = await mammoth.convertToHtml(
//     { arrayBuffer: buf },
//     { includeDefaultStyleMap: true }
//   );

//   return html.value;
// }

export async function toHtml(path: string, buf: ArrayBuffer): string {
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
}

export async function convert(filepath: string): string {
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

export function isIFrameable(path: string): bool {
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

export async function ffmpegInit(): any {
  const ffmpeg = createFFmpeg({
    corePath: "https:unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js",
    log: true,
  });

  // breaks in firefox if dev tools are open
  const doTranscode = async (path) => {
    try {
      // console.log('Loading ffmpeg-core.js')

      if (!ffmpeg.isLoaded()) {
        await ffmpeg.load();
      }

      console.log("Start transcoding", path);

      const regex = /(?:\.([^.]+))?$/;

      const ext = regex.exec(path)[1]?.trim();

      const filename = "test." + ext;

      ffmpeg.FS(
        "writeFile",
        filename,
        await fetchFile("/api/" + encodeURIComponent(path))
      );

      await ffmpeg.run("-i", filename, "test.mp4");

      console.log("Complete transcoding");

      const data = ffmpeg.FS("readFile", "test.mp4");

      const blobURL = URL.createObjectURL(
        new Blob([data.buffer], { type: "video/mp4" })
      );

      return blobURL;
    } catch (e) {
      console.log(e);

      throw Error(e.toString());
    }
  };

  return { doTranscode };
}

export async function unoconvert(path: string): string {
  const resp1 = await fetch(path);

  const blob1 = await resp1.blob();

  const mimetype = mime.getType(path);

  const resp2 = await fetch(
    `${process.env.REACT_APP_UNOCONV_URL}/convert/format/pdf/output/newname.pdf`,
    {
      method: "POST",
      body: blob1,
      headers: {
        "Content-Type": mimetype,
        "Content-Disposition": 'attachment; filename="example.docx"',
      },
    }
  );

  const blob2 = await resp2.blob();

  const blobURL = URL.createObjectURL(blob2, { type: "application/pdf" });

  return blobURL;
}
