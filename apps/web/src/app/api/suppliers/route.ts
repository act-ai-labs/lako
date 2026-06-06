import { NextRequest } from 'next/server';
import { supplierRequest } from './proxy';

export async function GET(request: NextRequest) {
  return supplierRequest(`/suppliers${request.nextUrl.search}`);
}

export async function POST(request: Request) {
  return supplierRequest('/suppliers', {
    method: 'POST',
    body: JSON.stringify(await request.json()),
  });
}
