import { paymentRequest } from '../proxy';

export async function POST(request: Request) {
  return paymentRequest('/qr', {
    method: 'POST',
    body: JSON.stringify(await request.json()),
  });
}
