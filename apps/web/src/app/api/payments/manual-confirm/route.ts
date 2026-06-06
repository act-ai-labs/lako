import { paymentRequest } from '../proxy';

export async function POST(request: Request) {
  return paymentRequest('/manual-confirm', {
    method: 'POST',
    body: JSON.stringify(await request.json()),
  });
}
