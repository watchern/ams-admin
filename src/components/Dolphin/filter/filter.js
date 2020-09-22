import dayjs from 'dayjs'

/**
 * Formatting time
 */
const formatDate = (value, fmt) => {
  fmt = fmt || 'YYYY-MM-DD HH:mm:ss'
  return dayjs(value).format(fmt)
}

export {
  formatDate
}
