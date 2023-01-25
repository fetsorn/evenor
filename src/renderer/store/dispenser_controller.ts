import { updateRepo, deleteRepo } from "./dispenser_repo_controller";

export async function dispenserDelete(
  repoRoute: string,
  schema: any,
  tag: any,
  entry: any
) {
  // if route is root, create or edit repo
  if (repoRoute === undefined) {
    await deleteRepo(entry);
  }
}

export async function dispenserUpdate(
  repoRoute: string,
  schema: any,
  tag: any,
  entry: any
) {
  // if route is root, create or edit repo
  if (repoRoute === undefined) {
    switch (__BUILD_MODE__) {
      case "electron":
        await window.electron.gitCreate(entry);

      default:
        await updateRepo(entry);
    }
  }
}

