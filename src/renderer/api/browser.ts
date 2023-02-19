import git from "isomorphic-git";
import http from "isomorphic-git/http/web";
import LightningFS from "@isomorphic-git/lightning-fs";
import { CSVS } from "@fetsorn/csvs-js";
import { deepClone } from "./curse_controller";
import QueryWorker from "./query.worker";

const fs = new LightningFS('fs');

export class BrowserAPI {
  dir;

  constructor(dir: string) {
    this.dir = dir;
  }

  async readFile(path: string) {
  // check if path exists in the repo
    const path_elements = this.dir.split("/").concat(path.split("/"));
    // console.log("readFile: path_elements, path", path_elements, path);

    let root = "";

    const pfs = fs.promises;

    for (let i = 0; i < path_elements.length; i++) {
      const path_element = path_elements[i];

      root += "/";

      const files = await pfs.readdir(root);

      // console.log("readFile: files", root, files);
      if (files.includes(path_element)) {
        root += path_element;

      // console.log(`readFile: ${root} has ${path_element}`);
      } else {
      // console.log(
      //   `Cannot load file. Ensure there is a file called ${path_element} in ${root}.`
      // );
        return undefined;
      // throw Error(
      //   `Cannot load file. Ensure there is a file called ${path_element} in ${root}.`
      // );
      }
    }

    const file: any = await pfs.readFile("/" + this.dir + "/" + path);

    const restext = new TextDecoder().decode(file);

    return restext;
  }

  async writeFile(
    path: string,
    content: string
  ) {
  // if path doesn't exist, create it
  // split path into array of directory names
    const path_elements = this.dir.split("/").concat(path.split("/"));

    // console.log('writeFileBrowser', dir, path, content);

    // remove file name
    path_elements.pop();

    let root = "";

    const pfs = fs.promises;

    for (let i = 0; i < path_elements.length; i++) {
      const path_element = path_elements[i];
      // console.log('writeFileBrowser-path', path_element)

      root += "/";

      const files = await pfs.readdir(root);

      // console.log(files)

      if (!files.includes(path_element)) {
      // console.log(`writeFileBrowser creating directory ${path_element} in ${root}`)

        await pfs.mkdir(root + "/" + path_element);
      } else {
      // console.log(`writeFileBrowser ${root} has ${path_element}`)
      }

      root += path_element;
    }

    await pfs.writeFile("/" + this.dir + "/" + path, content, "utf8");
  }

  async uploadFile(file: File) {
    const pfs = new LightningFS("fs").promises;

    const root = "/";

    const rootFiles = await pfs.readdir("/");

    const repoDir = root + this.dir;

    if (!rootFiles.includes(this.dir)) {
      await pfs.mkdir(repoDir);
    }

    const repoFiles = await pfs.readdir(repoDir);

    const local = "local";

    const localDir = repoDir + "/" + local;

    if (!repoFiles.includes(local)) {
      await pfs.mkdir(localDir);
    }

    const localFiles = await pfs.readdir(localDir);

    const filename = file.name;

    const filepath = localDir + "/" + filename;

    if (!localFiles.includes(filename)) {
      const buf: any = await file.arrayBuffer();

      await pfs.writeFile(filepath, buf);
    }

  }

  async select(searchParams: URLSearchParams) {
    const queryWorker = new QueryWorker(this.readFile);

    const overview = await queryWorker.select(searchParams);

    return overview;
  }

  async queryOptions(branch: string) {
    const queryWorker = new QueryWorker(this.readFile);

    try {
      const options = await queryWorker.queryOptions(branch);

      return options;
    } catch (e) {
      console.log(e);

      return [];
    }
  }

  async updateEntry(entry: any, overview: any) {
    const entryNew = await new CSVS({
      readFile: (path: string) => this.readFile(path),
      writeFile: (path: string, content: string) =>
        this.writeFile(path, content),
    }).update(deepClone(entry));

    if (overview.find((e: any) => e.UUID === entryNew.UUID)) {
      return overview.map((e: any) => {
        if (e.UUID === entryNew.UUID) {
          return entryNew;
        } else {
          return e;
        }
      });
    } else {
      return overview.concat([entryNew]);
    }
  }

