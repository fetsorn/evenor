import git from "isomorphic-git";
import LightningFS from "@isomorphic-git/lightning-fs";
import { gitcommit, rimraf } from "./git_controller";
import { manifestRoot } from "../../lib/git_template";

async function ensureRepo(repo: string, schema: string) {
  const fs = new LightningFS("fs");

  const pfs = fs.promises;

  if (!(await pfs.readdir("/")).includes("store")) {
    await pfs.mkdir("/store");
  }

  const repoDir = "/store/" + repo;

  if (!(await pfs.readdir("/store")).includes(repo)) {
    await pfs.mkdir(repoDir);

    await git.init({ fs: fs, dir: repoDir });
  }

  await pfs.writeFile(repoDir + "/metadir.json", schema, "utf8");

  await gitcommit(repoDir);
}

async function linkRepo(repo: string, reponame: string) {
  const pfs = new LightningFS("fs").promises;

  if (!(await pfs.readdir("/")).includes("repos")) {
    await pfs.mkdir("/repos");
  }

  await pfs.symlink(`/store/${repo}`, `/repos/${reponame}`);
}

export async function updateRepo(entry: any) {
  await ensureRepo(entry.UUID, entry.SCHEMA);

  await linkRepo(entry.UUID, entry.REPO_NAME);
}

export async function ensureRoot() {
  // try {
  //   await rimraf("/store/root");
  // } catch (e) {
  //   console.log("rimraf failed");
  // }

  await ensureRepo("root", manifestRoot);
}

export async function deleteRepo(entry: any) {
  await rimraf(`/store/${entry.UUID}`);

  // TODO: unlink symlink
}
