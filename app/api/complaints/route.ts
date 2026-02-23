import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const sql = getDb()
    const consumerId = req.nextUrl.searchParams.get('consumerId')

    if (consumerId) {
      const complaints = await sql`
        SELECT co.*, s.name as shop_name
        FROM complaints co
        JOIN shops s ON co.shop_id = s.id
        WHERE co.consumer_id = ${consumerId}
        ORDER BY co.created_at DESC
      `
      return NextResponse.json(complaints)
    }

    const complaints = await sql`
      SELECT co.*, s.name as shop_name, u.name as consumer_name, c.ration_card_number
      FROM complaints co
      JOIN shops s ON co.shop_id = s.id
      JOIN consumers c ON co.consumer_id = c.id
      JOIN users u ON c.user_id = u.id
      ORDER BY co.created_at DESC
    `
    return NextResponse.json(complaints)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch complaints' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const sql = getDb()
    const { consumer_id, shop_id, subject, description } = await req.json()
    await sql`
      INSERT INTO complaints (consumer_id, shop_id, subject, description)
      VALUES (${consumer_id}, ${shop_id}, ${subject}, ${description})
    `
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to create complaint' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const sql = getDb()
    const { id, status } = await req.json()
    const resolvedAt = status === 'resolved' ? new Date().toISOString() : null
    await sql`
      UPDATE complaints SET status = ${status}, resolved_at = ${resolvedAt} WHERE id = ${id}
    `
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to update complaint' }, { status: 500 })
  }
}
