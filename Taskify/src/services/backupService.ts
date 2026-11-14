import * as Crypto from 'expo-crypto';
import { AESEncryptionKey, AESSealedData, aesEncryptAsync, aesDecryptAsync } from 'expo-crypto';
import { File, Paths } from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { CategoryGroup, ExpenseTransaction, MerchantRule } from '../types/expense';
import { NoteMeta } from '../hooks/useSecureNotes';

export interface NoteBackupItem extends NoteMeta {
  body: string | null;
}

export interface ExpenseBackupData {
  transactions: ExpenseTransaction[];
  categories: CategoryGroup[];
  merchantRules: MerchantRule[];
}

export interface BackupPayload {
  app: 'Taskify';
  version: number;
  createdAt: number;
  includes: {
    notes: boolean;
    expenses: boolean;
  };
  data: {
    notes?: NoteBackupItem[];
    expenses?: ExpenseBackupData;
  };
}

// UTF-8 Helpers
function stringToUint8Array(str: string): Uint8Array {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(str);
  }
  const utf8 = unescape(encodeURIComponent(str));
  const result = new Uint8Array(utf8.length);
  for (let i = 0; i < utf8.length; i++) {
    result[i] = utf8.charCodeAt(i);
  }
  return result;
}

function uint8ArrayToString(bytes: Uint8Array): string {
  if (typeof TextDecoder !== 'undefined') {
    return new TextDecoder().decode(bytes);
  }
  let str = '';
  for (let i = 0; i < bytes.length; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  return decodeURIComponent(escape(str));
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Derives a 256-bit AES encryption key from the user's password and a random salt
 * using iterative SHA-256 key stretching.
 */
export async function deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<AESEncryptionKey> {
  const saltHex = bytesToHex(salt);
  let hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `taskify:salt:${saltHex}:pass:${password}`,
    { encoding: Crypto.CryptoEncoding.HEX }
  );

  // Key stretching rounds
  for (let i = 0; i < 200; i++) {
    hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `${hash}:${saltHex}:${password}:${i}`,
      { encoding: Crypto.CryptoEncoding.HEX }
    );
  }

  return await AESEncryptionKey.import(hash, 'hex');
}

/**
 * Encrypts backup data with password and writes to an encrypted file.
 * File format:
 * [0..3]: Magic 'TASK'
 * [4]: Version (1)
 * [5]: Salt length (16)
 * [6..21]: Salt (16 bytes)
 * [22..]: Combined AES-GCM sealed data (IV + Ciphertext + Tag)
 */
export async function createEncryptedBackupFile(
  payload: BackupPayload,
  password: string
): Promise<{ uri: string; fileName: string }> {
  if (!password || password.length < 4) {
    throw new Error('Password must be at least 4 characters long.');
  }

  // 1. Generate 16-byte random salt
  const salt = await Crypto.getRandomBytesAsync(16);

  // 2. Derive 256-bit AES key
  const encryptionKey = await deriveKeyFromPassword(password, salt);

  // 3. Store key hex in SecureStore (compatible with local caching snippet)
  try {
    const keyHex = await encryptionKey.encoded('hex');
    await SecureStore.setItemAsync('aes-encryption-key', keyHex);
  } catch (err) {
    console.warn('Could not cache encryption key in SecureStore:', err);
  }

  // 4. Serialize payload
  const jsonString = JSON.stringify(payload);
  const plaintextData = stringToUint8Array(jsonString);

  // 5. Encrypt data with AES-GCM
  const sealedData = await aesEncryptAsync(plaintextData, encryptionKey);
  const encryptedBytes = await sealedData.combined();

  // 6. Assemble envelope
  const magic = [0x54, 0x41, 0x53, 0x4B]; // 'TASK'
  const envelope = new Uint8Array(magic.length + 1 + 1 + salt.length + encryptedBytes.length);
  envelope.set(magic, 0);
  envelope[4] = 1; // format version
  envelope[5] = salt.length; // 16
  envelope.set(salt, 6);
  envelope.set(encryptedBytes, 6 + salt.length);

  // 7. Write to cache directory using expo-file-system File API
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const fileName = `taskify-backup-${timestamp}.taskbackup`;
  const file = new File(Paths.cache, fileName);
  file.create({ overwrite: true });
  file.write(envelope);

  return { uri: file.uri, fileName };
}

