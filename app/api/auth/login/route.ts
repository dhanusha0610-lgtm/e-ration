import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { loginId, password } = await req.json()
    const sql = getDb()

    const users = await sql`
      SELECT id, role, login_id, name FROM users 
      WHERE login_id = ${loginId} AND password_hash = ${password}
    `

    if (users.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const user = users[0]

    // For consumers, get extra info
    if (user.role === 'consumer') {
      const consumers = await sql`
        SELECT c.*, s.name as shop_name, s.shop_id as shop_code
        FROM consumers c
        LEFT JOIN shops s ON c.assigned_shop_id = s.id
        WHERE c.user_id = ${user.id}
      `
      return NextResponse.json({ user, consumer: consumers[0] || null })
    }

    // For shop owners, get shop info
    if (user.role === 'shop_owner') {
      const shops = await sql`
        SELECT * FROM shops WHERE owner_user_id = ${user.id}
      `
      return NextResponse.json({ user, shop: shops[0] || null })
    }

    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
