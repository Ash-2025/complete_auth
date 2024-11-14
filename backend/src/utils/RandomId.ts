import crypto from 'crypto'

export const generateRandomId = () => {
    return crypto.randomBytes(12).toString('base64').substring(0,16)
}