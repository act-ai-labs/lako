import { ReceiptData } from '@/components/receipts/receipt';

interface SerialPortLike {
  open(options: { baudRate: number }): Promise<void>;
  writable: WritableStream<Uint8Array> | null;
  close(): Promise<void>;
}

interface NavigatorWithSerial extends Navigator {
  serial?: {
    requestPort(): Promise<SerialPortLike>;
  };
}

export function formatEscPosReceipt(receipt: ReceiptData): string {
  const lines = [
    '\x1b@',
    'LAKO POS\n',
    `${new Date(receipt.createdAt).toLocaleString()}\n`,
    `Receipt #${receipt.id.slice(0, 8)}\n`,
    '------------------------------\n',
    ...receipt.items.map(
      (item) => `${item.qty} x ${item.name}\nPHP ${(Number(item.unitPrice) * item.qty).toFixed(2)}\n`,
    ),
    '------------------------------\n',
    `TOTAL PHP ${receipt.total}\n`,
    `TENDERED PHP ${receipt.tendered ?? '0.00'}\n`,
    `CHANGE PHP ${receipt.change ?? '0.00'}\n`,
    '\n\n\n\x1dV\x00',
  ];

  return lines.join('');
}

export function cashDrawerPulseCommand(): Uint8Array {
  return new Uint8Array([0x1b, 0x70, 0x00, 0x19, 0xfa]);
}

export async function printEscPosReceipt(receipt: ReceiptData): Promise<boolean> {
  const serial = (navigator as NavigatorWithSerial).serial;
  if (!serial) {
    return false;
  }

  const port = await serial.requestPort();
  await port.open({ baudRate: 9600 });

  const writer = port.writable?.getWriter();
  if (!writer) {
    await port.close();
    return false;
  }

  try {
    await writer.write(new TextEncoder().encode(formatEscPosReceipt(receipt)));
    return true;
  } finally {
    writer.releaseLock();
    await port.close();
  }
}

export async function openCashDrawerWebSerial(): Promise<boolean> {
  const serial = (navigator as NavigatorWithSerial).serial;
  if (!serial) {
    return false;
  }

  const port = await serial.requestPort();
  await port.open({ baudRate: 9600 });
  const writer = port.writable?.getWriter();
  if (!writer) {
    await port.close();
    return false;
  }

  try {
    await writer.write(cashDrawerPulseCommand());
    return true;
  } finally {
    writer.releaseLock();
    await port.close();
  }
}
