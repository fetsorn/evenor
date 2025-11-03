export const mind = "a";

export const name = "name";

export const dir = "a-name";

export const clonepath = `/${mind}`;

export const dirpath = `/${dir}`;

export const query = { a: "b" };

export const entry = { c: "d" };

export const records = [entry];

export const url = "https://example.com/name";

export const token = "f";

export const basename = "g";

export const fileextension = "jpg";

export const filename = `${basename}.${fileextension}`;

export const filepath = `${dirpath}/${filename}`;

export const content = "h";

export const hash =
  "aaa9402664f1a41f40ebbc52c9993eb66aeb366602958fdfaa283b71e64db123";

export const encoded = new TextEncoder().encode(content);

export const pointer = "i";

export const file = new File([encoded], filename);

export default {
  mind,
  name,
  dir,
  dirpath,
  clonepath,
  query,
  entry,
  records,
  url,
  token,
  content,
  encoded,
  basename,
  filename,
  filepath,
  fileextension,
  file,
  hash,
};
