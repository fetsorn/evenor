// import mammoth from "mammoth";
import {
  // docx,
  pptx,
  // xlsx,
  // drawml
} from 'docx4js';
// import WordExtractor from "word-extractor";
import { RTFJS } from 'rtf.js';
import cfb from 'cfb';
import PPT from '@fetsorn/ppt';
import git from 'isomorphic-git';
// import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg'
import mime from 'mime';
import http from 'isomorphic-git/http/web/index.cjs';

// returns Blob
export async function fetchAsset(repoRoute, path) {
  // eslint-disable-next-line
  if (__BUILD_MODE__ === 'server') {
    const localpath = `/api/${path}`;

    try {
      const result = await fetch(localpath);

      if (result.ok) {
        return result.blob();
      }

      throw Error(`Cannot load file. Ensure there is a file ${path}.`);
    } catch {
      throw Error(`Cannot load file. Ensure there is a file ${path}.`);
    }
    // eslint-disable-next-line
  } else if (__BUILD_MODE__ === 'electron') {
    try {
      const result = await window.electron.fetchAsset(repoRoute, path);

      const mimetype = mime.getType(path);

      const blob = new Blob([result], { type: mimetype });

      return blob;
    } catch {
      throw Error(`Cannot load file. Ensure there is a file ${path}.`);
    }
  } else {
    // check if path exists in the repo
    const pathElements = [repoRoute].concat(path.split('/'));

    // console.log("fetchDataMetadir: pathElements, path", pathElements, path);

    let root = '';

    for (let i = 0; i < pathElements.length; i += 1) {
      const pathElement = pathElements[i];

      root += '/';

      const files = await window.pfs.readdir(root);

      // console.log("fetchDataMetadir: files", files);

      if (files.includes(pathElement)) {
        root += pathElement;

        // console.log(`fetchDataMetadir: ${root} has ${pathElement}`);
      } else {
        throw Error(
          `Cannot load file. Ensure there is a file called ${pathElement} in ${root}.`,
        );
      }
    }

    const restext = await window.pfs.readFile(`/${repoRoute}/${path}`);

    const mimetype = mime.getType(path);

    const blob = new Blob([restext], { type: mimetype });

    // console.log(restext)

    return blob;
  }
}

async function bodyToBuffer(body) {
  const buffers = [];

  let offset = 0;

  let size = 0;

  for await (const chunk of body) {
    buffers.push(chunk);

    size += chunk.byteLength;
  }

  const result = new Uint8Array(size);

  for (const buffer of buffers) {
    result.set(buffer, offset);

    offset += buffer.byteLength;
  }

  return Buffer.from(result.buffer);
}

export async function resolveLFS(
  filename,
  content,
  remote,
  token,
) {
  const lines = content.split('\n');

  const oid = lines[1].slice(11);

  const size = parseInt(lines[2].slice(5), 10);

  const lfsInfoRequestData = {
    operation: 'download',
    objects: [{ oid, size }],
    transfers: ['basic'],
    ref: { name: 'refs/heads/main' },
  };

  let lfsInfoBody;

  if (token !== '') {
    const { body } = await http.request({
      url: `${remote}/info/lfs/objects/batch`,
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${token}:`).toString('base64')}`,
        Accept: 'application/vnd.git-lfs+json',
        'Content-Type': 'application/vnd.git-lfs+json',
      },
      body: [Buffer.from(JSON.stringify(lfsInfoRequestData))],
    });

    lfsInfoBody = body;
  } else {
    const { body } = await http.request({
      url: `${remote}/info/lfs/objects/batch`,
      method: 'POST',
      headers: {
        Accept: 'application/vnd.git-lfs+json',
        'Content-Type': 'application/vnd.git-lfs+json',
      },
      body: [Buffer.from(JSON.stringify(lfsInfoRequestData))],
    });

    lfsInfoBody = body;
  }

  const lfsInfoResponseRaw = (await bodyToBuffer(lfsInfoBody)).toString();

  const lfsInfoResponse = JSON.parse(lfsInfoResponseRaw);
  // console.log("resolveLFS");
  // console.log(lfsInfoRequestData);
  // console.log(lfsInfoResponse);
  const downloadAction = lfsInfoResponse.objects[0].actions.download;

  const lfsObjectDownloadURL = downloadAction.href;

  const lfsObjectDownloadHeaders = downloadAction.header ?? {};

  const { body: lfsObjectBody } = await http.request({
    url: lfsObjectDownloadURL,
    method: 'GET',
    headers: lfsObjectDownloadHeaders,
  });

  const lfsObjectBuffer = await bodyToBuffer(lfsObjectBody);

  const mimetype = mime.getType(filename);

  const blob = new Blob([lfsObjectBuffer], { type: mimetype });

  return URL.createObjectURL(blob);
}

// fails at parseConfig with "cannot split null",
// as if it doesn't find the config
export async function getRemote(repo) {
  // console.log("getRemote");
  // console.log(window.fs, repo);
  // eslint-disable-next-line
  if (__BUILD_MODE__ === 'electron') {
    try {
      const result = await window.electron.getRemote(repo);

      return result;
    } catch {
      throw Error('Could not create git repo');
    }
  } else {
    return git.getConfig({
      fs: window.fs,
      dir: `/${repo}`,
      path: 'remote.origin.url',
    });
  }
}
// fetch asset blob url
export async function fetchBlob(repoRoute, filepath) {
  // fetch FILEPATH as Blob

  // Blob
  let blob;

  try {
    const lfsPath = `lfs/${filepath}`;

    blob = await fetchAsset(repoRoute, lfsPath);
  } catch (e1) {
    /* console.log("fetch lfs/ failed", e1); */

    try {
      const localPath = `local/${filepath}`;

      blob = await fetchAsset(repoRoute, localPath);
    } catch (e2) {
      /* console.log("fetch local/ failed", e2); */
    }
  }

  if (blob) {
    // try LFS

    try {
      const content = await blob.text();

      const remote = await getRemote(repoRoute);

      const token = '';

      const blobPath = await resolveLFS(filepath, content, remote, token);

      return blobPath;
    } catch (e) {
      /* console.log("lfs failed, setting file", e); */

      const url = URL.createObjectURL(blob);

      return url;
    }
  }

  return undefined;
}

