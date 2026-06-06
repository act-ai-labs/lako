export enum SyncOperation {
  INSERT = 'insert',
  UPDATE = 'update',
  DELETE = 'delete',
}

export enum SyncStatus {
  PENDING = 'pending',
  SYNCED = 'synced',
  FAILED = 'failed',
}
