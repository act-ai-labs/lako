import { supplierRequest } from '../../suppliers/proxy';

export async function GET() {
  return supplierRequest('/gcash/balance');
}
