const formatDate = (date) => (
  date
    ? Array.from(date.match(/\d+/g))
      .reverse()
      .join('.')
    : ''
)

export default formatDate
