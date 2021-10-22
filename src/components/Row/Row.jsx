import cn from 'classnames'

import { formatDate } from '@utils'

import styles from './Row.module.css'

const pickcolor = (event) => {
  const txtcol = "blue"
  const imgcol = "orange"
  const vidcol = "red"
  const pptcol = "yellow"
  const srccol = "brown"
  const wavcol = "green"
  const webcol = "purple"
  const defaultcol = "black"

  if (event.FILETYPE?.includes("text")) { return "blue" }

  // var re =/(?:\.([^.]+))?$/
  // var ext = re.exec(event.PATH)[1].trim()
  var ext = event.PATH.split('.').pop().trim();

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
  const wav = ["caf", "wav", "MOD", "WMA", "aac", "aif", "amr", "m3u", "m4a", "mid", "mp3", "ogg", "pk", "wma", "flac", "aiff"]
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

const Row = ({ data, onEventClick, isLast, ...props }) => (
  <section className={cn(styles.row, { [styles.last]: isLast })} {...props}>
    <time className={styles.date} dateTime={data.date.slice(1,-1)}>
      {formatDate(data.date)}
    </time>
    <div className={styles.content}>
      <div className={styles.stars}>
        {data.events.map((event, index) => (
          <button className={styles.star} style={{"background-color":pickcolor(event)}} type="button" onClick={() => onEventClick(event)} title={event?.PATH} key={event}>
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  </section>
)

export default Row
