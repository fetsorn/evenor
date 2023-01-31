import { updateRepo, deleteRepo } from "./dispenser_repo";
import { useStore } from "@/store";

interface IDispenserProps {
  repoRoute: string;
  schema: any;
  field: string;
  entry: any;
}

export function Dispenser({repoRoute, schema, field, entry}: IDispenserProps) {

  const setRepoRoute = useStore((state) => state.setRepoRoute)

  switch (field) {
  case "export_root":
    return (
      <div>
        <a onClick={() => setRepoRoute(`repos/${entry.REPO_NAME}`)}>{entry.REPO_NAME}</a>
        <br/>
        <a onClick={() => updateRepo(entry)}>🔄</a>
      </div>
    )

  default:
    return (
      <></>
    )
  }
}
