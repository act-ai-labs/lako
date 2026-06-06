import { NextRequest } from 'next/server';
import { supplierRequest } from '../suppliers/proxy';

export async function GET(request: NextRequest) {
  return supplierRequest(`/purchase-orders${request.nextUrl.search}`);
}

export async function POST(request: Request) {
  return supplierRequest('/purchase-orders', {
    method: 'POST',
    body: JSON.stringify(await request.json()),
  });
}
