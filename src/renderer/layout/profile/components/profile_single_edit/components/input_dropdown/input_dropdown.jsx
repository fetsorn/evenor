import React from 'react';
import { useTranslation } from 'react-i18next';

export function InputDropdown({
  schema,
  fields,
  onFieldAdd,
}) {
  const { i18n, t } = useTranslation();

  const lang = i18n.resolvedLanguage;

  const menuItems = fields.map((branch) => {
    const description = schema?.[branch]?.description?.[lang] ?? branch;

    return {
      branch,
      description,
    };
  });

  console.log(menuItems);
  return (
    <>
      {menuItems.length > 0 && (
        <select
          value="default"
          onChange={({ target: { value } }) => onFieldAdd(value)}
        >
          <option hidden disabled value="default">
            {t('line.dropdown.input')}
          </option>
          {menuItems.map((field, idx) => { 
console.log("branch in field", field.branch);			
return (
            <option key={idx} value={field.branch}>
              {field.description}
            </option>
          )})}
        </select>
      )}
    </>
  );
}
