import { NextRequest } from 'next/server';
import { supplierRequest } from '../suppliers/proxy';

export async function GET(request: NextRequest) {
  return supplierRequest(`/expenses${request.nextUrl.search}`);
}

export async function POST(request: Request) {
  return supplierRequest('/expenses', {
    method: 'POST',
    body: JSON.stringify(await request.json()),
  });
}
