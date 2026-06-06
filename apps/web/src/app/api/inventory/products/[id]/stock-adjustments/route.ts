import { inventoryRequest } from '../../../proxy';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return inventoryRequest(`/products/${id}/stock-adjustments`, {
    method: 'POST',
    body: JSON.stringify(await request.json()),
  });
}
