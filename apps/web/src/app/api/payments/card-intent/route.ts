import { paymentRequest } from '../proxy';

export async function POST(request: Request) {
  return paymentRequest('/card-intent', {
    method: 'POST',
    body: JSON.stringify(await request.json()),
  });
}
