import { EditInput , InputDropdown } from "..";
import { addField } from '@/api';

interface IInputArrayProps {
  schema: any;
  entry: any;
  onFieldChange: any;
}

export default function InputArray({
  schema,
  entry,
  onFieldChange,
}: IInputArrayProps) {
  const branch = entry['|'];

  const leaves = Object.keys(schema).filter((leaf) => schema[leaf].trunk === branch)

  const items = entry.items
    ? entry.items.sort((a: any, b: any) => a.UUID.localeCompare(b.UUID))
    : [];

  async function onFieldAddArrayItem(itemBranch: string) {
    console.log('onFieldAddArrayItem', itemBranch);

    const arrayNew = await addField(schema, entry, itemBranch);

    onFieldChange(branch, arrayNew);
  }

  return (
    <div>
      <div>{entry.UUID}</div>

      <InputDropdown {...{ schema, fields: leaves, onFieldAdd: onFieldAddArrayItem }} />

      {items.map((item: any, index: any) => {
        function onFieldChangeArrayItem(itemBranch: string, itemValue: any) {
          const itemsNew = entry.items?.filter((i: any) => i.UUID !== item.UUID) ?? [];

          itemsNew.push(itemValue);

          // sort so that the order of objects remains the same after push
          itemsNew.sort((a: any, b: any) => a.UUID.localeCompare(b.UUID));

          const arrayNew = { '|': entry['|'], UUID: entry.UUID, items: itemsNew };

          onFieldChange(branch, arrayNew);
        }

        function onFieldRemoveArrayItem() {
          const itemsNew = entry.items?.filter((i: any) => i.UUID !== item.UUID) ?? [];

          const arrayNew = { '|': entry['|'], UUID: entry.UUID, items: itemsNew };

          onFieldChange(branch, arrayNew);
        }

        return (
          <div key={index}>
            <EditInput
              {...{
                index: entry.UUID + item.UUID,
                schema,
                entry: item,
                onFieldChange: onFieldChangeArrayItem,
                onFieldRemove: onFieldRemoveArrayItem,
                onFieldAdd: onFieldAddArrayItem,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
