import http from "isomorphic-git/http/web";
import LightningFS from "@isomorphic-git/lightning-fs";
import git from "isomorphic-git";
import mime from "mime";
import axios from "axios";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";
import { digestMessage } from "@fetsorn/csvs-js";

export function gitInit(pathname: string) {
  // console.log("gitInit");
  window.fs = new LightningFS("fs");
  window.pfs = window.fs.promises;
  const url = pathname;
  window.dir = url.split("/")[1]; // take first element
  // .replace(/\.[^/.]+$/, "") // remove extension
  // console.log(
  //   "gitInit: url, last, window.dir",
  //   url,
  //   url.lastIndexOf("/"),
  //   window.dir
  // );
}

export async function writeDataMetadir(path: string, content: string) {
  // console.log("writeDataMetadir");
  if (__BUILD_MODE__ === "server") {
    const localpath = "/api/" + path;
    try {
      await axios.post(localpath, {
        content,
      });
      // console.log("written", path);
    } catch (e) {
      console.log(e);
      throw Error(`Cannot write file ${path}. ${e}`);
    }
  } else if (__BUILD_MODE__ === "electron") {
    try {
      await window.electron.writeDataMetadir(window.dir, path, content);
    } catch {
      throw Error(`Cannot write file ${path}.`);
    }
  } else {
    // if path doesn't exist, create it
    // split path into array of directory names
    const path_elements = [window.dir].concat(path.split("/"));
    // console.log(path_elements, path)
    // remove file name
    path_elements.pop();
    let root = "";
    for (let i = 0; i < path_elements.length; i++) {
      const path_element = path_elements[i];
      root += "/";
      const files = await window.pfs.readdir(root);
      // console.log(files)
      if (!files.includes(path_element)) {
        // console.log(`creating directory ${path_element} in ${root}`)
        await window.pfs.mkdir(root + "/" + path_element);
      } else {
        // console.log(`${root} has ${path_element}`)
      }
      root += path_element;
    }
    await window.pfs.writeFile("/" + window.dir + "/" + path, content, "utf8");
  }
}

export async function fetchAsset(path: string): Promise<Blob> {
  // console.log(
  //   `fetchDataMetadir: window.dir ${
  //     window.dir
  //   }, path ${path}, path_elements ${path.split("/")}`
  // );
  if (__BUILD_MODE__ === "server") {
    const localpath = "/api/" + path;
    try {
      const result = await fetch(localpath);
      if (result.ok) {
        return result.blob();
      }
      throw Error(`Cannot load file. Ensure there is a file ${path}.`);
    } catch {
      throw Error(`Cannot load file. Ensure there is a file ${path}.`);
    }
  } else if (__BUILD_MODE__ === "electron") {
    try {
      const result = await window.electron.fetchAsset(window.dir, path);
      const mimetype = mime.getType(path);
      const blob = new Blob([result], { type: mimetype });
      return blob;
    } catch {
      throw Error(`Cannot load file. Ensure there is a file ${path}.`);
    }
  } else {
    // check if path exists in the repo
    const path_elements = [window.dir].concat(path.split("/"));
    // console.log("fetchDataMetadir: path_elements, path", path_elements, path);
    let root = "";
    for (let i = 0; i < path_elements.length; i++) {
      const path_element = path_elements[i];
      root += "/";
      const files = await window.pfs.readdir(root);
      // console.log("fetchDataMetadir: files", files);
      if (files.includes(path_element)) {
        root += path_element;
        // console.log(`fetchDataMetadir: ${root} has ${path_element}`);
      } else {
        throw Error(
          `Cannot load file. Ensure there is a file called ${path_element} in ${root}.`
        );
      }
    }
    const restext = await window.pfs.readFile("/" + window.dir + "/" + path);
    const mimetype = mime.getType(path);
    const blob = new Blob([restext], { type: mimetype });
    // console.log(restext)
    return blob;
  }
}

export async function uploadFile(file: File) {
  if (__BUILD_MODE__ === "server") {
    const form = new FormData();
    form.append("file", file);
    await axios.post("/upload", form);
  } else {
    const root = "/";
    const rootFiles = await window.pfs.readdir("/");
    const repoDir = root + window.dir;
    if (!rootFiles.includes(window.dir)) {
      await window.pfs.mkdir(repoDir);
    }
    const repoFiles = await window.pfs.readdir(repoDir);
    const local = "local";
    const localDir = repoDir + "/" + local;
    if (!repoFiles.includes(local)) {
      await window.pfs.mkdir(localDir);
    }
    const localFiles = await window.pfs.readdir(localDir);
    const filename = file.name;
    const filepath = localDir + "/" + filename;
    if (!localFiles.includes(filename)) {
      const buf = await file.arrayBuffer();
      await window.pfs.writeFile(filepath, buf);
    }
  }
}

