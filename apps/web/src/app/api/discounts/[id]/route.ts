import { discountRequest } from '../proxy';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return discountRequest(`/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(await request.json()),
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  return discountRequest(`/${id}`, { method: 'DELETE' });
}
