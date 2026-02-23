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
export async function POST(req: NextRequest) {
  try {
    const { consumer_id, shop_id, items, total_amount } = await req.json()
    const sql = getDb()

    // Start a transaction (manual if neon doesn't support .begin, but we can just use multiple queries)
    // For simplicity in this demo, we'll do sequential updates, but ideal is a transaction.

    // 1. Create transaction record
    const tResult = await sql`
      INSERT INTO transactions (consumer_id, shop_id, total_amount, status)
      VALUES (${consumer_id}, ${shop_id}, ${total_amount || 0}, 'completed')
      RETURNING id
    `
    const transactionId = tResult[0].id

    // 2. Insert items and Update stock
    for (const item of items) {
      // item format: { name, quantity } -> quantity is string like "5kg"
      const qtyStr = item.quantity.toString()
      const numericQty = parseFloat(qtyStr.replace(/[^0-9.]/g, '')) || 0

      await sql`
        INSERT INTO transaction_items (transaction_id, item_name, quantity, price)
        VALUES (${transactionId}, ${item.name}, ${numericQty}, 0)
      `

      // Deduct from stock
      await sql`
        UPDATE stock_items
        SET quantity_kg = quantity_kg - ${numericQty},
            last_updated = NOW()
        WHERE shop_id = ${shop_id} AND item_name ILIKE ${item.name}
      `
    }

    return NextResponse.json({ success: true, transactionId })
  } catch (error: any) {
    console.error('Transaction error:', error)
    return NextResponse.json({ error: 'Failed to record transaction', details: error.message }, { status: 500 })
  }
}
