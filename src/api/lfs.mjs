import path from "path";

export async function addLFS({ fs, dir, filepath }) {
  const fileBlob = await fs.promises.readFile(path.join(dir, filepath));

  const { buildPointerInfo, formatPointerInfo } = await import(
    "@fetsorn/isogit-lfs"
  );

  const pointerInfo = await buildPointerInfo(fileBlob);

  // turn blob into pointer
  const pointerBlob = formatPointerInfo(pointerInfo);

  const { writeBlob, updateIndex } = await import("isomorphic-git");

  const pointerOID = await writeBlob({
    fs,
    dir,
    blob: pointerBlob,
  });

  await updateIndex({
    fs,
    dir,
    filepath,
    oid: pointerOID,
    add: true,
  });
}
