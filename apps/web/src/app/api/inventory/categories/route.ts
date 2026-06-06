import { inventoryRequest } from '../proxy';

export async function GET() {
  return inventoryRequest('/categories');
}

export async function POST(request: Request) {
  return inventoryRequest('/categories', {
    method: 'POST',
    body: JSON.stringify(await request.json()),
  });
}
