import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const sql = getDb()
    const shopId = req.nextUrl.searchParams.get('shopId')

    if (shopId) {
      const items = await sql`
        SELECT * FROM stock_items WHERE shop_id = ${shopId} ORDER BY category, item_name
      `
      return NextResponse.json(items)
    }

    const items = await sql`
      SELECT si.*, s.name as shop_name 
      FROM stock_items si 
      JOIN shops s ON si.shop_id = s.id 
      ORDER BY s.name, si.category, si.item_name
    `
    return NextResponse.json(items)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch stock' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const sql = getDb()
    const { shop_id, item_name, category, quantity_kg, unit, price_per_unit } = await req.json()
    await sql`
      INSERT INTO stock_items (shop_id, item_name, category, quantity_kg, unit, price_per_unit)
      VALUES (${shop_id}, ${item_name}, ${category}, ${quantity_kg}, ${unit}, ${price_per_unit})
    `
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to add stock' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const sql = getDb()
    const { id, quantity_kg, price_per_unit } = await req.json()
    await sql`
      UPDATE stock_items 
      SET quantity_kg = ${quantity_kg}, price_per_unit = ${price_per_unit}, last_updated = NOW()
      WHERE id = ${id}
    `
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sql = getDb()
    const { id } = await req.json()
    await sql`DELETE FROM stock_items WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete stock' }, { status: 500 })
  }
}
