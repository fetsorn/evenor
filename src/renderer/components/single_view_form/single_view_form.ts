function description(schema, label) {
  const prop = Object.keys(schema).find(
    (prop: any) => schema[prop]["label"] === label
  );

  const lang = i18n.resolvedLanguage;

  return schema?.[prop]?.description?.[lang] ?? label;
}

function value(event, label) {
  event[label];
}
