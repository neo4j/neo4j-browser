import { AES, enc } from 'crypto-js'

const STORAGE_KEY = 'neo4j_secure_'
const SECRET_KEY = process.env.REACT_APP_STORAGE_SECRET || 'default-secret-key'

export const secureStorage = {
  setItem(key: string, value: any) {
    const encrypted = AES.encrypt(JSON.stringify(value), SECRET_KEY).toString()
    localStorage.setItem(`${STORAGE_KEY}${key}`, encrypted)
  },

  getItem(key: string) {
    const encrypted = localStorage.getItem(`${STORAGE_KEY}${key}`)
    if (!encrypted) return null
    
    try {
      const decrypted = AES.decrypt(encrypted, SECRET_KEY).toString(enc.Utf8)
      return JSON.parse(decrypted)
    } catch {
      return null
    }
  },

  removeItem(key: string) {
    localStorage.removeItem(`${STORAGE_KEY}${key}`)
  }
} 