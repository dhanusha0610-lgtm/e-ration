"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import {
  LayoutDashboard, Store, Users, Package, ClipboardList, Megaphone, MessageSquare, PackagePlus,
  Plus, CheckCircle, XCircle, ArrowUpRight, QrCode
} from "lucide-react"
import { QRVerify } from "@/components/qr-verify"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url).then(r => r.json())

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Rec = Record<string, any>

interface AdminDashboardProps {
  user: Rec
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const { data: shops } = useSWR('/api/shops', fetcher)
  const { data: consumers } = useSWR('/api/consumers', fetcher)
  const { data: stock } = useSWR('/api/stock', fetcher)
  const { data: transactions } = useSWR('/api/transactions', fetcher)
  const { data: complaints } = useSWR('/api/complaints', fetcher)
  const { data: announcements } = useSWR('/api/announcements', fetcher)
  const { data: stockRequests } = useSWR('/api/stock-requests', fetcher)

  // Announcement form
  const [announcementOpen, setAnnouncementOpen] = useState(false)
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '', target_role: 'all' })

  const handleCreateAnnouncement = async () => {
    const res = await fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newAnnouncement, created_by: user.id }),
    })
    if (res.ok) { toast.success("Announcement created"); setAnnouncementOpen(false); mutate('/api/announcements') }
    else toast.error("Failed to create")
  }

  const handleDeleteAnnouncement = async (id: number) => {
    const res = await fetch('/api/announcements', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    if (res.ok) { toast.success("Announcement removed"); mutate('/api/announcements') }
  }

  const handleStockRequest = async (id: number, status: string) => {
    const res = await fetch('/api/stock-requests', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    if (res.ok) { toast.success(`Request ${status}`); mutate('/api/stock-requests') }
    else toast.error("Failed to update")
  }

  const handleComplaintStatus = async (id: number, status: string) => {
    const res = await fetch('/api/complaints', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    if (res.ok) { toast.success(`Complaint marked as ${status}`); mutate('/api/complaints') }
    else toast.error("Failed to update")
  }

  const openComplaints = complaints?.filter((c: Rec) => c.status !== 'resolved').length || 0
  const pendingRequests = stockRequests?.filter((r: Rec) => r.status === 'pending').length || 0

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-3 gap-1 bg-muted p-1 md:grid-cols-7">
          <TabsTrigger value="overview" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <LayoutDashboard className="h-3.5 w-3.5" /> Overview
          </TabsTrigger>
          <TabsTrigger value="shops" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Store className="h-3.5 w-3.5" /> Shops
          </TabsTrigger>
          <TabsTrigger value="consumers" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Users className="h-3.5 w-3.5" /> Consumers
          </TabsTrigger>
          <TabsTrigger value="stock" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Package className="h-3.5 w-3.5" /> Stock
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <PackagePlus className="h-3.5 w-3.5" /> Requests
          </TabsTrigger>
          <TabsTrigger value="complaints" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <MessageSquare className="h-3.5 w-3.5" /> Grievances
          </TabsTrigger>
          <TabsTrigger value="announcements" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Megaphone className="h-3.5 w-3.5" /> Notices
          </TabsTrigger>
          <TabsTrigger value="verify" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <QrCode className="h-3.5 w-3.5" /> Verification
          </TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Store} label="Total Shops" value={shops?.length || 0} color="bg-primary" />
            <StatCard icon={Users} label="Total Consumers" value={consumers?.length || 0} color="bg-india-green" />
            <StatCard icon={ClipboardList} label="Total Transactions" value={transactions?.length || 0} color="bg-saffron" />
            <StatCard icon={MessageSquare} label="Open Grievances" value={openComplaints} color="bg-destructive" />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {/* Pending stock requests */}
            <Card className="border-primary/20">
              <CardHeader className="bg-primary/5 pb-3">
                <CardTitle className="flex items-center justify-between text-base text-primary">
                  <span className="flex items-center gap-2"><PackagePlus className="h-5 w-5" /> Pending Stock Requests</span>
                  <Badge className="bg-saffron text-primary-foreground">{pendingRequests}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {stockRequests?.filter((r: Rec) => r.status === 'pending').slice(0, 5).map((r: Rec) => (
                  <div key={r.id} className="mb-2 flex items-center justify-between rounded border border-border bg-muted/30 p-2 last:mb-0">
                    <div>
                      <span className="text-sm font-medium text-foreground">{r.item_name} - {Number(r.quantity_requested).toFixed(0)} {r.unit}</span>
                      <p className="text-xs text-muted-foreground">{r.shop_name}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" className="h-7 bg-india-green text-primary-foreground hover:bg-india-green/80" onClick={() => handleStockRequest(r.id, 'approved')}>
                        <CheckCircle className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="destructive" className="h-7" onClick={() => handleStockRequest(r.id, 'rejected')}>
                        <XCircle className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent complaints */}
            <Card className="border-primary/20">
              <CardHeader className="bg-primary/5 pb-3">
                <CardTitle className="flex items-center justify-between text-base text-primary">
                  <span className="flex items-center gap-2"><MessageSquare className="h-5 w-5" /> Recent Grievances</span>
                  <Badge className="bg-destructive text-primary-foreground">{openComplaints}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {complaints?.filter((c: Rec) => c.status !== 'resolved').slice(0, 5).map((c: Rec) => (
                  <div key={c.id} className="mb-2 rounded border border-border bg-muted/30 p-2 last:mb-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{c.subject}</span>
                      <Badge className={c.status === 'in_progress' ? 'bg-saffron text-primary-foreground' : 'bg-destructive text-primary-foreground'}>{c.status.replace('_', ' ')}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{c.consumer_name} | {c.shop_name}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Recent transactions */}
          <Card className="mt-6 border-primary/20">
            <CardHeader className="bg-primary/5 pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-primary">
                <ArrowUpRight className="h-5 w-5" /> Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-primary/20 bg-muted">
                      <th className="px-3 py-2 text-left font-semibold text-foreground">Date</th>
                      <th className="px-3 py-2 text-left font-semibold text-foreground">Consumer</th>
                      <th className="px-3 py-2 text-left font-semibold text-foreground">Shop</th>
                      <th className="px-3 py-2 text-right font-semibold text-foreground">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions?.slice(0, 10).map((t: Rec) => (
                      <tr key={t.id} className="border-b border-border">
                        <td className="px-3 py-2 text-foreground">{new Date(t.transaction_date).toLocaleDateString('en-IN')}</td>
                        <td className="px-3 py-2 font-medium text-foreground">{t.consumer_name}</td>
                        <td className="px-3 py-2 text-muted-foreground">{t.shop_name}</td>
                        <td className="px-3 py-2 text-right font-medium text-foreground">Rs. {Number(t.total_amount).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shops Tab */}
        <TabsContent value="shops">
          <Card className="border-primary/20">
            <CardHeader className="bg-primary/5 pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-primary">
                <Store className="h-5 w-5" /> All Fair Price Shops
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-primary/20 bg-muted">
                      <th className="px-3 py-2 text-left font-semibold text-foreground">Shop</th>
                      <th className="px-3 py-2 text-left font-semibold text-foreground">Owner</th>
                      <th className="px-3 py-2 text-left font-semibold text-foreground">District</th>
                      <th className="px-3 py-2 text-left font-semibold text-foreground">Timing</th>
                      <th className="px-3 py-2 text-left font-semibold text-foreground">Next Issue</th>
                      <th className="px-3 py-2 text-right font-semibold text-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shops?.map((s: Rec) => (
                      <tr key={s.id} className="border-b border-border">
                        <td className="px-3 py-2">
                          <div className="font-medium text-foreground">{s.name}</div>
                          <div className="text-xs text-muted-foreground">{s.shop_id}</div>
                        </td>
                        <td className="px-3 py-2 text-foreground">{s.owner_name}</td>
                        <td className="px-3 py-2 text-foreground">{s.district}</td>
                        <td className="px-3 py-2 text-foreground">{s.open_time} - {s.close_time}</td>
                        <td className="px-3 py-2 text-foreground">{s.next_issue_date ? new Date(s.next_issue_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'TBA'}</td>
                        <td className="px-3 py-2 text-right">
                          <Badge className={s.is_active ? "bg-india-green text-primary-foreground" : "bg-destructive text-primary-foreground"}>
                            {s.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consumers Tab */}
        <TabsContent value="consumers">
          <Card className="border-primary/20">
            <CardHeader className="bg-primary/5 pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-primary">
                <Users className="h-5 w-5" /> All Registered Consumers ({consumers?.length || 0})
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
                      <th className="px-3 py-2 text-left font-semibold text-foreground">Assigned Shop</th>
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
                        <td className="px-3 py-2 text-muted-foreground">{c.shop_name}</td>
                        <td className="px-3 py-2 text-foreground">{c.phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stock Tab */}
        <TabsContent value="stock">
          <Card className="border-primary/20">
            <CardHeader className="bg-primary/5 pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-primary">
                <Package className="h-5 w-5" /> All Shop Inventories
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-primary/20 bg-muted">
                      <th className="px-3 py-2 text-left font-semibold text-foreground">Shop</th>
                      <th className="px-3 py-2 text-left font-semibold text-foreground">Item</th>
                      <th className="px-3 py-2 text-left font-semibold text-foreground">Category</th>
                      <th className="px-3 py-2 text-right font-semibold text-foreground">Available</th>
                      <th className="px-3 py-2 text-right font-semibold text-foreground">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stock?.map((item: Rec) => (
                      <tr key={item.id} className="border-b border-border">
                        <td className="px-3 py-2 text-foreground">{item.shop_name}</td>
                        <td className="px-3 py-2 font-medium text-foreground">{item.item_name}</td>
                        <td className="px-3 py-2 text-muted-foreground">{item.category}</td>
                        <td className="px-3 py-2 text-right text-foreground">{Number(item.quantity_kg).toFixed(1)} {item.unit}</td>
                        <td className="px-3 py-2 text-right text-foreground">Rs. {Number(item.price_per_unit).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stock Requests Tab */}
        <TabsContent value="requests">
          <Card className="border-primary/20">
            <CardHeader className="bg-primary/5 pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-primary">
                <PackagePlus className="h-5 w-5" /> Stock Requests from Shops
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-primary/20 bg-muted">
                      <th className="px-3 py-2 text-left font-semibold text-foreground">Shop</th>
                      <th className="px-3 py-2 text-left font-semibold text-foreground">Item</th>
                      <th className="px-3 py-2 text-right font-semibold text-foreground">Qty</th>
                      <th className="px-3 py-2 text-left font-semibold text-foreground">Date</th>
                      <th className="px-3 py-2 text-right font-semibold text-foreground">Status</th>
                      <th className="px-3 py-2 text-right font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockRequests?.map((r: Rec) => (
                      <tr key={r.id} className="border-b border-border">
                        <td className="px-3 py-2 font-medium text-foreground">{r.shop_name}</td>
                        <td className="px-3 py-2 text-foreground">{r.item_name}</td>
                        <td className="px-3 py-2 text-right text-foreground">{Number(r.quantity_requested).toFixed(0)} {r.unit}</td>
                        <td className="px-3 py-2 text-muted-foreground">{new Date(r.requested_at).toLocaleDateString('en-IN')}</td>
                        <td className="px-3 py-2 text-right">
                          <Badge className={
                            r.status === 'approved' ? 'bg-india-green text-primary-foreground' :
                              r.status === 'rejected' ? 'bg-destructive text-primary-foreground' :
                                'bg-saffron text-primary-foreground'
                          }>{r.status}</Badge>
                        </td>
                        <td className="px-3 py-2 text-right">
                          {r.status === 'pending' && (
                            <div className="flex items-center justify-end gap-1">
                              <Button size="sm" className="h-7 bg-india-green text-primary-foreground hover:bg-india-green/80" onClick={() => handleStockRequest(r.id, 'approved')}>
                                <CheckCircle className="mr-1 h-3 w-3" /> Approve
                              </Button>
                              <Button size="sm" variant="destructive" className="h-7" onClick={() => handleStockRequest(r.id, 'rejected')}>
                                <XCircle className="mr-1 h-3 w-3" /> Reject
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Complaints Tab */}
        <TabsContent value="complaints">
          <Card className="border-primary/20">
            <CardHeader className="bg-primary/5 pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-primary">
                <MessageSquare className="h-5 w-5" /> All Grievances
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {complaints?.map((c: Rec) => (
                  <div key={c.id} className={`rounded border-l-4 p-3 ${c.status === 'resolved' ? 'border-india-green bg-india-green/5' :
                      c.status === 'in_progress' ? 'border-saffron bg-saffron/5' :
                        'border-destructive bg-destructive/5'
                    }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-foreground">{c.subject}</span>
                        <p className="text-xs text-muted-foreground">{c.consumer_name} ({c.ration_card_number}) | {c.shop_name}</p>
                      </div>
                      <Badge className={
                        c.status === 'resolved' ? 'bg-india-green text-primary-foreground' :
                          c.status === 'in_progress' ? 'bg-saffron text-primary-foreground' :
                            'bg-destructive text-primary-foreground'
                      }>{c.status.replace('_', ' ')}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Filed: {new Date(c.created_at).toLocaleDateString('en-IN')}</span>
                      {c.status !== 'resolved' && (
                        <div className="flex gap-1">
                          {c.status === 'open' && (
                            <Button size="sm" className="h-6 bg-saffron text-xs text-primary-foreground hover:bg-saffron/80" onClick={() => handleComplaintStatus(c.id, 'in_progress')}>
                              Mark In Progress
                            </Button>
                          )}
                          <Button size="sm" className="h-6 bg-india-green text-xs text-primary-foreground hover:bg-india-green/80" onClick={() => handleComplaintStatus(c.id, 'resolved')}>
                            Resolve
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Announcements Tab */}
        <TabsContent value="announcements">
          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between bg-primary/5 pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-primary">
                <Megaphone className="h-5 w-5" /> Announcements & Notices
              </CardTitle>
              <Dialog open={announcementOpen} onOpenChange={setAnnouncementOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-india-green text-primary-foreground hover:bg-india-green/80">
                    <Plus className="mr-1 h-4 w-4" /> New Announcement
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle className="text-primary">Create Announcement</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <div><Label className="text-foreground">Title</Label><Input value={newAnnouncement.title} onChange={e => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })} className="mt-1" /></div>
                    <div><Label className="text-foreground">Message</Label><Textarea value={newAnnouncement.message} onChange={e => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })} rows={4} className="mt-1" /></div>
                    <div>
                      <Label className="text-foreground">Target Audience</Label>
                      <Select value={newAnnouncement.target_role} onValueChange={v => setNewAnnouncement({ ...newAnnouncement, target_role: v })}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Users</SelectItem>
                          <SelectItem value="consumer">Consumers Only</SelectItem>
                          <SelectItem value="shop_owner">Shop Owners Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter><Button onClick={handleCreateAnnouncement} className="bg-primary text-primary-foreground">Publish</Button></DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {announcements?.map((a: Rec) => (
                  <div key={a.id} className="rounded border-l-4 border-saffron bg-saffron/5 p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-foreground">{a.title}</h4>
                        <p className="mt-1 text-sm text-muted-foreground">{a.message}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          By: {a.author_name} | Target: {a.target_role} | {new Date(a.created_at).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteAnnouncement(a.id)}>
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Verification Tab */}
        <TabsContent value="verify">
          <QRVerify isAdmin={true} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number; color: string }) {
  return (
    <Card className="border-primary/20">
      <CardContent className="flex items-center gap-4 p-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${color} text-primary-foreground`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
