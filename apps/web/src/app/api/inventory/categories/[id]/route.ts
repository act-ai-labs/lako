import { inventoryRequest } from '../../proxy';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return inventoryRequest(`/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(await request.json()),
  });
}
