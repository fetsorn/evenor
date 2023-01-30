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

interface IDispenserProps {
  repoRoute: string;
  schema: any;
  field: string;
  entry: any;
}

export function Dispenser({repoRoute, schema, field, entry}: IDispenserProps) {
  switch (field) {
  case "export_root":
    return (<a onClick={() => dispenserUpdate(repoRoute, schema, "export_root", entry)}>🔄</a>)

  default:
    return (
      <></>
    )
  }
}
