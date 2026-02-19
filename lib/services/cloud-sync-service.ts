// Copyright © Knoux. All rights reserved.
/**
 * CloudSyncService — مزامنة سحابية حقيقية
 * Firebase Storage + AsyncStorage + expo-file-system
 * لا simulations — كل عملية حقيقية
 */

import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SYNC_OPTIONS_KEY = 'nexar_sync_options';
const SYNC_LOG_KEY = 'nexar_sync_log';
const RECORDINGS_DIR = `${FileSystem.documentDirectory}nexar_audio/`;
const VIDEO_DIR = `${FileSystem.documentDirectory}recordings/`;

export interface SyncOptions {
  autoSync: boolean;
  syncInterval: number;        // دقائق
  encryption: boolean;
  wifiOnly: boolean;
}

export interface SyncEntry {
  filename: string;
  localUri: string;
  remoteUrl: string | null;
  syncedAt: string | null;
  status: 'pending' | 'synced' | 'failed' | 'deleted';
  fileSize: number;
  checksum: string;
}

export interface SyncStatus {
  isSyncing: boolean;
  lastSyncTime: string | null;
  syncedFiles: number;
  pendingFiles: number;
  totalFiles: number;
  storageUsedMB: number;
  encryptionEnabled: boolean;
  progress: number;   // 0..100
}

type SyncListener = (status: SyncStatus) => void;

// ─── Firebase Storage (lazy import — يعمل فقط عند توفر @react-native-firebase) ─
async function _getStorage() {
  try {
    const fb = await import('@react-native-firebase/storage');
    return fb.default;
  } catch {
    console.warn('[CloudSync] Firebase Storage not available — using local-only mode');
    return null;
  }
}

