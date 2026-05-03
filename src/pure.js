/**
 * This
 * @name makeURL
 * @function
 * @param {SearchParams} searchParams -
 * @param {String} mind -
 * @returns {String}
 */
export function makeURL(searchParams, mind) {
  const pathname = mind === "root" ? "#" : `#/${mind}`;

  const queryString = searchParams.toString();

  const url = `${pathname}?${queryString}`;

  return url;
}
