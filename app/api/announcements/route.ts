import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET() {
  try {
    const sql = getDb()
    const announcements = await sql`
      SELECT a.*, u.name as author_name
      FROM announcements a
      LEFT JOIN users u ON a.created_by = u.id
      WHERE a.is_active = true
      ORDER BY a.created_at DESC
    `
    return NextResponse.json(announcements)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const sql = getDb()
    const { title, message, created_by, target_role } = await req.json()
    await sql`
      INSERT INTO announcements (title, message, created_by, target_role)
      VALUES (${title}, ${message}, ${created_by}, ${target_role || 'all'})
    `
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sql = getDb()
    const { id } = await req.json()
    await sql`UPDATE announcements SET is_active = false WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete announcement' }, { status: 500 })
  }
}
