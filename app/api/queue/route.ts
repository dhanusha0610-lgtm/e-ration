import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function POST(req: NextRequest) {
    try {
        const { consumer_id, shop_id, date } = await req.json()
        const sql = getDb()

        // Check if user already booked for this date
        const existing = await sql`
      SELECT id FROM queue_bookings 
      WHERE consumer_id = ${consumer_id} AND booking_date = ${date} AND status = 'booked'
    `
        if (existing.length > 0) {
            return NextResponse.json({ error: 'Already booked for this date' }, { status: 400 })
        }

        // Generate unique QR
        const qr_code = `Q-${date.replace(/-/g, '')}-${consumer_id}-${Math.floor(Math.random() * 10000)}`

        // Insert booking
        const result = await sql`
      INSERT INTO queue_bookings (consumer_id, shop_id, booking_date, qr_code)
      VALUES (${consumer_id}, ${shop_id}, ${date}, ${qr_code})
      RETURNING *
    `

        return NextResponse.json(result[0])
    } catch (error) {
        console.error('Queue booking error:', error)
        return NextResponse.json({ error: 'Failed to book slot' }, { status: 500 })
    }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const consumer_id = searchParams.get('consumer_id')

    if (!consumer_id) {
        return NextResponse.json({ error: 'Missing consumer_id' }, { status: 400 })
    }

    try {
        const sql = getDb()
        const bookings = await sql`
      SELECT * FROM queue_bookings 
      WHERE consumer_id = ${consumer_id} AND status = 'booked'
      ORDER BY booking_date DESC
      LIMIT 1
    `
        // Also check past bookings? Only active one is needed for strict queue.
        return NextResponse.json(bookings[0] || null)
    } catch {
        return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 })
    }
}
