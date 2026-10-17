// iOS identity trust records use the same Keychain storage as identity keys.
export { getSecureSecret as getBrowserSecret, setSecureSecret as setBrowserSecret, deleteSecureSecret as deleteBrowserSecret } from '../api/secure-storage'
