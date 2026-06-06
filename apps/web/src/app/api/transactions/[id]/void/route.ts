import { transactionRequest } from '../../proxy';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return transactionRequest(`/${id}/void`, {
    method: 'POST',
    body: JSON.stringify(await request.json()),
  });
}
