import { inventoryRequest } from '../../proxy';

export async function POST(request: Request) {
  return inventoryRequest('/products/import-csv', {
    method: 'POST',
    body: JSON.stringify(await request.json()),
  });
}
