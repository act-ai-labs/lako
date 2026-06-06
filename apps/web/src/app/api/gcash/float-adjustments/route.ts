import { supplierRequest } from '../../suppliers/proxy';

export async function POST(request: Request) {
  return supplierRequest('/gcash/float-adjustments', {
    method: 'POST',
    body: JSON.stringify(await request.json()),
  });
}
