import { useStore } from "@/store";
import { API } from "../api";

export function Local({ baseEntry }) {
  const setRepoRoute = useStore((state) => state.setRepoRoute)

  const { reponame, UUID, schema } = baseEntry;

  const dir = `repos/${reponame}`;

  const api = new API(dir);

  function onLink() {
    setRepoRoute(dir);
  }

  async function onUpdate() {
    const schemaString = schemaToString(schema);

    await api.ensure(schemaString);

    await api.symlink(reponame);
  }

  async function deleteRepo() {
    await api.rimraf(`/store/${UUID}`);

    // TODO: unlink symlink
    await api.rimraf(dir);
  }

  return (
    <div>
      <a onClick={onLink}>{baseEntry.reponame}</a>
      <br/>
      <a onClick={onUpdate}>🔄</a>
    </div>
  )
}

function schemaToString(schema) {
  const schemaObject = {};

  for (const item of schema.items) {
    const branch = item.schema_branch_name;

    schemaObject[branch] = {};

    if (item.schema_branch_trunk) {
      schemaObject[branch].trunk = item.schema_branch_trunk;
    }

    if (item.schema_branch_type) {
      schemaObject[branch].type = item.schema_branch_type;
    }

    if (item.schema_branch_task) {
      schemaObject[branch].task = item.schema_branch_task;
    }

    if (item.schema_branch_dir) {
      schemaObject[branch].dir = item.schema_branch_dir;
    }

    if (item.schema_branch_description) {
      schemaObject[branch].description = {};

      if (item.schema_branch_description.schema_branch_description_en) {
        schemaObject[branch].description.en =
          item.schema_branch_description.schema_branch_description_en;
      }

      if (item.schema_branch_description.schema_branch_description_ru) {
        schemaObject[branch].description.ru =
          item.schema_branch_description.schema_branch_description_ru;
      }
    }
  }

  const schemaString = JSON.stringify(schemaObject, null, 2);

  return schemaString
}