export async function zip(repo: string) {
  if (__BUILD_MODE__ === "server" || __BUILD_MODE__ === "electron") {
    //
  } else {
    const { default: jsZip } = await import("jszip");
    const zip = new jsZip();
    const foo = async (dir: string, zipDir: any) => {
      const files = await window.pfs.readdir(dir);
      for (const file of files) {
        const filepath = dir + "/" + file;
        const { type: filetype } = await window.pfs.stat(filepath);
        if (filetype === "file") {
          const content = await window.pfs.readFile(filepath);
          zipDir.file(file, content);
        } else if (filetype === "dir") {
          const zipDirNew = zipDir.folder(file);
          foo(filepath, zipDirNew);
        }
      }
    };
    await foo("/" + repo, zip);
    zip.generateAsync({ type: "blob" }).then(function (content: any) {
      saveAs(content, "archive.zip");
    });
  }
}

// const SPEC_URL = 'https://git-lfs.github.com/spec/v1';
// const LFS_POINTER_PREAMBLE = `version ${SPEC_URL}\n`;
// function pointsToLFS(content) {
//   return (
//     content[0] === 118) // 'v'
// && content.subarray(0, 100).indexOf(LFS_POINTER_PREAMBLE) === 0);
// tries to find preamble at the start of the pointer, fails for some reason
// }

