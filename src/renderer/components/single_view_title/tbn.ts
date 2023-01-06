export function formatDate(date: string) {
  if (!date) {
    return "";
  }
  // TODO: test for date better
  // if first character is digit, treat as date
  const match = date.match(/\d+/g);
  if (!match) {
    return "";
  }
  return Array.from(match).reverse().join(".");
}

export function isDate(title: string) {
  return true;
}
