// import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg'
// import mime from 'mime'

export function formatDate(date: string) {
  if (!date) {
    return "";
  }
  // TODO: test for date better
  // if first character is digit, treat as date
  const match = date.match(/\d+/g);
  if (!match) {
    return "";
  }
  return Array.from(match).reverse().join(".");
}

// export async function ffmpegInit() {
//   const ffmpeg = createFFmpeg({
//     corePath: 'https:unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js',
//     log: true,
//   });

//   // breaks in firefox if dev tools are open
//   const doTranscode = async (path) => {
//     try {
//       // console.log('Loading ffmpeg-core.js')
//       if (!ffmpeg.isLoaded()) {
//         await ffmpeg.load()
//       }
//       console.log('Start transcoding', path)

//       const regex = /(?:\.([^.]+))?$/
//       var ext = regex.exec(path)[1]?.trim()
//       var filename = 'test.' + ext
//       ffmpeg.FS('writeFile', filename, await fetchFile('/api/' + encodeURIComponent(path)))
//       await ffmpeg.run('-i', filename, 'test.mp4')
//       console.log('Complete transcoding')
//       const data = ffmpeg.FS('readFile', 'test.mp4')
//       let blobURL = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }))
//       return blobURL
//     } catch (e) {
//       console.log(e)
//       throw Error(e.toString())
//     }
//   }

//   return { doTranscode }
// }

// export const unoconvert = async (path) => {
//   const resp1 = await fetch(path)
//   const blob1 = await resp1.blob()
//   const mimetype = mime.getType(path)
//   const resp2 = await fetch(`${process.env.REACT_APP_UNOCONV_URL}/convert/format/pdf/output/newname.pdf`,
//                             { method: 'POST',
//                               body: blob1,
//                               headers: {
//                                 'Content-Type': mimetype,
//                                 'Content-Disposition': 'attachment; filename="example.docx"'
//                               },
//                             })
//   const blob2 = await resp2.blob()
//   let blobURL = URL.createObjectURL(blob2, { type: 'application/pdf' })
//   return blobURL
// }

// export const docxToHtml = async (buf: ArrayBuffer) => {
//   const html = await mammoth.convertToHtml(
//     { arrayBuffer: buf },
//     { includeDefaultStyleMap: true }
//   );
//   return html.value;
// };
