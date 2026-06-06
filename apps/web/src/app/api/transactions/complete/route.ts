import { transactionRequest } from '../proxy';

export async function POST(request: Request) {
  return transactionRequest('/complete', {
    method: 'POST',
    body: JSON.stringify(await request.json()),
  });
}
