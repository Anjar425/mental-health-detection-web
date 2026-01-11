interface JWTPayload {
  exp?: number
  role?: string
  [key: string]: any
}

function base64UrlDecode(payload: string) {
  // replace URL-safe chars
  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')

  try {
    if (typeof window !== 'undefined' && typeof atob === 'function') {
      // Browser
      return decodeURIComponent(
        Array.prototype.map
          .call(atob(base64), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
    }

    // Node.js
    // Buffer is available in Node
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const buf = Buffer.from(base64, 'base64')
    return buf.toString('utf8')
  } catch (err) {
    return null
  }
}

export function parseToken(token: string): JWTPayload | null {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length < 2) return null

  const payload = parts[1]
  const decoded = base64UrlDecode(payload)
  if (!decoded) return null

  try {
    return JSON.parse(decoded) as JWTPayload
  } catch (err) {
    return null
  }
}

export function isTokenExpired(token: string) {
  const parsed = parseToken(token)
  if (!parsed || !parsed.exp) return true
  const now = Math.floor(Date.now() / 1000)
  return parsed.exp < now
}

export function getRoleFromToken(token: string) {
  const parsed = parseToken(token)
  return parsed?.role || null
}

export function clearAuth() {
  try {
    if (typeof window !== 'undefined') sessionStorage.removeItem('authToken')
  } catch (err) {
    // ignore
  }
}

export default { parseToken, isTokenExpired, getRoleFromToken, clearAuth }
