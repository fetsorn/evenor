import { updateRepo, deleteRepo } from "./dispenser_repo";

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
    await updateRepo(entry);
  }
}

