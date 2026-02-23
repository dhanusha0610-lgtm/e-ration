"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import {
  Package, Users, ClipboardList, Clock, Plus, Trash2, Edit2, PackagePlus, CalendarPlus, QrCode
} from "lucide-react"
import { QRVerify } from "@/components/qr-verify"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url).then(r => r.json())

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Rec = Record<string, any>

interface ShopDashboardProps {
  user: Rec
  shop: Rec
}

export function ShopDashboard({ user, shop }: ShopDashboardProps) {
  const { data: stock } = useSWR(`/api/stock?shopId=${shop.id}`, fetcher)
  const { data: consumers } = useSWR(`/api/consumers?shopId=${shop.id}`, fetcher)
  const { data: transactions } = useSWR(`/api/transactions?shopId=${shop.id}`, fetcher)
  const { data: schedule } = useSWR(`/api/schedule?shopId=${shop.id}`, fetcher)
  const { data: stockRequests } = useSWR(`/api/stock-requests?shopId=${shop.id}`, fetcher)

  // Stock add form
  const [addOpen, setAddOpen] = useState(false)
  const [newItem, setNewItem] = useState({ item_name: '', category: 'Grain', quantity_kg: '', unit: 'kg', price_per_unit: '' })

  // Stock edit
  const [editOpen, setEditOpen] = useState(false)
  const [editItem, setEditItem] = useState<Rec | null>(null)

  // Schedule form
  const [schedOpen, setSchedOpen] = useState(false)
  const [newSched, setNewSched] = useState({ card_type: 'BPL', issue_date: '', items_description: '' })

  // Stock request form
  const [reqOpen, setReqOpen] = useState(false)
  const [newReq, setNewReq] = useState({ item_name: '', quantity_requested: '', unit: 'kg' })

  // Shop timing update
  const [timingOpen, setTimingOpen] = useState(false)
  const [timing, setTiming] = useState({ open_time: shop.open_time, close_time: shop.close_time, next_issue_date: shop.next_issue_date || '' })

  const handleAddStock = async () => {
    const res = await fetch('/api/stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shop_id: shop.id, ...newItem, quantity_kg: Number(newItem.quantity_kg), price_per_unit: Number(newItem.price_per_unit) }),
    })
    if (res.ok) { toast.success("Item added"); setAddOpen(false); mutate(`/api/stock?shopId=${shop.id}`) }
    else toast.error("Failed to add item")
  }

  const handleEditStock = async () => {
    if (!editItem) return
    const res = await fetch('/api/stock', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editItem.id, quantity_kg: Number(editItem.quantity_kg), price_per_unit: Number(editItem.price_per_unit) }),
    })
    if (res.ok) { toast.success("Stock updated"); setEditOpen(false); mutate(`/api/stock?shopId=${shop.id}`) }
    else toast.error("Failed to update")
  }

  const handleDeleteStock = async (id: number) => {
    if (!confirm("Delete this item?")) return
    const res = await fetch('/api/stock', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    if (res.ok) { toast.success("Item removed"); mutate(`/api/stock?shopId=${shop.id}`) }
    else toast.error("Failed to delete")
  }

  const handleAddSchedule = async () => {
    const res = await fetch('/api/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shop_id: shop.id, ...newSched }),
    })
    if (res.ok) { toast.success("Schedule added"); setSchedOpen(false); mutate(`/api/schedule?shopId=${shop.id}`) }
    else toast.error("Failed to add schedule")
  }

  const handleStockRequest = async () => {
    const res = await fetch('/api/stock-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shop_id: shop.id, ...newReq, quantity_requested: Number(newReq.quantity_requested) }),
    })
    if (res.ok) { toast.success("Request submitted"); setReqOpen(false); mutate(`/api/stock-requests?shopId=${shop.id}`) }
    else toast.error("Failed to submit request")
  }

  const handleUpdateTiming = async () => {
    const res = await fetch('/api/shops', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: shop.id, ...timing, is_active: true }),
    })
    if (res.ok) { toast.success("Timing updated"); setTimingOpen(false) }
    else toast.error("Failed to update")
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Shop info bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
        <div>
          <h2 className="text-lg font-bold text-primary">{shop.name}</h2>
          <p className="text-xs text-muted-foreground">ID: {shop.shop_id} | {shop.district}, {shop.state}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-sm text-foreground">
            <Clock className="h-4 w-4 text-saffron" /> {shop.open_time} - {shop.close_time}
          </span>
          <Dialog open={timingOpen} onOpenChange={setTimingOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/5">
                <Edit2 className="mr-1 h-3.5 w-3.5" /> Update Timing
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="text-primary">Update Shop Timing</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-foreground">Open Time</Label><Input value={timing.open_time} onChange={e => setTiming({ ...timing, open_time: e.target.value })} className="mt-1" /></div>
                  <div><Label className="text-foreground">Close Time</Label><Input value={timing.close_time} onChange={e => setTiming({ ...timing, close_time: e.target.value })} className="mt-1" /></div>
                </div>
                <div><Label className="text-foreground">Next Issue Date</Label><Input type="date" value={timing.next_issue_date ? timing.next_issue_date.split('T')[0] : ''} onChange={e => setTiming({ ...timing, next_issue_date: e.target.value })} className="mt-1" /></div>
              </div>
              <DialogFooter><Button onClick={handleUpdateTiming} className="bg-primary text-primary-foreground">Save</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="stock" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-2 gap-1 bg-muted p-1 md:grid-cols-5">
          <TabsTrigger value="stock" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Package className="h-3.5 w-3.5" /> Stock
          </TabsTrigger>
          <TabsTrigger value="consumers" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Users className="h-3.5 w-3.5" /> Consumers
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <ClipboardList className="h-3.5 w-3.5" /> Transactions
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <CalendarPlus className="h-3.5 w-3.5" /> Schedule
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <PackagePlus className="h-3.5 w-3.5" /> Requests
          </TabsTrigger>
          <TabsTrigger value="verify" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <QrCode className="h-3.5 w-3.5" /> Verify Queue
          </TabsTrigger>
        </TabsList>

        {/* Stock Management */}
        <TabsContent value="stock">
          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between bg-primary/5 pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-primary">
                <Package className="h-5 w-5" /> Inventory Management
              </CardTitle>
              <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-india-green text-primary-foreground hover:bg-india-green/80">
                    <Plus className="mr-1 h-4 w-4" /> Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle className="text-primary">Add Stock Item</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <div><Label className="text-foreground">Item Name</Label><Input value={newItem.item_name} onChange={e => setNewItem({ ...newItem, item_name: e.target.value })} placeholder="e.g. Rice" className="mt-1" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-foreground">Category</Label>
                        <Select value={newItem.category} onValueChange={v => setNewItem({ ...newItem, category: v })}>
                          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Grain">Grain</SelectItem>
                            <SelectItem value="Pulses">Pulses</SelectItem>
                            <SelectItem value="Grocery">Grocery</SelectItem>
                            <SelectItem value="Oil">Oil</SelectItem>
                            <SelectItem value="Fuel">Fuel</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-foreground">Unit</Label>
                        <Select value={newItem.unit} onValueChange={v => setNewItem({ ...newItem, unit: v })}>
                          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="litre">litre</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label className="text-foreground">Quantity</Label><Input type="number" value={newItem.quantity_kg} onChange={e => setNewItem({ ...newItem, quantity_kg: e.target.value })} className="mt-1" /></div>
                      <div><Label className="text-foreground">Price/Unit (Rs.)</Label><Input type="number" value={newItem.price_per_unit} onChange={e => setNewItem({ ...newItem, price_per_unit: e.target.value })} className="mt-1" /></div>
                    </div>
                  </div>
                  <DialogFooter><Button onClick={handleAddStock} className="bg-primary text-primary-foreground">Add Item</Button></DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-primary/20 bg-muted">
                      <th className="px-3 py-2 text-left font-semibold text-foreground">Item</th>
                      <th className="px-3 py-2 text-left font-semibold text-foreground">Category</th>
                      <th className="px-3 py-2 text-right font-semibold text-foreground">Quantity</th>
                      <th className="px-3 py-2 text-right font-semibold text-foreground">Price/Unit</th>
                      <th className="px-3 py-2 text-right font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stock?.map((item: Rec) => (
                      <tr key={item.id} className="border-b border-border">
                        <td className="px-3 py-2 font-medium text-foreground">{item.item_name}</td>
                        <td className="px-3 py-2 text-muted-foreground">{item.category}</td>
                        <td className="px-3 py-2 text-right text-foreground">{Number(item.quantity_kg).toFixed(1)} {item.unit}</td>
                        <td className="px-3 py-2 text-right text-foreground">Rs. {Number(item.price_per_unit).toFixed(2)}</td>
                        <td className="px-3 py-2 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-primary hover:bg-primary/10" onClick={() => { setEditItem({ ...item }); setEditOpen(true) }}>
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteStock(item.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogContent>
              <DialogHeader><DialogTitle className="text-primary">Edit {editItem?.item_name}</DialogTitle></DialogHeader>
              {editItem && (
                <div className="space-y-3">
                  <div><Label className="text-foreground">Quantity ({editItem.unit})</Label><Input type="number" value={editItem.quantity_kg} onChange={e => setEditItem({ ...editItem, quantity_kg: e.target.value })} className="mt-1" /></div>
                  <div><Label className="text-foreground">Price/Unit (Rs.)</Label><Input type="number" value={editItem.price_per_unit} onChange={e => setEditItem({ ...editItem, price_per_unit: e.target.value })} className="mt-1" /></div>
                </div>
              )}
              <DialogFooter><Button onClick={handleEditStock} className="bg-primary text-primary-foreground">Update</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Consumers Tab */}
        <TabsContent value="consumers">
          <Card className="border-primary/20">
            <CardHeader className="bg-primary/5 pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-primary">
                <Users className="h-5 w-5" /> Registered Consumers ({consumers?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-primary/20 bg-muted">
                      <th className="px-3 py-2 text-left font-semibold text-foreground">Name</th>
                      <th className="px-3 py-2 text-left font-semibold text-foreground">Card No.</th>
                      <th className="px-3 py-2 text-left font-semibold text-foreground">Type</th>
                      <th className="px-3 py-2 text-right font-semibold text-foreground">Members</th>
                      <th className="px-3 py-2 text-left font-semibold text-foreground">Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consumers?.map((c: Rec) => (
                      <tr key={c.id} className="border-b border-border">
                        <td className="px-3 py-2 font-medium text-foreground">{c.name}</td>
                        <td className="px-3 py-2 text-foreground">{c.ration_card_number}</td>
                        <td className="px-3 py-2"><Badge className="bg-saffron text-primary-foreground">{c.card_type}</Badge></td>
                        <td className="px-3 py-2 text-right text-foreground">{c.family_members}</td>
                        <td className="px-3 py-2 text-foreground">{c.phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card className="border-primary/20">
            <CardHeader className="bg-primary/5 pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-primary">
                <ClipboardList className="h-5 w-5" /> Transaction Records
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-primary/20 bg-muted">
                      <th className="px-3 py-2 text-left font-semibold text-foreground">Date</th>
                      <th className="px-3 py-2 text-left font-semibold text-foreground">Consumer</th>
                      <th className="px-3 py-2 text-left font-semibold text-foreground">Card No.</th>
                      <th className="px-3 py-2 text-right font-semibold text-foreground">Amount</th>
                      <th className="px-3 py-2 text-right font-semibold text-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions?.map((t: Rec) => (
                      <tr key={t.id} className="border-b border-border">
                        <td className="px-3 py-2 text-foreground">{new Date(t.transaction_date).toLocaleDateString('en-IN')}</td>
                        <td className="px-3 py-2 font-medium text-foreground">{t.consumer_name}</td>
                        <td className="px-3 py-2 text-muted-foreground">{t.ration_card_number}</td>
                        <td className="px-3 py-2 text-right font-medium text-foreground">Rs. {Number(t.total_amount).toFixed(2)}</td>
                        <td className="px-3 py-2 text-right"><Badge className="bg-india-green text-primary-foreground">{t.status}</Badge></td>
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
            <CardHeader className="flex flex-row items-center justify-between bg-primary/5 pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-primary">
                <CalendarPlus className="h-5 w-5" /> Distribution Schedule
              </CardTitle>
              <Dialog open={schedOpen} onOpenChange={setSchedOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-india-green text-primary-foreground hover:bg-india-green/80">
                    <Plus className="mr-1 h-4 w-4" /> Add Schedule
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle className="text-primary">Add Distribution Schedule</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-foreground">Card Type</Label>
                      <Select value={newSched.card_type} onValueChange={v => setNewSched({ ...newSched, card_type: v })}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="APL">APL</SelectItem>
                          <SelectItem value="BPL">BPL</SelectItem>
                          <SelectItem value="AAY">AAY</SelectItem>
                          <SelectItem value="PHH">PHH</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div><Label className="text-foreground">Issue Date</Label><Input type="date" value={newSched.issue_date} onChange={e => setNewSched({ ...newSched, issue_date: e.target.value })} className="mt-1" /></div>
                    <div><Label className="text-foreground">Items Description</Label><Input value={newSched.items_description} onChange={e => setNewSched({ ...newSched, items_description: e.target.value })} placeholder="Rice: 5kg, Wheat: 10kg..." className="mt-1" /></div>
                  </div>
                  <DialogFooter><Button onClick={handleAddSchedule} className="bg-primary text-primary-foreground">Add Schedule</Button></DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {schedule?.map((s: Rec) => (
                  <div key={s.id} className={`rounded border-l-4 p-3 ${s.status === 'upcoming' ? 'border-saffron bg-saffron/5' : s.status === 'completed' ? 'border-india-green bg-india-green/5' : 'border-primary bg-primary/5'}`}>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-saffron text-primary-foreground">{s.card_type}</Badge>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={s.status === 'completed' ? 'border-india-green text-india-green' : 'border-saffron text-saffron'}>{s.status}</Badge>
                        <span className="text-sm text-foreground">{new Date(s.issue_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-foreground">{s.items_description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stock Requests */}
        <TabsContent value="requests">
          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between bg-primary/5 pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-primary">
                <PackagePlus className="h-5 w-5" /> Stock Requests to Administration
              </CardTitle>
              <Dialog open={reqOpen} onOpenChange={setReqOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-india-green text-primary-foreground hover:bg-india-green/80">
                    <Plus className="mr-1 h-4 w-4" /> New Request
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle className="text-primary">Request Stock from Administration</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <div><Label className="text-foreground">Item Name</Label><Input value={newReq.item_name} onChange={e => setNewReq({ ...newReq, item_name: e.target.value })} placeholder="e.g. Rice" className="mt-1" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label className="text-foreground">Quantity</Label><Input type="number" value={newReq.quantity_requested} onChange={e => setNewReq({ ...newReq, quantity_requested: e.target.value })} className="mt-1" /></div>
                      <div>
                        <Label className="text-foreground">Unit</Label>
                        <Select value={newReq.unit} onValueChange={v => setNewReq({ ...newReq, unit: v })}>
                          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="litre">litre</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter><Button onClick={handleStockRequest} className="bg-primary text-primary-foreground">Submit Request</Button></DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-primary/20 bg-muted">
                      <th className="px-3 py-2 text-left font-semibold text-foreground">Item</th>
                      <th className="px-3 py-2 text-right font-semibold text-foreground">Quantity</th>
                      <th className="px-3 py-2 text-left font-semibold text-foreground">Requested On</th>
                      <th className="px-3 py-2 text-right font-semibold text-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockRequests?.map((r: Rec) => (
                      <tr key={r.id} className="border-b border-border">
                        <td className="px-3 py-2 font-medium text-foreground">{r.item_name}</td>
                        <td className="px-3 py-2 text-right text-foreground">{Number(r.quantity_requested).toFixed(1)} {r.unit}</td>
                        <td className="px-3 py-2 text-muted-foreground">{new Date(r.requested_at).toLocaleDateString('en-IN')}</td>
                        <td className="px-3 py-2 text-right">
                          <Badge className={
                            r.status === 'approved' ? 'bg-india-green text-primary-foreground' :
                              r.status === 'rejected' ? 'bg-destructive text-primary-foreground' :
                                'bg-saffron text-primary-foreground'
                          }>{r.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Verification Tab */}
        <TabsContent value="verify">
          <QRVerify shopId={shop.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
