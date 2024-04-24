// async function ffmpegInit() {

// const { createFFmpeg, fetchFile } = await import('@ffmpeg/ffmpeg');
//   const ffmpeg = createFFmpeg({
//     corePath: "https:unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js",
//     log: true,
//   });

//   // breaks in firefox if dev tools are open
//   const doTranscode = async (path) => {
//     try {
//       // console.log('Loading ffmpeg-core.js')

//       if (!ffmpeg.isLoaded()) {
//         await ffmpeg.load();
//       }

//       console.log("Start transcoding", path);

//       const regex = /(?:\.([^.]+))?$/;

//       const ext = regex.exec(path)[1]?.trim();

//       const filename = "test." + ext;

//       ffmpeg.FS(
//         "writeFile",
//         filename,
//         await fetchFile("/api/" + encodeURIComponent(path))
//       );

//       await ffmpeg.run("-i", filename, "test.mp4");

//       console.log("Complete transcoding");

//       const data = ffmpeg.FS("readFile", "test.mp4");

//       const blobURL = URL.createObjectURL(
//         new Blob([data.buffer], { type: "video/mp4" })
//       );

//       return blobURL;
//     } catch (e) {
//       console.log(e);

//       throw Error(e.toString());
//     }
//   };

//   return { doTranscode };
// }

// async function unoconvert(path) {
//   const resp1 = await fetch(path);

//   const blob1 = await resp1.blob();

//   const mime = await import('mime');
//
//   const mimetype = mime.getType(path);

//   const resp2 = await fetch(
//     `${process.env.REACT_APP_UNOCONV_URL}/convert/format/pdf/output/newname.pdf`,
//     {
//       method: "POST",
//       body: blob1,
//       headers: {
//         "Content-Type": mimetype,
//         "Content-Disposition": 'attachment; filename="example.docx"',
//       },
//     }
//   );

//   const blob2 = await resp2.blob();

//   const blobURL = URL.createObjectURL(blob2, { type: "application/pdf" });

//   return blobURL;
// }

// buf: ArrayBuffer
//async function pptxToHtml(buf) {
//
//  // vite fails to package dependency cfb due to recursive import
//  // Error: Cannot copy '../../../../../printj/bin/printj.njs' to a subdirectory of itself, '../../../../../printj/bin/printj.njs'.
//  const {
//    // docx,
//    pptx,
//    // xlsx,
//    // drawml
//  } = await import("docx4js");
//  const pptxObj = await pptx.load(buf);
//
//  const html = await pptxObj.render((_type, _props, children) =>
//    children.join("\n"),
//  );
//
//  return html;
//}

// buf: ArrayBuffer
// async function docToHtml(buf) {
//   const _buf = Buffer.from(buf);

// const WordExtractor = await import("word-extractor");

//   const extractor = new WordExtractor();

//   const document = await extractor.extract(_buf);

//   const html = document.getBody();

//   return html;
// }

// buf: ArrayBuffer
//async function pptToHtml(buf) {
//  const b = Buffer.from(buf);
//
//  // vite fails to package cfb due to recursive import
//  // Error: Cannot copy '../../../../../printj/bin/printj.njs' to a subdirectory of itself, '../../../../../printj/bin/printj.njs'.
//  const cfb = await import("cfb");
//
//  // ppt requires cfb^0.10.0
//  const cfbObj = cfb.read(b, { type: "buffer" });
//
//  const PPT = await import("@fetsorn/ppt");
//
//  const pptObj = PPT.parse_pptcfb(cfbObj);
//
//  // { docs: [ { slideList: [ "" ] } ]
//  //   slides: [ { drawing: { groupShape: [ { clientTextbox: { t: "" } } ] } } ] }
//  const textboxes = pptObj.slides.map((slide) =>
//    slide.drawing?.groupShape
//
//      ?.map((shape) => shape.clientTextbox?.t)
//
//      .join("\n"),
//  );
//
//  const headings = pptObj.docs.map((doc) => doc.slideList?.join("\n"));
//
//  const html = headings.join("\n") + textboxes.join("\n");
//
//  return html;
//}

// buf: ArrayBuffer
async function rtfToHtml(buf) {
  const { RTFJS } = await import("rtf.js");

  RTFJS.loggingEnabled(false);

  const doc = new RTFJS.Document(buf);

  const divs = await doc.render();

  const html = divs.map((e) => e.outerHTML);

  return html;
}

// importing mammoth fails
// async function docxToHtml(buf) {

// const mammoth = await import("mammoth");

//   const html = await mammoth.convertToHtml(
//     { arrayBuffer: buf },
//     { includeDefaultStyleMap: true }
//   );

//   return html.value;
// }

// ArrayBuffer
async function toHtml(path, buf) {
  // mammoth fails in electron with "require is not defined"
  // if (/.docx$/.test(path)) {
  //   return docxToHtml(buf);
  // }

  // if (/.pptx$/.test(path)) {
  //   return pptxToHtml(buf);
  // }

  // if (/.doc$/.test(path)) {
  //   return docToHtml(buf);
  // }

  // if (/.ppt$/.test(path)) {
  //   return pptToHtml(buf);
  // }

  if (/.rtf$/.test(path)) {
    return rtfToHtml(buf);
  }

  throw Error("unknown extension");
}

export async function convert(filepath, blob) {
  const abuf = blob instanceof Blob ? await blob.arrayBuffer() : blob;

  // try to convert to html
  try {
    const html = await toHtml(filepath, abuf);

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

  return undefined;
}

export function isIFrameable(path) {
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
    "txt",
  ];

  const iframeable = img.concat(vid, src, wav, web);

  return iframeable.includes(ext);
}
