import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg'
import mime from 'mime'

export function formatDate(date) {
  if (!date) { return '' }
  let match = date.match(/\d+/g)
  if (!match) { return '' }
  return Array.from(match).reverse().join('.')
}

export function isIFrameable(path) {

  const regex = /(?:\.([^.]+))?$/
  let ext = regex.exec(path)[1]

  if (!ext) {
    return false
  }

  const img = ["BMP", "GIF", "ICO", "JPEG", "JPG", "NPO", "PNG", "TIF", "bmp", "eps", "gif", "ico", "jpeg", "jpg", "png", "svg", "tif", "webp", "MPO"]
  const vid = ["AVI", "BUP", "IFO", "MOV", "MP4", "VOB", "avi", "flv", "m2v", "m4v", "mov", "mp4", "swf", "webm"]
  const src = ["PDF", "Pdf", "acsm", "mobi", "pdf", "pub", "xps"]
  const wav = ["caf", "MOD", "aac", "m3u", "m4a", "mid", "mp3", "ogg", "pk", "flac"]
  const web = ["less", "sass", "scss", "css", "htm", "html", "js", "mht", "url", "xml"]
  const iframeable = img + vid + src + wav + web

  return iframeable.includes(ext)
}

export function colorExtension(event) {
  const txtcol = "blue"
  const imgcol = "orange"
  const vidcol = "red"
  const pptcol = "yellow"
  const srccol = "brown"
  const wavcol = "green"
  const webcol = "purple"
  const defaultcol = "black"

  if (event.FILE_TYPE?.includes("text")) { return "blue" }

  // var re =/(?:\.([^.]+))?$/
  // var ext = re.exec(event.FILE_PATH)[1].trim()
  var ext = event.FILE_PATH?.split('.').pop().trim();

  const img = ["BMP", "GIF", "ICO", "JPEG", "JPG", "NPO", "PNG", "TIF", "bmp", "eps", "gif", "ico", "jpeg", "jpg", "png", "svg", "tif", "webp", "MPO", "heic", "HEIC"]
  const imgM = ["xcf", "kra", "ps", "psd"]
  const vid = ["3GP", "3gp", "AVI", "BUP", "IFO", "MOV", "MP4", "VOB", "avi", "flv", "m2v", "m4v", "mkv", "mov", "mp4", "mpg", "swf", "webm", "wmv", "VFO"]
  const vidM = ["cos2", "blend", "mlt", "scn", "stx", "MSWMM", "wlmp", "IDS"]
  const code = ["form", "el", "mk", "PAS", "pas", "java", "H", "c", "cpp", "h", "dcu", "dfm", "dpr", "alp", "vdfx", "MDL", "2mdl", "dproj", "dwf", "identcache", "res", "py", "BAS", "whl", "ipynb", "scm", "sh", "vlb", "ini"]
  const txt = ["12", "TXT", "log", "md", "org", "txt", "fountain", "tex"]
  const ppt = ["gdslides", "pps", "ppt", "pptx"]
  const src = ["PDF", "Pdf", "acsm", "chm", "djvu", "epub", "fb2", "mobi", "pdf", "pub", "xps"]
  const doc = ["DOC", "doc", "docx", "gddoc", "odt", "pages", "rtf"]
  const sh = ["bash_history", "zshrc", "bash_profile", "bashrc", "zsh", "profile", "zsh_history"]
  const wav = ["caf", "wav", "WAV", "MOD", "WMA", "aac", "aif", "amr", "m3u", "m4a", "mid", "mp3", "ogg", "pk", "wma", "flac", "aiff"]
  const wavM = ["ardour", "mmpz", "band", "flm", "gp5", "qtr", "tg", "vst"]
  const tbl = ["csv", "ods", "XLS", "xls", "xlsx"]
  const web = ["less", "sass", "scss", "css", "htm", "html", "js", "mht", "url", "webloc", "xml"]

  if (img.includes(ext)) {return imgcol}
  if (imgM.includes(ext)) {return imgcol}
  if (vid.includes(ext)) {return vidcol}
  if (vidM.includes(ext)) {return vidcol}
  if (code.includes(ext)) {return txtcol}
  if (txt.includes(ext)) {return txtcol}
  if (ppt.includes(ext)) {return pptcol}
  if (src.includes(ext)) {return srccol}
  if (doc.includes(ext)) {return txtcol}
  if (sh.includes(ext)) {return txtcol}
  if (wav.includes(ext)) {return wavcol}
  if (wavM.includes(ext)) {return wavcol}
  if (tbl.includes(ext)) {return txtcol}
  if (web.includes(ext)) {return webcol}

  return defaultcol
}

export async function ffmpegInit() {
  const ffmpeg = createFFmpeg({
    corePath: 'https:unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js',
    log: true,
  });

  // breaks in firefox if dev tools are open
  const doTranscode = async (path) => {
    try {
      // console.log('Loading ffmpeg-core.js')
      if (!ffmpeg.isLoaded()) {
        await ffmpeg.load()
      }
      console.log('Start transcoding', path)

      const regex = /(?:\.([^.]+))?$/
      var ext = regex.exec(path)[1]?.trim()
      var filename = 'test.' + ext
      ffmpeg.FS('writeFile', filename, await fetchFile('/api/' + encodeURIComponent(path)))
      await ffmpeg.run('-i', filename, 'test.mp4')
      console.log('Complete transcoding')
      const data = ffmpeg.FS('readFile', 'test.mp4')
      let blobURL = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }))
      return blobURL
    } catch (e) {
      console.log(e)
      throw Error(e.toString())
    }
  }

  return { doTranscode }
}

const unoconv = async (path) => {
  const resp1 = await fetch('/api/' + path)
  const blob1 = await resp1.blob()
  const mimetype = mime.lookup(path)
  const resp2 = await fetch(`${process.env.REACT_APP_UNOCONV_URL}/convert/format/pdf/output/newname.pdf`,
                            { method: 'POST',
                              body: blob1,
                              headers: {
                                'Content-Type': mimetype,
                                'Content-Disposition': 'attachment; filename="example.docx"'
                              },
                            })
  const blob2 = await resp2.blob()
  let blobURL = URL.createObjectURL(blob2, { type: 'application/pdf' })
  return blobURL
};
