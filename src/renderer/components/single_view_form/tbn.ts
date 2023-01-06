import { useTranslation } from "react-i18next";

export function description(schema: any, label: any) {
  const { i18n } = useTranslation();

  const prop = Object.keys(schema).find(
    (prop: any) => schema[prop]["label"] === label
  );

  const lang = i18n.resolvedLanguage;

  const description = schema?.[prop]?.description?.[lang] ?? label;

  return description;
}

export function value(event: any, label: any) {
  event[label];
}