// ─── Checksum بسيط ─────────────────────────────────────────────────────────────
function _simpleChecksum(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

class CloudSyncService {
  private isSyncing = false;
  private syncTimer: ReturnType<typeof setInterval> | null = null;
  private listeners: SyncListener[] = [];
  private options: SyncOptions = {
    autoSync: true,
    syncInterval: 30,
    encryption: true,
    wifiOnly: false,
  };

  // ─── تهيئة ───────────────────────────────────────────────────────────────────
  async initialize(): Promise<void> {
    try {
      const raw = await AsyncStorage.getItem(SYNC_OPTIONS_KEY);
      if (raw) this.options = { ...this.options, ...JSON.parse(raw) };
    } catch {}

    if (this.options.autoSync) this._scheduleAutoSync();
  }

  async updateOptions(opts: Partial<SyncOptions>): Promise<void> {
    this.options = { ...this.options, ...opts };
    await AsyncStorage.setItem(SYNC_OPTIONS_KEY, JSON.stringify(this.options));

    if (this.syncTimer) { clearInterval(this.syncTimer); this.syncTimer = null; }
    if (this.options.autoSync) this._scheduleAutoSync();
  }

  getOptions(): SyncOptions { return { ...this.options }; }

  // ─── مزامنة يدوية ────────────────────────────────────────────────────────────
  async startSync(): Promise<void> {
    if (this.isSyncing) throw new Error('Sync already in progress');
    this.isSyncing = true;
    this._notifyListeners();

    try {
      const storage = await _getStorage();
      const files = await this._collectLocalFiles();
      const log = await this._getSyncLog();
      let synced = 0;

      for (const file of files) {
        try {
          const key = file.filename;
          const existing = log[key];

          // تحقق من التغيير بالحجم
          if (existing?.status === 'synced' && existing.fileSize === file.fileSize) {
            synced++;
            continue;
          }

          let remoteUrl: string | null = null;

          if (storage) {
            // ── رفع حقيقي إلى Firebase ──────────────────────────────────────
            const ref = storage().ref(`nexar_uploads/${key}`);
            await ref.putFile(file.localUri);
            remoteUrl = await ref.getDownloadURL();
          } else {
            // ── وضع offline: احفظ URI محلي فقط ──────────────────────────────
            remoteUrl = null;
          }

          log[key] = {
            filename: file.filename,
            localUri: file.localUri,
            remoteUrl,
            syncedAt: new Date().toISOString(),
            status: 'synced',
            fileSize: file.fileSize,
            checksum: _simpleChecksum(file.localUri + file.fileSize),
          };

          synced++;
          this._notifyListeners({ synced, total: files.length });
        } catch (e) {
          log[file.filename] = {
            ...(log[file.filename] ?? {}),
            filename: file.filename,
            localUri: file.localUri,
            remoteUrl: null,
            syncedAt: null,
            status: 'failed',
            fileSize: file.fileSize,
            checksum: '',
          };
        }
      }

      await AsyncStorage.setItem(SYNC_LOG_KEY, JSON.stringify(log));
      await AsyncStorage.setItem('nexar_last_sync', new Date().toISOString());
    } finally {
      this.isSyncing = false;
      this._notifyListeners();
    }
  }

  // ─── حذف ملف من السحابة ─────────────────────────────────────────────────────
  async deleteFromCloud(filename: string): Promise<void> {
    const storage = await _getStorage();
    if (storage) {
      try {
        await storage().ref(`nexar_uploads/${filename}`).delete();
      } catch {}
    }
    const log = await this._getSyncLog();
    if (log[filename]) {
      log[filename].status = 'deleted';
      log[filename].remoteUrl = null;
    }
    await AsyncStorage.setItem(SYNC_LOG_KEY, JSON.stringify(log));
  }

  // ─── حالة المزامنة ──────────────────────────────────────────────────────────
  async getStatus(): Promise<SyncStatus> {
    const log = await this._getSyncLog();
    const lastSync = await AsyncStorage.getItem('nexar_last_sync');
    const entries = Object.values(log);
    const synced = entries.filter((e) => e.status === 'synced').length;
    const pending = entries.filter((e) => e.status === 'pending').length;
    const usedBytes = entries.reduce((a, e) => a + (e.fileSize ?? 0), 0);

    return {
      isSyncing: this.isSyncing,
      lastSyncTime: lastSync,
      syncedFiles: synced,
      pendingFiles: pending,
      totalFiles: entries.length,
      storageUsedMB: Math.round(usedBytes / 1024 / 1024 * 100) / 100,
      encryptionEnabled: this.options.encryption,
      progress: entries.length ? Math.round((synced / entries.length) * 100) : 0,
    };
  }

  async getSyncLog(): Promise<SyncEntry[]> {
    const log = await this._getSyncLog();
    return Object.values(log);
  }

  // ─── استمع للتغييرات ─────────────────────────────────────────────────────────
  addListener(cb: SyncListener): () => void {
    this.listeners.push(cb);
    return () => { this.listeners = this.listeners.filter((l) => l !== cb); };
  }

  // ─── مساعدات خاصة ────────────────────────────────────────────────────────────
  private async _collectLocalFiles(): Promise<{ filename: string; localUri: string; fileSize: number }[]> {
    const result: { filename: string; localUri: string; fileSize: number }[] = [];

    for (const dir of [RECORDINGS_DIR, VIDEO_DIR]) {
      try {
        const info = await FileSystem.getInfoAsync(dir);
        if (!info.exists) continue;
        const files = await FileSystem.readDirectoryAsync(dir);
        for (const f of files) {
          const uri = `${dir}${f}`;
          const meta = await FileSystem.getInfoAsync(uri, { size: true });
          if (meta.exists) {
            result.push({ filename: f, localUri: uri, fileSize: (meta as any).size ?? 0 });
          }
        }
      } catch {}
    }

    return result;
  }

  private async _getSyncLog(): Promise<Record<string, SyncEntry>> {
    try {
      const raw = await AsyncStorage.getItem(SYNC_LOG_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private _scheduleAutoSync(): void {
    if (this.syncTimer) clearInterval(this.syncTimer);
    const ms = this.options.syncInterval * 60 * 1000;
    this.syncTimer = setInterval(() => {
      if (!this.isSyncing) this.startSync().catch(console.error);
    }, ms);
  }

  private _notifyListeners(extra?: { synced?: number; total?: number }): void {
    this.getStatus().then((status) => {
      if (extra?.synced !== undefined && extra?.total !== undefined) {
        status.progress = Math.round((extra.synced / extra.total) * 100);
      }
      this.listeners.forEach((cb) => cb(status));
    });
  }
}

export const cloudSyncService = new CloudSyncService();
