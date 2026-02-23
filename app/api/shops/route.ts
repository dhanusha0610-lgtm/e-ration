import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET() {
  try {
    const sql = getDb()
    const shops = await sql`
      SELECT s.*, u.name as owner_name 
      FROM shops s 
      LEFT JOIN users u ON s.owner_user_id = u.id
      ORDER BY s.name
    `
    return NextResponse.json(shops)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch shops' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const sql = getDb()
    const { id, open_time, close_time, next_issue_date, is_active } = await req.json()
    await sql`
      UPDATE shops 
      SET open_time = ${open_time}, close_time = ${close_time}, 
          next_issue_date = ${next_issue_date}, is_active = ${is_active}
      WHERE id = ${id}
    `
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to update shop' }, { status: 500 })
  }
}
