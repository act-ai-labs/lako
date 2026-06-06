import { NextRequest } from 'next/server';
import { inventoryRequest } from '../proxy';

export async function GET(request: NextRequest) {
  return inventoryRequest(`/products${request.nextUrl.search}`);
}

export async function POST(request: Request) {
  return inventoryRequest('/products', {
    method: 'POST',
    body: JSON.stringify(await request.json()),
  });
}
