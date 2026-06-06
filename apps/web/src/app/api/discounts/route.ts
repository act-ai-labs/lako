import { discountRequest } from './proxy';

export async function GET() {
  return discountRequest();
}

export async function POST(request: Request) {
  return discountRequest('', {
    method: 'POST',
    body: JSON.stringify(await request.json()),
  });
}