/**
 * Exports encrypted backup and opens system Share dialog.
 */
export async function exportAndShareBackup(
  payload: BackupPayload,
  password: string
): Promise<string> {
  const { uri, fileName } = await createEncryptedBackupFile(payload, password);

  const available = await Sharing.isAvailableAsync();
  if (available) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/octet-stream',
      dialogTitle: 'Export Encrypted Backup',
      UTI: 'public.data',
    });
  }

  return fileName;
}

/**
 * Prompts user to pick a backup file (.taskbackup or .dat).
 */
export async function pickBackupFile(): Promise<{ uri: string; name: string; size?: number } | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: '*/*',
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return null;
  }

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    name: asset.name,
    size: asset.size,
  };
}

/**
 * Reads and decrypts a backup file given a password.
 */
export async function readAndDecryptBackupFile(
  fileUri: string,
  password: string
): Promise<BackupPayload> {
  if (!password) {
    throw new Error('Please enter the decryption password.');
  }

  const file = new File(fileUri);
  if (!file.exists) {
    throw new Error('Selected backup file does not exist or cannot be accessed.');
  }

  const fileBytes = await file.bytes();
  if (!fileBytes || fileBytes.length < 24) {
    throw new Error('Invalid or corrupted backup file (file is too small).');
  }

  // Check magic bytes: 'TASK'
  const isTaskFormat =
    fileBytes[0] === 0x54 &&
    fileBytes[1] === 0x41 &&
    fileBytes[2] === 0x53 &&
    fileBytes[3] === 0x4B;

  if (!isTaskFormat) {
    // Fallback: check if it's a raw sealed data encrypted with local SecureStore key
    const cachedKeyHex = await SecureStore.getItemAsync('aes-encryption-key');
    if (cachedKeyHex) {
      try {
        const cachedKey = await AESEncryptionKey.import(cachedKeyHex, 'hex');
        const sealed = AESSealedData.fromCombined(fileBytes);
        const decrypted = await aesDecryptAsync(sealed, cachedKey);
        const rawBytes = decrypted instanceof Uint8Array ? decrypted : stringToUint8Array(decrypted);
        return JSON.parse(uint8ArrayToString(rawBytes));
      } catch {
        // Fallback failed
      }
    }
    throw new Error('Invalid backup file format. This is not a Taskify encrypted backup.');
  }

  const version = fileBytes[4];
  const saltLen = fileBytes[5];
  if (fileBytes.length <= 6 + saltLen) {
    throw new Error('Corrupted backup file: missing encrypted data payload.');
  }

  const salt = fileBytes.subarray(6, 6 + saltLen);
  const encryptedBytes = fileBytes.subarray(6 + saltLen);

  // Derive encryption key with password
  const encryptionKey = await deriveKeyFromPassword(password, salt);

  // Decrypt with AES-GCM
  let decryptedBytes: Uint8Array;
  try {
    const sealedData = AESSealedData.fromCombined(encryptedBytes);
    const decrypted = await aesDecryptAsync(sealedData, encryptionKey);
    decryptedBytes = decrypted instanceof Uint8Array ? decrypted : stringToUint8Array(decrypted);
  } catch (error) {
    throw new Error('Incorrect password or corrupted file. Decryption failed.');
  }

  try {
    const jsonString = uint8ArrayToString(decryptedBytes);
    const payload: BackupPayload = JSON.parse(jsonString);
    if (!payload || payload.app !== 'Taskify' || !payload.data) {
      throw new Error('Invalid backup contents.');
    }
    return payload;
  } catch (err: any) {
    if (err.message && err.message.includes('Invalid backup')) {
      throw err;
    }
    throw new Error('Failed to parse decrypted data. The backup file might be corrupted.');
  }
}