  async deleteEntry(entry: any, overview: any) {
    await new CSVS({
      readFile: (path: string) => this.readFile(path),
      writeFile: (path: string, content: string) =>
        this.writeFile(path, content),
    }).delete(deepClone(entry));

    return overview.filter((e: any) => e.UUID !== entry.UUID);
  }

  async clone(url: string, token: string) {
    const options: any = {
      fs,
      http,
      dir: this.dir,
      url,
      singleBranch: true,
      depth: 1,
    };

    if (token) {
      options.onAuth = () => ({
        username: token,
      })
    }

    await git.clone(options);
  }

  async commit() {
    const dir = this.dir;

    const message = [];

    const statusMatrix: any = await git.statusMatrix({
      fs,
      dir,
    });

    for (let [
      filePath,
      HEADStatus,
      workingDirStatus,
      stageStatus,
    ] of statusMatrix) {
      if (HEADStatus === workingDirStatus && workingDirStatus === stageStatus) {
        await git.resetIndex({
          fs,
          dir,
          filepath: filePath,
        });

        [filePath, HEADStatus, workingDirStatus, stageStatus] =
        await git.statusMatrix({
          fs,
          dir,
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
            fs,
            dir,
            filepath: filePath,
          });
        } else {
          await git.add({
            fs,
            dir,
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
        fs: fs,
        dir,
        author: {
          name: "name",
          email: "name@mail.com",
        },
        message: message.toString(),
      });
    }
  }

  async push(token: string) {
    await git.push({
      fs,
      http,
      force: true,
      dir: this.dir,
      remote: "upstream",
      onAuth: () => ({
        username: token,
      }),
    });
  }

  async pull(token: string) {
    // fastForward instead of pull
    // https://github.com/isomorphic-git/isomorphic-git/issues/1073
    await git.fastForward({
      fs,
      http,
      dir: this.dir,
      remote: "upstream",
      onAuth: () => ({
        username: token,
      }),
    });
  }

  async addRemote(url: string) {
    await git.addRemote({
      fs,
      dir: this.dir,
      remote: 'upstream',
      url,
      force: true,
    })
  }

  async ensure(schema: string) {
    const pfs = fs.promises;

    if (!(await pfs.readdir("/")).includes("store")) {
      await pfs.mkdir("/store");
    }

    const repoDir = "/store/" + this.dir;

    if (!(await pfs.readdir("/store")).includes(this.dir)) {
      await pfs.mkdir(repoDir);

      await git.init({ fs: fs, dir: repoDir });
    }

    await pfs.writeFile(repoDir + "/metadir.json", schema, "utf8");

    await this.commit();
  }

  async symlink(reponame: string) {
    const pfs = fs.promises;

    if (!(await pfs.readdir("/")).includes("repos")) {
      await pfs.mkdir("/repos");
    }

    await pfs.symlink(`/store/${this.dir}`, `/repos/${reponame}`);
  }

  async rimraf(path: string) {
    const pfs = fs.promises;

    let files;

    try {
      files = await pfs.readdir(path);
    } catch {
      throw Error(`can't read ${path} to rimraf it`);
    }

    for (const file of files) {
      const filepath = path + "/" + file;

      const { type } = await pfs.stat(filepath);

      if (type === "file") {
        await pfs.unlink(filepath);
      } else if (type === "dir") {
        await this.rimraf(filepath);
      }
    }

    await pfs.rmdir(path);
  }

  async ls(path: string) {
    const pfs = fs.promises;

    let files;

    try {
      files = await pfs.readdir(path);
    } catch {
      throw Error(`can't read ${path} to list it`);
    }

    console.log("list ", path, ":", files);

    for (const file of files) {
      const filepath = path + "/" + file;

      const { type } = await pfs.stat(filepath);

      if (type === "dir") {
        await this.ls(filepath);
      }
    }
  }
}
