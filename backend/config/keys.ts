import path from 'node:path'
import fs from 'node:fs'
import crypto from 'node:crypto'

const KEY_PATH = path.join(process.cwd(), 'key.pem')
if (!fs.existsSync(KEY_PATH)) {
  const secret = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  }).privateKey
  fs.writeFileSync(KEY_PATH, secret, 'utf-8')
}
const secret = fs.readFileSync(KEY_PATH, 'utf-8') || ''
const PASSWD_PASS = path.join(process.cwd(), 'mongod')
const password = (fs.readFileSync(PASSWD_PASS, 'utf-8') || '').slice(0, -1)

export const keys: Keys.Config = { password, secret }