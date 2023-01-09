import React from "react";
import styles from "./entry_select_button.module.css";

interface IEntrySelectButtonProps {
  entry: any;
  index: any;
  onEntrySelect: any;
}

export default function EntrySelectButton({
  entry,
  index,
  onEntrySelect,
}: IEntrySelectButtonProps) {
  return (
    <button
      className={styles.star}
      style={{ backgroundColor: colorExtension(entry) }}
      type="button"
      onClick={() => onEntrySelect(entry, index + 1)}
      title={entry?.FILE_PATH}
      id={entry?.UUID}
    >
      {index + 1}
    </button>
  );
}

export function colorExtension(entry: any) {
  const txtcol = "blue";
  const imgcol = "orange";
  const vidcol = "red";
  const pptcol = "yellow";
  const srccol = "brown";
  const wavcol = "green";
  const webcol = "purple";
  const defaultcol = "black";

  if (entry.FILE_TYPE?.includes("text")) {
    return "blue";
  }

  // var re =/(?:\.([^.]+))?$/
  // var ext = re.exec(entry.FILE_PATH)[1].trim()
  const ext = entry.FILE_PATH?.split(".").pop().trim();

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
    "heic",
    "HEIC",
  ];
  const imgM = ["xcf", "kra", "ps", "psd"];
  const vid = [
    "3GP",
    "3gp",
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
    "mkv",
    "mov",
    "mp4",
    "mpg",
    "swf",
    "webm",
    "wmv",
    "VFO",
  ];
  const vidM = ["cos2", "blend", "mlt", "scn", "stx", "MSWMM", "wlmp", "IDS"];
  const code = [
    "form",
    "el",
    "mk",
    "PAS",
    "pas",
    "java",
    "H",
    "c",
    "cpp",
    "h",
    "dcu",
    "dfm",
    "dpr",
    "alp",
    "vdfx",
    "MDL",
    "2mdl",
    "dproj",
    "dwf",
    "identcache",
    "res",
    "py",
    "BAS",
    "whl",
    "ipynb",
    "scm",
    "sh",
    "vlb",
    "ini",
  ];
  const txt = ["12", "TXT", "log", "md", "org", "txt", "fountain", "tex"];
  const ppt = ["gdslides", "pps", "ppt", "pptx"];
  const src = [
    "PDF",
    "Pdf",
    "acsm",
    "chm",
    "djvu",
    "epub",
    "fb2",
    "mobi",
    "pdf",
    "pub",
    "xps",
  ];
  const doc = ["DOC", "doc", "docx", "gddoc", "odt", "pages", "rtf"];
  const sh = [
    "bash_history",
    "zshrc",
    "bash_profile",
    "bashrc",
    "zsh",
    "profile",
    "zsh_history",
  ];
  const wav = [
    "caf",
    "wav",
    "WAV",
    "MOD",
    "WMA",
    "aac",
    "aif",
    "amr",
    "m3u",
    "m4a",
    "mid",
    "mp3",
    "ogg",
    "pk",
    "wma",
    "flac",
    "aiff",
  ];
  const wavM = ["ardour", "mmpz", "band", "flm", "gp5", "qtr", "tg", "vst"];
  const tbl = ["csv", "ods", "XLS", "xls", "xlsx"];
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
    "webloc",
    "xml",
  ];

  if (img.includes(ext)) {
    return imgcol;
  }
  if (imgM.includes(ext)) {
    return imgcol;
  }
  if (vid.includes(ext)) {
    return vidcol;
  }
  if (vidM.includes(ext)) {
    return vidcol;
  }
  if (code.includes(ext)) {
    return txtcol;
  }
  if (txt.includes(ext)) {
    return txtcol;
  }
  if (ppt.includes(ext)) {
    return pptcol;
  }
  if (src.includes(ext)) {
    return srccol;
  }
  if (doc.includes(ext)) {
    return txtcol;
  }
  if (sh.includes(ext)) {
    return txtcol;
  }
  if (wav.includes(ext)) {
    return wavcol;
  }
  if (wavM.includes(ext)) {
    return wavcol;
  }
  if (tbl.includes(ext)) {
    return txtcol;
  }
  if (web.includes(ext)) {
    return webcol;
  }

  return defaultcol;
}
