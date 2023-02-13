import { EditInput } from "..";
import { useTranslation } from "react-i18next";

interface IInputArrayProps {
  schema: any;
  entry: any;
  description?: string;
  onFieldChange: any;
  onFieldRemove: any;
}

export default function InputArray({
  schema,
  entry,
  description,
  onFieldChange,
  onFieldRemove,
}: IInputArrayProps) {
  const { t } = useTranslation();

  const branch = entry['|'];

  return (
    <div>
      <div>
        array {description}
        <button
          title={t("line.button.remove", { field: branch })}
          onClick={() => onFieldRemove(branch)}
        >
          X
        </button>
      </div>

      <div>{entry.UUID}</div>

      {entry.items.map((item: any, index: any) => {
        function onFieldChangeArrayItem(itemBranch: string, itemValue: any) {
          console.log("onFieldChangeArrayItem", itemBranch, itemValue)
          const itemsNew = entry.items.filter((i: any) => i.UUID !== item.UUID);

          itemsNew.push(itemValue);

          // sort so that the order of objects remains the same after push
          itemsNew.sort((a: any, b: any) => a.UUID.localeCompare(b.UUID));

          const arrayNew = { '|': entry['|'], UUID: entry.UUID, items: itemsNew };

          onFieldChange(branch, arrayNew);
        }

        function onFieldRemoveArrayItem() {
          console.log("onFieldRemoveArrayItem")
          const itemsNew = entry.items.filter((i: any) => i.UUID !== item.UUID);

          const arrayNew = { '|': entry['|'], UUID: entry.UUID, items: itemsNew };

          onFieldChange(branch, arrayNew);
        }

        return (
          <div key={index}>
            <EditInput
              {...{
                schema,
                entry: item,
                onFieldChange: onFieldChangeArrayItem,
                onFieldRemove: onFieldRemoveArrayItem,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