// buf: ArrayBuffer
async function pptxToHtml(buf) {
  const pptxObj = await pptx.load(buf);

  const html = await pptxObj.render((_type, _props, children) => children.join('\n'));

  return html;
}

// buf: ArrayBuffer
// async function docToHtml(buf) {
//   const _buf = Buffer.from(buf);

//   const extractor = new WordExtractor();

//   const document = await extractor.extract(_buf);

//   const html = document.getBody();

//   return html;
// }

// buf: ArrayBuffer
async function pptToHtml(buf) {
  const b = Buffer.from(buf);

  // ppt requires cfb^0.10.0
  const cfbObj = cfb.read(b, { type: 'buffer' });

  const pptObj = PPT.parse_pptcfb(cfbObj);

  // { docs: [ { slideList: [ "" ] } ]
  //   slides: [ { drawing: { groupShape: [ { clientTextbox: { t: "" } } ] } } ] }
  const textboxes = pptObj.slides.map((slide) => slide.drawing?.groupShape

    ?.map((shape) => shape.clientTextbox?.t)

    .join('\n'));

  const headings = pptObj.docs.map((doc) => doc.slideList?.join('\n'));

  const html = headings.join('\n') + textboxes.join('\n');

  return html;
}

// buf: ArrayBuffer
async function rtfToHtml(buf) {
  RTFJS.loggingEnabled(false);

  const doc = new (RTFJS.Document)(buf);

  const divs = await doc.render();

  const html = divs.map((e) => e.outerHTML);

  return html;
}

// importing mammoth fails
// export async function docxToHtml(buf) {
//   const html = await mammoth.convertToHtml(
//     { arrayBuffer: buf },
//     { includeDefaultStyleMap: true }
//   );

//   return html.value;
// }

// ArrayBuffer
export async function toHtml(path, buf) {
  // mammoth fails in electron with "require is not defined"

  // if (/.docx$/.test(path)) {

  //   return docxToHtml(buf);

  // }

  if (/.pptx$/.test(path)) {
    return pptxToHtml(buf);
  }

  // if (/.doc$/.test(path)) {
  //   return docToHtml(buf);
  // }

  if (/.ppt$/.test(path)) {
    return pptToHtml(buf);
  }

  if (/.rtf$/.test(path)) {
    return rtfToHtml(buf);
  }

  throw Error('unknown extension');
}

export async function convert(repoRoute, filepath) {
  const localPath = `local/${filepath}`;

  const blob = await fetchAsset(repoRoute, localPath);

  const abuf = await blob.arrayBuffer();

  // try to convert to html
  try {
    const html = await toHtml(localPath, abuf);

    const content = new Blob([html]);

    const blobURL = URL.createObjectURL(content);

    return blobURL;
  } catch (e1) {
    console.log('handleDoc failed', e1);

    // try to fetch plain text
    try {
      // expose buffer to decode alternate encodings in console, e.g.
      /* new TextDecoder("windows-1251").decode(window.buf); */
      window.buf = abuf;

      const text = new TextDecoder('utf-8').decode(abuf);

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
    'BMP',
    'GIF',
    'ICO',
    'JPEG',
    'JPG',
    'NPO',
    'PNG',
    'TIF',
    'bmp',
    'eps',
    'gif',
    'ico',
    'jpeg',
    'jpg',
    'png',
    'svg',
    'tif',
    'webp',
    'MPO',
  ];

  const vid = [
    'AVI',
    'BUP',
    'IFO',
    'MOV',
    'MP4',
    'VOB',
    'avi',
    'flv',
    'm2v',
    'm4v',
    'mov',
    'mp4',
    'swf',
    'webm',
  ];

  const src = ['PDF', 'Pdf', 'acsm', 'mobi', 'pdf', 'xps'];

  const wav = [
    'caf',
    'MOD',
    'aac',
    'm3u',
    'm4a',
    'mid',
    'mp3',
    'ogg',
    'pk',
    'flac',
  ];

  const web = [
    'less',
    'sass',
    'scss',
    'css',
    'htm',
    'html',
    'js',
    'mht',
    'url',
    'xml',
  ];

  const iframeable = img.concat(vid, src, wav, web);

  return iframeable.includes(ext);
}

// export async function ffmpegInit() {
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

// export async function unoconvert(path) {
//   const resp1 = await fetch(path);

//   const blob1 = await resp1.blob();

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

// const SPEC_URL = 'https://git-lfs.github.com/spec/v1';
// const LFS_POINTER_PREAMBLE = `version ${SPEC_URL}\n`;
// function pointsToLFS(content) {
//   return (
//     content[0] === 118) // 'v'
// && content.subarray(0, 100).indexOf(LFS_POINTER_PREAMBLE) === 0);
// tries to find preamble at the start of the pointer, fails for some reason
// }
