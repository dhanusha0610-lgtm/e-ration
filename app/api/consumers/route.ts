import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const sql = getDb()
    const shopId = req.nextUrl.searchParams.get('shopId')

    if (shopId) {
      const consumers = await sql`
        SELECT c.*, u.name, s.name as shop_name
        FROM consumers c
        JOIN users u ON c.user_id = u.id
        JOIN shops s ON c.assigned_shop_id = s.id
        WHERE c.assigned_shop_id = ${shopId}
        ORDER BY u.name
      `
      return NextResponse.json(consumers)
    }

    const consumers = await sql`
      SELECT c.*, u.name, s.name as shop_name
      FROM consumers c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN shops s ON c.assigned_shop_id = s.id
      ORDER BY u.name
    `
    return NextResponse.json(consumers)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch consumers' }, { status: 500 })
  }
}
