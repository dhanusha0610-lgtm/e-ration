"use client"

import useSWR from "swr"
import { Megaphone, MapPin, Clock, CalendarDays, Package } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function PublicInfo() {
  const { data: shops } = useSWR('/api/shops', fetcher)
  const { data: announcements } = useSWR('/api/announcements', fetcher)
  const { data: schedule } = useSWR('/api/schedule', fetcher)

  const upcomingSchedule = schedule?.filter((s: Record<string, string>) => s.status === 'upcoming') ?? []

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Announcements marquee */}
      {announcements && announcements.length > 0 && (
        <div className="mb-6 flex items-center gap-2 overflow-hidden rounded border border-saffron/30 bg-saffron/10 px-4 py-2.5">
          <Megaphone className="h-5 w-5 shrink-0 text-saffron" />
          <div className="overflow-hidden whitespace-nowrap">
            <p className="inline-block animate-[marquee_30s_linear_infinite] text-sm font-medium text-foreground">
              {announcements.map((a: Record<string, string>) => a.title).join('  |  ')}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Shop Information */}
        <Card className="border-primary/20">
          <CardHeader className="bg-primary/5 pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-primary">
              <MapPin className="h-5 w-5" />
              Fair Price Shops (FPS) Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {shops?.map((shop: Record<string, string | boolean>) => (
              <div key={shop.id as string} className="mb-4 rounded border border-border bg-muted/30 p-3 last:mb-0">
                <div className="mb-1 flex items-center justify-between">
                  <h4 className="font-semibold text-foreground">{shop.name}</h4>
                  <Badge variant={shop.is_active ? "default" : "destructive"} className={shop.is_active ? "bg-india-green text-primary-foreground" : ""}>
                    {shop.is_active ? "Open" : "Closed"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{shop.address}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs">
                  <span className="flex items-center gap-1 text-foreground">
                    <Clock className="h-3.5 w-3.5 text-saffron" />
                    {shop.open_time} - {shop.close_time}
                  </span>
                  <span className="flex items-center gap-1 text-foreground">
                    <CalendarDays className="h-3.5 w-3.5 text-india-green" />
                    Next Issue: {shop.next_issue_date ? new Date(shop.next_issue_date as string).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'TBA'}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Ration Schedule */}
        <Card className="border-primary/20">
          <CardHeader className="bg-primary/5 pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-primary">
              <Package className="h-5 w-5" />
              Upcoming Ration Distribution Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {upcomingSchedule.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No upcoming schedule announced</p>
            ) : (
              upcomingSchedule.map((s: Record<string, string>) => (
                <div key={s.id} className="mb-3 rounded border border-border bg-muted/30 p-3 last:mb-0">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{s.shop_name}</span>
                    <Badge className="bg-saffron text-primary-foreground">{s.card_type}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Date: {new Date(s.issue_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                  <p className="mt-1 text-xs text-foreground">{s.items_description}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Announcements Detail */}
        <Card className="border-primary/20 lg:col-span-2">
          <CardHeader className="bg-primary/5 pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-primary">
              <Megaphone className="h-5 w-5" />
              Government Announcements
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {announcements?.map((a: Record<string, string>) => (
              <div key={a.id} className="mb-3 rounded border-l-4 border-saffron bg-saffron/5 p-3 last:mb-0">
                <h4 className="font-semibold text-foreground">{a.title}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{a.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  - {a.author_name}, {new Date(a.created_at).toLocaleDateString('en-IN')}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
