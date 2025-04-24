export function addLeafValue(schema, leaf, record, onRecordChangeFoo) {
  const valueDefault = "";

  const isTwig = schema[leaf].leaves.length === 0;

  const value = isTwig ? valueDefault : { _: leaf, [leaf]: valueDefault };

  const valuesOld = record[leaf];

  const valuesNew =
    valuesOld === undefined ? [value] : [valuesOld, value].flat();

  const recordNew = { ...record, [leaf]: valuesNew };

  onRecordChangeFoo(recordNew);
}

export function onFieldRemove(field, record, onRecordChangeFoo) {
  const { [field]: omit, ...recordWithoutField } = record;

  onRecordChangeFoo(recordWithoutField);
}

export function onFieldChange(field, value, record, onRecordChangeFoo) {
  const recordNew = { ...record, [field]: value };

  onRecordChangeFoo(recordNew);
}

export function onFieldItemChange(
  index,
  item,
  items,
  branch,
  onFieldChangeFoo,
) {
  // replace the new item at index
  const itemsNew = Object.assign([], items, { [index]: item });

  onFieldChangeFoo(branch, itemsNew);
}

export function onFieldItemRemove(
  index,
  items,
  branch,
  onFieldChangeFoo,
  onFieldRemoveFoo,
) {
  // replace the new item at index
  const itemsNew = [...items];

  itemsNew.splice(index, 1);

  if (itemsNew.length === 0) {
    onFieldRemoveFoo(branch);
  } else {
    onFieldChangeFoo(branch, itemsNew);
  }
}
