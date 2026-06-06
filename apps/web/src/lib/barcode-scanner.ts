export interface ScannerBuffer {
  value: string;
  lastInputAt: number;
}

export function appendScannerKey(buffer: ScannerBuffer, key: string, now = Date.now()): ScannerBuffer {
  const expired = now - buffer.lastInputAt > 80;
  return {
    value: `${expired ? '' : buffer.value}${key}`,
    lastInputAt: now,
  };
}

export function isScannerSubmitKey(key: string) {
  return key === 'Enter' || key === 'Tab';
}
