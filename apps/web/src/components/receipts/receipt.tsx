'use client';

interface ReceiptItem {
  name: string;
  qty: number;
  unitPrice: string;
  discountAmount: string;
}

interface ReceiptPayment {
  method: string;
  amount: string;
  referenceNo?: string | null;
}

export interface ReceiptData {
  id: string;
  total: string;
  tendered: string | null;
  change: string | null;
  createdAt: string;
  items: ReceiptItem[];
  payments: ReceiptPayment[];
}

export function Receipt({ receipt }: { receipt: ReceiptData }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 font-mono text-sm shadow-sm">
      <div className="text-center">
        <div className="font-bold">LAKO POS</div>
        <div>{new Date(receipt.createdAt).toLocaleString()}</div>
        <div className="text-xs">Receipt #{receipt.id.slice(0, 8)}</div>
      </div>
      <div className="my-3 border-t border-dashed" />
      {receipt.items.map((item, index) => (
        <div key={`${item.name}-${index}`} className="mb-2">
          <div className="flex justify-between">
            <span>{item.name}</span>
            <span>PHP {(Number(item.unitPrice) * item.qty).toFixed(2)}</span>
          </div>
          <div className="text-xs text-zinc-500">
            {item.qty} x PHP {item.unitPrice}
            {Number(item.discountAmount) > 0 ? ` less PHP ${item.discountAmount}` : ''}
          </div>
        </div>
      ))}
      <div className="my-3 border-t border-dashed" />
      {receipt.payments.map((payment, index) => (
        <div key={`${payment.method}-${index}`} className="flex justify-between text-xs">
          <span>{payment.method.toUpperCase()}</span>
          <span>
            PHP {payment.amount} {payment.referenceNo ? `(${payment.referenceNo})` : ''}
          </span>
        </div>
      ))}
      <div className="mt-3 flex justify-between font-bold">
        <span>Total</span>
        <span>PHP {receipt.total}</span>
      </div>
      <div className="flex justify-between">
        <span>Tendered</span>
        <span>PHP {receipt.tendered ?? '0.00'}</span>
      </div>
      <div className="flex justify-between">
        <span>Change</span>
        <span>PHP {receipt.change ?? '0.00'}</span>
      </div>
    </div>
  );
}

export function printReceiptFallback() {
  window.print();
}
