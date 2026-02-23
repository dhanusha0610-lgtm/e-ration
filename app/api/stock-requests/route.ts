import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const sql = getDb()
    const shopId = req.nextUrl.searchParams.get('shopId')

    if (shopId) {
      const requests = await sql`
        SELECT sr.*, s.name as shop_name
        FROM stock_requests sr
        JOIN shops s ON sr.shop_id = s.id
        WHERE sr.shop_id = ${shopId}
        ORDER BY sr.requested_at DESC
      `
      return NextResponse.json(requests)
    }

    const requests = await sql`
      SELECT sr.*, s.name as shop_name
      FROM stock_requests sr
      JOIN shops s ON sr.shop_id = s.id
      ORDER BY sr.requested_at DESC
    `
    return NextResponse.json(requests)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch stock requests' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const sql = getDb()
    const { shop_id, item_name, quantity_requested, unit } = await req.json()
    await sql`
      INSERT INTO stock_requests (shop_id, item_name, quantity_requested, unit)
      VALUES (${shop_id}, ${item_name}, ${quantity_requested}, ${unit || 'kg'})
    `
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to create stock request' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const sql = getDb()
    const { id, status } = await req.json()
    await sql`
      UPDATE stock_requests SET status = ${status}, resolved_at = NOW() WHERE id = ${id}
    `
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to update stock request' }, { status: 500 })
  }
}
