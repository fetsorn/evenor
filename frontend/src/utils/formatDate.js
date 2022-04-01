const formatDate = (date) => {
  if (!date) { return '' }
  let match = date.match(/\d+/g)
  if (!match) { return '' }
  return Array.from(match).reverse().join('.')
}

export default formatDate
