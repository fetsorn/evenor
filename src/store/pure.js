/**
 * This function is true when branch has no leaves
 * @name isTwig
 * @function
 * @param {object} schema - Dataset schema.
 * @param {object} record - An expanded record.
 * @returns {object} - A condensed record.
 */
export function isTwig(schema, branch) {
  return schema[branch].leaves.length === 0;
}
