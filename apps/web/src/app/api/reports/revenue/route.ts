import { NextRequest } from 'next/server';
import { supplierRequest } from '../../suppliers/proxy';

export async function GET(request: NextRequest) {
  return supplierRequest(`/reports/revenue${request.nextUrl.search}`);
}
