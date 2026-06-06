import { supplierRequest } from '../../suppliers/proxy';

export async function GET() {
  return supplierRequest('/gcash/denominations');
}

export async function POST(request: Request) {
  return supplierRequest('/gcash/denominations', {
    method: 'POST',
    body: JSON.stringify(await request.json()),
  });
}
