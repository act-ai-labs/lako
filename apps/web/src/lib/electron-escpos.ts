import { ReceiptData } from '@/components/receipts/receipt';
import { cashDrawerPulseCommand, formatEscPosReceipt } from './escpos';

interface ElectronPrinterBridge {
  printEscPos(data: string): Promise<boolean>;
  writeSerial(data: number[]): Promise<boolean>;
}

interface WindowWithElectronPrinter extends Window {
  electronPrinter?: ElectronPrinterBridge;
}

export async function printReceiptViaElectron(receipt: ReceiptData): Promise<boolean> {
  const bridge = (window as WindowWithElectronPrinter).electronPrinter;
  if (!bridge) return false;
  return bridge.printEscPos(formatEscPosReceipt(receipt));
}

export async function openCashDrawerViaElectron(): Promise<boolean> {
  const bridge = (window as WindowWithElectronPrinter).electronPrinter;
  if (!bridge) return false;
  return bridge.writeSerial([...cashDrawerPulseCommand()]);
}
