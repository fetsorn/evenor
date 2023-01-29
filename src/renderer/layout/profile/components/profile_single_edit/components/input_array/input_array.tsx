import { EditInput } from "..";
import { useTranslation } from "react-i18next";

interface IInputArrayProps {
  label: any;
  description: any;
  value: any;
  schema: any;
  onFieldChange: any;
  onFieldRemove: any;
}

export default function InputArray({
  label,
  description,
  value,
  schema,
  onFieldChange,
  onFieldRemove,
}: IInputArrayProps) {
  const { t } = useTranslation();

  return (
    <div>
      <label>
        array {description}
        <button
          title={t("line.button.remove", { field: label })}
          onClick={() => onFieldRemove(label)}
        >
          X
        </button>
      </label>

      <div>{value.UUID}</div>

      {value.items.map((item: any, index: any) => {
        function onFieldChangeArrayItem(itemLabel: string, itemValue: any) {
          const itemsNew = value.items.filter((i: any) => i.UUID !== item.UUID);

          itemsNew.push(itemValue);

          // sort so that the order of objects remains the same after push
          itemsNew.sort((a: any, b: any) => a.UUID.localeCompare(b.UUID));

          const arrayNew = { UUID: value.UUID, items: itemsNew };

          onFieldChange(label, arrayNew);
        }

        function onFieldRemoveArrayItem() {
          const itemsNew = value.items.filter((i: any) => i.UUID !== item.UUID);

          const arrayNew = { UUID: value.UUID, items: itemsNew };

          onFieldChange(label, arrayNew);
        }

        return (
          <div key={index}>
            <EditInput
              {...{
                schema,
                onFieldChange: onFieldChangeArrayItem,
                onFieldRemove: onFieldRemoveArrayItem,
              }}
              label={item.ITEM_NAME}
              value={item}
            />
          </div>
        );
      })}
    </div>
  );
}
