import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const sql = getDb()
    const shopId = req.nextUrl.searchParams.get('shopId')

    if (shopId) {
      const schedule = await sql`
        SELECT rs.*, s.name as shop_name
        FROM ration_schedule rs
        JOIN shops s ON rs.shop_id = s.id
        WHERE rs.shop_id = ${shopId}
        ORDER BY rs.issue_date DESC
      `
      return NextResponse.json(schedule)
    }

    const schedule = await sql`
      SELECT rs.*, s.name as shop_name
      FROM ration_schedule rs
      JOIN shops s ON rs.shop_id = s.id
      ORDER BY rs.issue_date DESC
    `
    return NextResponse.json(schedule)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const sql = getDb()
    const { shop_id, card_type, issue_date, items_description, status } = await req.json()
    await sql`
      INSERT INTO ration_schedule (shop_id, card_type, issue_date, items_description, status)
      VALUES (${shop_id}, ${card_type}, ${issue_date}, ${items_description}, ${status || 'upcoming'})
    `
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to add schedule' }, { status: 500 })
  }
}
