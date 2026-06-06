import { NextRequest } from 'next/server';
import { supplierRequest } from '../../suppliers/proxy';

export async function GET(request: NextRequest) {
  return supplierRequest(`/reports/inventory${request.nextUrl.search}`);
}
