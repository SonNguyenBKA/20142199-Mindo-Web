// The BE stores the raw User-Agent as the session's device name for web logins.
// Turn it into something readable ("Chrome trên macOS"); app-provided names pass through.

const BROWSERS: [RegExp, string][] = [
  [/Edg\//, "Edge"],
  [/OPR\/|Opera/, "Opera"],
  [/Firefox\//, "Firefox"],
  [/(Chrome|CriOS)\//, "Chrome"],
  [/Safari\//, "Safari"],
]

const SYSTEMS: [RegExp, string][] = [
  [/iPhone/, "iPhone"],
  [/iPad/, "iPad"],
  [/Android/, "Android"],
  [/Mac OS X|Macintosh/, "macOS"],
  [/Windows/, "Windows"],
  [/CrOS/, "ChromeOS"],
  [/Linux/, "Linux"],
]

const match = (ua: string, table: [RegExp, string][]) =>
  table.find(([re]) => re.test(ua))?.[1]

export function deviceLabel(name: string) {
  if (!/Mozilla\/|AppleWebKit|Gecko\//.test(name)) {
    // Non-browser clients (curl, the Mindo app) are shown as sent, trimmed.
    return name.length > 40 ? `${name.slice(0, 40)}…` : name
  }
  const browser = match(name, BROWSERS)
  const system = match(name, SYSTEMS)
  if (browser && system) return `${browser} trên ${system}`
  return browser ?? system ?? "Trình duyệt web"
}
