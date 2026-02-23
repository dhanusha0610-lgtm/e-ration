"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import {
  User, CreditCard, Package, Calendar, ClipboardList, MessageSquare, MapPin, Clock
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface ConsumerDashboardProps {
  user: Record<string, string | number>
  consumer: Record<string, string | number | null>
}

export function ConsumerDashboard({ user, consumer }: ConsumerDashboardProps) {
  const { data: stock } = useSWR(consumer?.assigned_shop_id ? `/api/stock?shopId=${consumer.assigned_shop_id}` : null, fetcher)
  const { data: schedule } = useSWR(consumer?.assigned_shop_id ? `/api/schedule?shopId=${consumer.assigned_shop_id}` : null, fetcher)
  const { data: transactions } = useSWR(consumer?.id ? `/api/transactions?consumerId=${consumer.id}` : null, fetcher)
  const { data: complaints } = useSWR(consumer?.id ? `/api/complaints?consumerId=${consumer.id}` : null, fetcher)
  const { data: shops } = useSWR('/api/shops', fetcher)

  const [complaintSubject, setComplaintSubject] = useState("")
  const [complaintDesc, setComplaintDesc] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const assignedShop = shops?.find((s: Record<string, string | number>) => s.id === consumer?.assigned_shop_id)
  const upcomingSchedule = schedule?.filter((s: Record<string, string>) => s.status === 'upcoming') ?? []

  const cardTypeLabel: Record<string, string> = {
    APL: "Above Poverty Line",
    BPL: "Below Poverty Line",
    AAY: "Antyodaya Anna Yojana",
    PHH: "Priority Household"
  }

  const handleComplaint = async () => {
    if (!complaintSubject || !complaintDesc) { toast.error("Fill all fields"); return }
    setSubmitting(true)
    const res = await fetch('/api/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consumer_id: consumer.id,
        shop_id: consumer.assigned_shop_id,
        subject: complaintSubject,
        description: complaintDesc,
      }),
    })
    if (res.ok) {
      toast.success("Complaint submitted successfully")
      setComplaintSubject("")
      setComplaintDesc("")
      mutate(`/api/complaints?consumerId=${consumer.id}`)
    } else {
      toast.error("Failed to submit complaint")
    }
    setSubmitting(false)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-2 gap-1 bg-muted p-1 md:grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <User className="h-3.5 w-3.5" /> Profile
          </TabsTrigger>
          <TabsTrigger value="stock" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Package className="h-3.5 w-3.5" /> Stock
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Calendar className="h-3.5 w-3.5" /> Schedule
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <ClipboardList className="h-3.5 w-3.5" /> History
          </TabsTrigger>
          <TabsTrigger value="complaint" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <MessageSquare className="h-3.5 w-3.5" /> Grievance
          </TabsTrigger>
          <TabsTrigger value="queue" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Clock className="h-3.5 w-3.5" /> Queue
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-primary/20">
              <CardHeader className="bg-primary/5 pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-primary">
                  <CreditCard className="h-5 w-5" /> Ration Card Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <InfoRow label="Card Number" value={consumer?.ration_card_number as string} />
                  <InfoRow label="Card Type" value={`${consumer?.card_type} - ${cardTypeLabel[consumer?.card_type as string] || ''}`} />
                  <InfoRow label="Head of Family" value={consumer?.head_of_family as string} />
                  <InfoRow label="Family Members" value={String(consumer?.family_members)} />
                  <InfoRow label="Phone" value={consumer?.phone as string} />
                  <InfoRow label="Aadhaar" value={consumer?.aadhar_number ? `XXXX-XXXX-${(consumer.aadhar_number as string).slice(-4)}` : 'N/A'} />
                  <InfoRow label="Address" value={consumer?.address as string} />
                  <InfoRow label="Next Allocation" value={consumer?.next_allocation_date ? new Date(consumer.next_allocation_date as string).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'TBA'} />
                </div>
              </CardContent>
            </Card>

            {assignedShop && (
              <Card className="border-primary/20">
                <CardHeader className="bg-primary/5 pb-3">
                  <CardTitle className="flex items-center gap-2 text-base text-primary">
                    <MapPin className="h-5 w-5" /> Assigned Shop
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <InfoRow label="Shop Name" value={assignedShop.name} />
                    <InfoRow label="Shop ID" value={assignedShop.shop_id} />
                    <InfoRow label="Address" value={assignedShop.address} />
                    <InfoRow label="District" value={assignedShop.district} />
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-4 w-4 text-saffron" />
                      <span className="font-medium text-foreground">Timing:</span>
                      <span className="text-foreground">{assignedShop.open_time} - {assignedShop.close_time}</span>
                    </div>
                    <InfoRow label="Next Issue Date" value={assignedShop.next_issue_date ? new Date(assignedShop.next_issue_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'TBA'} />
                    <Badge className={assignedShop.is_active ? "bg-india-green text-primary-foreground" : "bg-destructive text-primary-foreground"}>
                      {assignedShop.is_active ? "Currently Open" : "Closed"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Stock Tab */}
        <TabsContent value="stock">
          <Card className="border-primary/20">
            <CardHeader className="bg-primary/5 pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-primary">
                <Package className="h-5 w-5" /> Current Stock at {assignedShop?.name || 'Your Shop'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-primary/20 bg-muted">
                      <th className="px-3 py-2 text-left font-semibold text-foreground">Item</th>
                      <th className="px-3 py-2 text-left font-semibold text-foreground">Category</th>
                      <th className="px-3 py-2 text-right font-semibold text-foreground">Available</th>
                      <th className="px-3 py-2 text-right font-semibold text-foreground">Price/Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stock?.map((item: Record<string, string | number>) => (
                      <tr key={item.id} className="border-b border-border">
                        <td className="px-3 py-2 font-medium text-foreground">{item.item_name}</td>
                        <td className="px-3 py-2 text-muted-foreground">{item.category}</td>
                        <td className="px-3 py-2 text-right text-foreground">
                          {Number(item.quantity_kg).toFixed(1)} {item.unit}
                        </td>
                        <td className="px-3 py-2 text-right text-foreground">
                          Rs. {Number(item.price_per_unit).toFixed(2)}/{item.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule">
          <Card className="border-primary/20">
            <CardHeader className="bg-primary/5 pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-primary">
                <Calendar className="h-5 w-5" /> Upcoming Ration Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {upcomingSchedule.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">No upcoming schedule announced for your shop.</p>
              ) : (
                <div className="space-y-3">
                  {upcomingSchedule.map((s: Record<string, string>) => (
                    <div key={s.id} className={`rounded border-l-4 p-3 ${s.card_type === consumer?.card_type ? 'border-india-green bg-india-green/5' : 'border-border bg-muted/30'}`}>
                      <div className="flex items-center justify-between">
                        <Badge className={s.card_type === consumer?.card_type ? "bg-india-green text-primary-foreground" : "bg-muted text-muted-foreground"}>
                          {s.card_type} {s.card_type === consumer?.card_type ? '(Your Card)' : ''}
                        </Badge>
                        <span className="text-sm font-medium text-foreground">
                          {new Date(s.issue_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-foreground">{s.items_description}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transaction History */}
        <TabsContent value="history">
          <Card className="border-primary/20">
            <CardHeader className="bg-primary/5 pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-primary">
                <ClipboardList className="h-5 w-5" /> Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {!transactions || transactions.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">No transactions found.</p>
              ) : (
                <div className="space-y-3">
                  {transactions.map((t: Record<string, string | number | Record<string, string | number>[]>) => (
                    <div key={t.id as number} className="rounded border border-border bg-muted/30 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{t.shop_name as string}</span>
                        <Badge className="bg-india-green text-primary-foreground">{t.status as string}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(t.transaction_date as string).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-foreground">Total: Rs. {Number(t.total_amount).toFixed(2)}</p>
                      {(t.items as Record<string, string | number>[])?.length > 0 && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          {(t.items as Record<string, string | number>[]).map((item, idx) => (
                            <span key={idx}>
                              {item.item_name}: {Number(item.quantity).toFixed(1)} {item.unit} (Rs. {Number(item.price).toFixed(2)})
                              {idx < (t.items as Record<string, string | number>[]).length - 1 ? ' | ' : ''}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="complaint">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-primary/20">
              <CardHeader className="bg-primary/5 pb-3">
                <CardTitle className="text-base text-primary">File Grievance</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-foreground">Subject</Label>
                    <Input
                      value={complaintSubject}
                      onChange={(e) => setComplaintSubject(e.target.value)}
                      placeholder="Brief subject of your complaint"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-foreground">Description</Label>
                    <Textarea
                      value={complaintDesc}
                      onChange={(e) => setComplaintDesc(e.target.value)}
                      placeholder="Describe your issue in detail..."
                      rows={4}
                      className="mt-1"
                    />
                  </div>
                  <Button onClick={handleComplaint} disabled={submitting} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    {submitting ? "Submitting..." : "Submit Grievance"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader className="bg-primary/5 pb-3">
                <CardTitle className="text-base text-primary">Your Complaints</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {!complaints || complaints.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">No complaints filed.</p>
                ) : (
                  <div className="space-y-3">
                    {complaints.map((c: any) => (
                      <div key={c.id} className="rounded border border-border bg-muted/30 p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">{c.subject}</span>
                          <Badge className={
                            c.status === 'resolved' ? 'bg-india-green text-primary-foreground' :
                              c.status === 'in_progress' ? 'bg-saffron text-primary-foreground' :
                                'bg-destructive text-primary-foreground'
                          }>
                            {c.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{c.description}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Shop: {c.shop_name} | Filed: {new Date(c.created_at).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Queue / Booking Tab */}
        <TabsContent value="queue">
          <QueueBooking consumer={consumer} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function QueueBooking({ consumer }: { consumer: any }) {
  const { data: booking, mutate: refreshBooking } = useSWR(`/api/queue?consumer_id=${consumer.id}`, fetcher)
  const [selectedDate, setSelectedDate] = useState("")
  const [loading, setLoading] = useState(false)

  const handleBook = async () => {
    if (!selectedDate) { toast.error("Select a date"); return }
    setLoading(true)
    const res = await fetch('/api/queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consumer_id: consumer.id,
        shop_id: consumer.assigned_shop_id,
        date: selectedDate
      })
    })
    const data = await res.json()
    if (res.ok) {
      toast.success("Slot booked successfully!")
      refreshBooking()
    } else {
      toast.error(data.error || "Booking failed")
    }
    setLoading(false)
  }

  return (
    <Card className="border-primary/20 max-w-2xl mx-auto">
      <CardHeader className="bg-primary/5 pb-3">
        <CardTitle className="flex items-center gap-2 text-base text-primary">
          <Clock className="h-5 w-5" /> Ration Queue Booking
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {booking ? (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="p-4 bg-white rounded-lg shadow-sm border">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${booking.qr_code}`}
                alt="Queue QR Code"
                className="h-48 w-48 object-contain"
              />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">Booking Confirmed</h3>
              <p className="text-muted-foreground mt-1">
                Date: {new Date(booking.booking_date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p className="text-sm font-mono bg-muted px-2 py-1 rounded mt-2 inline-block text-foreground">
                Code: {booking.qr_code}
              </p>
              <p className="mt-4 text-sm text-muted-foreground max-w-sm">
                Please show this QR code at the fair price shop to collect your ration.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-sm mx-auto">
            <div className="space-y-2">
              <Label className="text-foreground">Select Date for Visit</Label>
              <Input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">Choose a convenient date to pick up your ration supply.</p>
            </div>
            <Button onClick={handleBook} disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              {loading ? "Booking Slot..." : "Book Slot"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="min-w-[120px] font-medium text-muted-foreground">{label}:</span>
      <span className="text-foreground">{value || 'N/A'}</span>
    </div>
  )
}

