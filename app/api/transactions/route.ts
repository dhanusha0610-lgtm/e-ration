import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const sql = getDb()
    const shopId = req.nextUrl.searchParams.get('shopId')
    const consumerId = req.nextUrl.searchParams.get('consumerId')

    if (consumerId) {
      const transactions = await sql`
        SELECT t.*, s.name as shop_name, c.ration_card_number
        FROM transactions t
        JOIN shops s ON t.shop_id = s.id
        JOIN consumers c ON t.consumer_id = c.id
        WHERE t.consumer_id = ${consumerId}
        ORDER BY t.transaction_date DESC
      `
      
      for (const t of transactions) {
        const items = await sql`
          SELECT * FROM transaction_items WHERE transaction_id = ${t.id}
        `
        t.items = items
      }
      return NextResponse.json(transactions)
    }

    if (shopId) {
      const transactions = await sql`
        SELECT t.*, s.name as shop_name, u.name as consumer_name, c.ration_card_number
        FROM transactions t
        JOIN shops s ON t.shop_id = s.id
        JOIN consumers c ON t.consumer_id = c.id
        JOIN users u ON c.user_id = u.id
        WHERE t.shop_id = ${shopId}
        ORDER BY t.transaction_date DESC
      `
      return NextResponse.json(transactions)
    }

    const transactions = await sql`
      SELECT t.*, s.name as shop_name, u.name as consumer_name, c.ration_card_number
      FROM transactions t
      JOIN shops s ON t.shop_id = s.id
      JOIN consumers c ON t.consumer_id = c.id
      JOIN users u ON c.user_id = u.id
      ORDER BY t.transaction_date DESC
    `
    return NextResponse.json(transactions)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}
