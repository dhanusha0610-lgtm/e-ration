import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function POST(req: NextRequest) {
    try {
        const { qr_code, shop_id, isAdmin } = await req.json()
        const sql = getDb()

        // Find the booking
        const bookings = await sql`
            SELECT * FROM queue_bookings 
            WHERE qr_code = ${qr_code} 
            AND status = 'booked'
            AND (${isAdmin}::boolean = TRUE OR shop_id = ${shop_id ? parseInt(shop_id.toString()) : 0})
        `
        if (bookings.length === 0) {
            return NextResponse.json({ error: 'Invalid code, or shop mismatch' }, { status: 404 })
        }

        const booking = bookings[0]

        // Mark as completed
        await sql`
      UPDATE queue_bookings 
      SET status = 'completed'
      WHERE id = ${booking.id}
    `

        // Fetch Consumer Details
        const consumers = await sql`
            SELECT head_of_family as name, ration_card_number, card_type, phone 
            FROM consumers 
            WHERE id = ${booking.consumer_id}
        `
        if (consumers.length === 0) {
            return NextResponse.json({ error: 'Consumer not found' }, { status: 404 })
        }
        const consumer = consumers[0]

        // Fetch Ration Schedule (Allocated Items)
        const schedules = await sql`
            SELECT items_description, issue_date 
            FROM ration_schedule
            WHERE shop_id = ${booking.shop_id} AND card_type = ${consumer.card_type}
            ORDER BY issue_date DESC
            LIMIT 1
        `
        const schedule = schedules[0]

        // Parse items from description
        const items = (schedule && schedule.items_description) ? schedule.items_description.split(',').map((item: string) => {
            const parts = item.trim().split(':')
            return {
                name: parts[0]?.trim() || 'Item',
                quantity: parts[1]?.trim() || '-',
                price: '-'
            }
        }) : []

        const timing = (schedule && schedule.issue_date)
            ? new Date(schedule.issue_date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
            : 'Current Cycle'

        return NextResponse.json({
            success: true,
            message: 'QR Verified. Issue Ration.',
            details: {
                consumer: {
                    name: consumer.name,
                    card_no: consumer.ration_card_number,
                    type: consumer.card_type
                },
                items: items,
                timing: timing
            }
        })
    } catch (e: any) {
        console.error("Verification Error:", e)
        return NextResponse.json({ error: 'Verification failed', message: e.message }, { status: 500 })
    }
}
