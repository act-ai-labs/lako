import { supplierRequest } from '../../suppliers/proxy';

export async function POST(request: Request) {
  return supplierRequest('/gcash/transactions', {
    method: 'POST',
    body: JSON.stringify(await request.json()),
  });
}