async function bodyToBuffer(body: any) {
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
  filename: string,
  content: string,
  remote: string,
  token: string
) {
  const lines = content.split("\n");
  const oid = lines[1].slice(11);
  const size = parseInt(lines[2].slice(5));

  const lfsInfoRequestData = {
    operation: "download",
    objects: [{ oid, size }],
    transfers: ["basic"],
    ref: { name: "refs/heads/main" },
  };

  let lfsInfoBody;
  if (token !== "") {
    const { body } = await http.request({
      url: `${remote}/info/lfs/objects/batch`,
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${token}:`).toString("base64")}`,
        Accept: "application/vnd.git-lfs+json",
        "Content-Type": "application/vnd.git-lfs+json",
      },
      body: [Buffer.from(JSON.stringify(lfsInfoRequestData))],
    });
    lfsInfoBody = body;
  } else {
    const { body } = await http.request({
      url: `${remote}/info/lfs/objects/batch`,
      method: "POST",
      headers: {
        Accept: "application/vnd.git-lfs+json",
        "Content-Type": "application/vnd.git-lfs+json",
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
    method: "GET",
    headers: lfsObjectDownloadHeaders,
  });

  const lfsObjectBuffer = await bodyToBuffer(lfsObjectBody);

  const mimetype = mime.getType(filename);

  const blob = new Blob([lfsObjectBuffer], { type: mimetype });

  return URL.createObjectURL(blob);
}

// get "repo" from "https://github.com/user/repo"
function lastUrlDir(url: string) {
  return url.substring(url.lastIndexOf("/") + 1).replace(/\.[^/.]+$/, "");
}

async function dirNew(dir: string) {
  const files = await window.pfs.readdir("/");
  const [name, suffix] = dir.split("#");
  let suffixNum = Number.isNaN(suffix) ? parseInt(suffix) : 0;
  while (files.includes(dir)) {
    suffixNum++;
    dir = `${name}#${suffixNum}`;
  }
  return dir;
}

export async function clone(
  url: string,
  token: string,
  dir: string = lastUrlDir(url)
) {
  console.log("clone", url, token, dir);

  if (__BUILD_MODE__ === "electron") {
    try {
      await window.electron.clone(url, token, dir);
    } catch (e) {
      throw e;
    }
  } else {
    dir = await dirNew(dir);
    try {
      // attempt to clone a public repo if no token is provided
      if (token === "") {
        await git.clone({
          fs: window.fs,
          http,
          dir: "/" + dir,
          url,
          singleBranch: true,
          depth: 1,
        });
      } else {
        await git.clone({
          fs: window.fs,
          http,
          dir: "/" + dir,
          url,
          singleBranch: true,
          depth: 1,
          onAuth: () => ({
            username: token,
          }),
        });
      }
      // console.log("repo cloned")
    } catch (e) {
      rimraf("/" + dir);
      throw e;
    }
  }
}

export async function gitcommit(repo: string) {
  // console.log("commit");
  if (__BUILD_MODE__ === "server") {
    try {
      await axios.put("api/");
    } catch (e) {
      console.log(e);
    }
  }
  const message = [];
  const statusMatrix: any = await git.statusMatrix({
    fs: window.fs,
    dir: "/" + repo,
  });
  for (let [
    filePath,
    HEADStatus,
    workingDirStatus,
    stageStatus,
  ] of statusMatrix) {
    if (HEADStatus === workingDirStatus && workingDirStatus === stageStatus) {
      await git.resetIndex({
        fs: window.fs,
        dir: "/" + repo,
        filepath: filePath,
      });
      [filePath, HEADStatus, workingDirStatus, stageStatus] =
        await git.statusMatrix({
          fs: window.fs,
          dir: "/" + repo,
          filepaths: [filePath],
        });
      if (HEADStatus === workingDirStatus && workingDirStatus === stageStatus) {
        continue;
      }
    }
    if (workingDirStatus !== stageStatus) {
      let status;
      if (workingDirStatus === 0) {
        status = "deleted";
        await git.remove({
          fs: window.fs,
          dir: "/" + repo,
          filepath: filePath,
        });
      } else {
        await git.add({
          fs: window.fs,
          dir: "/" + repo,
          filepath: filePath,
        });
        if (HEADStatus === 1) {
          status = "modified";
        } else {
          status = "added";
        }
      }
      message.push(`${filePath} ${status}`);
    }
  }
  if (message.length !== 0) {
    // console.log("commit:", message.toString());
    await git.commit({
      fs: window.fs,
      dir: "/" + repo,
      author: {
        name: "name",
        email: "name@mail.com",
      },
      message: message.toString(),
    });
  }
}

export async function gitpull(repo: string, token: string) {
  // console.log("gitPull");
  // fastForward instead of pull
  // https://github.com/isomorphic-git/isomorphic-git/issues/1073
  await git.fastForward({
    fs: window.fs,
    http,
    dir: "/" + repo,
    onAuth: () => ({
      username: token,
    }),
  });
}

export async function gitpush(repo: string, token: string) {
  // console.log("gitPush");
  await git.push({
    fs: window.fs,
    http,
    force: true,
    dir: "/" + repo,
    remote: "origin",
    onAuth: () => ({
      username: token,
    }),
  });
}

export async function wipe() {
  // console.log("wipe");
  new LightningFS("fs", { wipe: true } as any);
}

export async function gitListRepos() {
  if (__BUILD_MODE__ === "electron") {
    try {
      const result = await window.electron.gitListRepos();
      return result;
    } catch (e) {
      throw Error(`Could not list repos ${e}`);
    }
  } else {
    // console.log("gitListRepos");
    const repos = await window.pfs.readdir("/");
    return repos;
  }
}

// fails at parseConfig with "cannot split null",
// as if it doesn't find the config
export async function getRemote(repo: string) {
  // console.log("getRemote");
  // console.log(window.fs, repo);
  if (__BUILD_MODE__ === "electron") {
    try {
      const result = await window.electron.getRemote(repo);
      return result;
    } catch {
      throw Error(`Could not create git repo`);
    }
  } else {
    return await git.getConfig({
      fs: window.fs,
      dir: "/" + repo,
      path: "remote.origin.url",
    });
  }
}

export async function gitCreate(repo: string) {
  if (__BUILD_MODE__ === "electron") {
    try {
      const result = await window.electron.gitCreate(repo);
      return result;
    } catch {
      throw Error(`Could not create git repo`);
    }
  } else {
    const root = "/";
    const repoDir = root + repo;
    if ((await window.pfs.readdir("/")).includes(repo)) {
      console.log("repo exists");
    } else {
      await window.pfs.mkdir(repoDir);
      await git.init({ fs: window.fs, dir: repoDir });
      await window.pfs.mkdir(repoDir + "/metadir");
      await window.pfs.writeFile(repoDir + "/metadir.json", manifest, "utf8");
      await window.pfs.mkdir(repoDir + "/metadir/props");
      await window.pfs.mkdir(repoDir + "/metadir/props/datum");
      await window.pfs.writeFile(
        repoDir + "/metadir/props/datum/index.csv",
        "",
        "utf8"
      );
      await window.pfs.mkdir(repoDir + "/metadir/props/date");
      await window.pfs.writeFile(
        repoDir + "/metadir/props/date/index.csv",
        "",
        "utf8"
      );
      await window.pfs.mkdir(repoDir + "/metadir/props/name");
      await window.pfs.writeFile(
        repoDir + "/metadir/props/name/index.csv",
        "",
        "utf8"
      );
      await window.pfs.mkdir(repoDir + "/metadir/props/tag");
      await window.pfs.writeFile(
        repoDir + "/metadir/props/tag/index.csv",
        "",
        "utf8"
      );
      await window.pfs.mkdir(repoDir + "/metadir/props/filepath");
      await window.pfs.writeFile(
        repoDir + "/metadir/props/filepath/index.csv",
        "",
        "utf8"
      );
      await window.pfs.mkdir(repoDir + "/metadir/props/filetype");
      await window.pfs.writeFile(
        repoDir + "/metadir/props/filetype/index.csv",
        "",
        "utf8"
      );
      await window.pfs.mkdir(repoDir + "/metadir/props/filesize");
      await window.pfs.writeFile(
        repoDir + "/metadir/props/filesize/index.csv",
        "",
        "utf8"
      );
      await window.pfs.mkdir(repoDir + "/metadir/props/privacy");
      await window.pfs.writeFile(
        repoDir + "/metadir/props/privacy/index.csv",
        "",
        "utf8"
      );
      await window.pfs.mkdir(repoDir + "/metadir/props/pathrule");
      await window.pfs.writeFile(
        repoDir + "/metadir/props/pathrule/index.csv",
        "",
        "utf8"
      );
      await window.pfs.mkdir(repoDir + "/metadir/pairs");
      await window.pfs.writeFile(
        repoDir + "/metadir/pairs/datum-hostdate.csv",
        "",
        "utf8"
      );
      await window.pfs.writeFile(
        repoDir + "/metadir/pairs/datum-guestdate.csv",
        "",
        "utf8"
      );
      await window.pfs.writeFile(
        repoDir + "/metadir/pairs/datum-privacy.csv",
        "",
        "utf8"
      );
      await window.pfs.writeFile(
        repoDir + "/metadir/pairs/datum-hostname.csv",
        "",
        "utf8"
      );
      await window.pfs.writeFile(
        repoDir + "/metadir/pairs/datum-guestname.csv",
        "",
        "utf8"
      );
      await window.pfs.writeFile(
        repoDir + "/metadir/pairs/datum-filepath.csv",
        "",
        "utf8"
      );
      await window.pfs.writeFile(
        repoDir + "/metadir/pairs/datum-tag.csv",
        "",
        "utf8"
      );
      await window.pfs.writeFile(
        repoDir + "/metadir/pairs/filepath-moddate.csv",
        "",
        "utf8"
      );
      await window.pfs.writeFile(
        repoDir + "/metadir/pairs/filepath-filetype.csv",
        "",
        "utf8"
      );
      await window.pfs.writeFile(
        repoDir + "/metadir/pairs/filepath-filesize.csv",
        "",
        "utf8"
      );
      await window.pfs.writeFile(
        repoDir + "/metadir/pairs/filepath-filehash.csv",
        "",
        "utf8"
      );
      await gitcommit(repo);
    }
  }
}

export async function rimraf(path: string) {
  if (__BUILD_MODE__ === "electron") {
    try {
      await window.electron.rimraf(path);
    } catch {
      throw Error(`Could not rimraf ${path}`);
    }
  } else {
    // console.log("rimraf");
    let files;
    try {
      files = await window.pfs.readdir(path);
    } catch {
      throw Error(`can't read ${path} to rimraf it`);
    }
    // console.log(files);
    for (const file of files) {
      const filepath = path + "/" + file;
      const { type } = await window.pfs.stat(filepath);
      // console.log(`${filepath} is ${type}`);
      if (type === "file") {
        // console.log("unlink", filepath);
        await window.pfs.unlink(filepath);
      } else if (type === "dir") {
        await rimraf(filepath);
      }
    }
    // console.log("rmdir", path);
    await window.pfs.rmdir(path);
  }
}

// const handleOpenEvent = async (event: any, index: any) => {
//   setEvent(event);
//   setEventIndex(index);
// };

// const addEvent = async (date: string, index: string) => {
//   const _event: Record<string, string> = {};

//   // file event with a random UUID
//   _event.UUID = await digestMessage(crypto.randomUUID());
//   _event.DATUM = "";

//   // fill event with the date from which it was pulled
//   const groupBy_label = schema[groupBy]["label"] ?? groupBy;
//   _event[groupBy_label] = date ?? "0000-00-00";

//   // fill event with values from search query
//   Object.keys(schema).map((prop: any) => {
//     const label = schema[prop]["label"] ?? prop;
//     const searchParams = new URLSearchParams(location.search);
//     if (searchParams.has(prop)) {
//       _event[label] = searchParams.get(prop);
//     }
//   });

//   setEventIndex(index);
//   setEvent(_event);
//   setIsEdit(true);
// };

// const reloadPage = async (
//   searchParams = new URLSearchParams(location.search)
// ) => {
//   // setIsLoading(true);

//   gitInit(location.pathname);

//   /* console.log("called worker to query"); */
//   let _data: any = [];
//   try {
//     _data = await queryWorker.queryMetadir(searchParams);
//   } catch (e: any) {
//     console.log("query fails", e);
//   }

//   console.log("received query result", _data);

//   const _schema = JSON.parse(await fetchDataMetadir("metadir.json"));

//   const _groupBy = groupBy ?? defaultGroupBy(_schema, _data, location.search);
//   setGroupBy(_groupBy);

//   setSchema(_schema);
//   setData(_data);

//   /* console.log("getOptions"); */
//   const _options: any = {};
//   const root = Object.keys(_schema).find(
//     (prop: any) =>
//       !Object.prototype.hasOwnProperty.call(_schema[prop], "parent")
//   );
//   for (const prop of Object.keys(_schema)) {
//     /* const propType = _schema[prop]["type"]; */
//     if (/* propType != "date" && */ prop != root) {
//       try {
//         const res = await queryWorker.queryOptions(prop);
//         _options[prop] = res;
//         /* console.log("getOption", prop, res); */
//       } catch (e) {
//         console.log(e);
//       }
//     }
//   }

//   setOptions(_options);

//   await rebuildLine(_data, _schema, _groupBy);

//   // setIsLoading(false);
// };

// // TODO: if build mode is server, navigate to server/
// // but do not just always navigate to server/ to allow for custom server URLs
// function redirectToServer() {
//   const navigate = useNavigate();
//   if (__BUILD_MODE__ === "server") {
//     try {
//       navigate("server/");
//     } catch {
//       return;
//     }
//   }
// }

// // try to login read-only to a public repo from address bar
// async function tryShow(barUrl: any, barToken: any) {
//   // remove url from address bar
//   /* window.history.replaceState(null, null, "/"); */
//   try {
//     // check if path is a url
//     new URL(barUrl);
//   } catch (e) {
//     console.log("not a url", barUrl, e);
//     return;
//   }

//   try {
//     await rimraf("/show");
//   } catch (e) {
//     console.log("nothing to remove");
//   }

//   try {
//     await clone(barUrl, barToken, "show");
//   } catch (e) {
//     await rimraf("/show");
//     console.log("couldn't clone from url", barUrl, e);
//     return;
//   }

//   const navigate = useNavigate();
//   navigate("show/");
// }

// async function redirectToBarURL() {
//   // read url from path
//   const searchParams = new URLSearchParams(location.search);
//   if (searchParams.has("url")) {
//     const barUrl = searchParams.get("url");
//     const barToken = searchParams.get("token") ?? "";

//     // try to login read-only to a public repo from address bar
//     await tryShow(barUrl, barToken);
//   }
// }

// const onDelete = async () => {
//   let dataNew;
//   if (data.find((e: any) => e.UUID === event.UUID)) {
//     await csvs.deleteEvent(event.UUID, {
//       fetch: fetchDataMetadir,
//       write: writeDataMetadir,
//     });
//     dataNew = data.filter((e: any) => e.UUID !== event.UUID);
//   } else {
//     dataNew = data;
//   }

//   setData(dataNew);
//   setEvent(undefined);
//   await rebuildLine(dataNew);
// };

// const onRevert = async () => {
//   setEvent(eventOriginal);
//   if (!data.find((e: any) => e.UUID === event.UUID)) {
//     setEvent(undefined);
//   }
//   setIsEdit(false);
// };
