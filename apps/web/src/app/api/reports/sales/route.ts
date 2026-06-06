import { NextRequest } from 'next/server';
import { supplierRequest } from '../../suppliers/proxy';

export async function GET(request: NextRequest) {
  return supplierRequest(`/reports/sales${request.nextUrl.search}`);
}
