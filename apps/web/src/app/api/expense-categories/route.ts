import { supplierRequest } from '../suppliers/proxy';

export async function GET() {
  return supplierRequest('/expense-categories');
}

export async function POST(request: Request) {
  return supplierRequest('/expense-categories', {
    method: 'POST',
    body: JSON.stringify(await request.json()),
  });
}
