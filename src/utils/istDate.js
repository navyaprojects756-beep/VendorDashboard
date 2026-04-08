const IST_TIME_ZONE = "Asia/Kolkata"

const pad = (value) => String(value).padStart(2, "0")

export function getISTNow() {
  const now = new Date()
  return new Date(now.getTime() + (now.getTimezoneOffset() + 330) * 60000)
}

export function getISTDate(offsetDays = 0) {
  const now = getISTNow()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + offsetDays)
}

export function toISTDateStr(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function getISTDateStr(offsetDays = 0) {
  return toISTDateStr(getISTDate(offsetDays))
}

export function parseDateOnly(value) {
  if (!value) return null
  const str = String(value).slice(0, 10)
  const [year, month, day] = str.split("-").map(Number)
  if (!year || !month || !day) return null
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0))
}

export function formatISTDate(value, options = { day: "2-digit", month: "2-digit", year: "numeric" }) {
  if (!value) return "-"
  const date = typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)
    ? parseDateOnly(value)
    : new Date(value)
  if (!date || Number.isNaN(date.getTime())) return "-"
  return new Intl.DateTimeFormat("en-IN", { timeZone: IST_TIME_ZONE, ...options }).format(date)
}

export function formatISTDateTime(value, options = { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const hasHour = Object.prototype.hasOwnProperty.call(options || {}, "hour")
  const finalOptions = {
    timeZone: IST_TIME_ZONE,
    ...(hasHour ? { hour12: true } : {}),
    ...options,
  }
  return new Intl.DateTimeFormat("en-IN", finalOptions).format(date)
}
