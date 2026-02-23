"use client"

import { useState } from "react"
import useSWR from "swr"
import { Megaphone, MapPin, Clock, CalendarDays, Package, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

/* -------------------- TYPES -------------------- */
// ... (Shop, Schedule types remain same)
interface Shop {
  id: string
  name: string
  address: string
  is_active: boolean
  open_time: string
  close_time: string
  next_issue_date?: string
}

interface Announcement {
  id: string
  title: string
  message: string
  author_name: string
  created_at: string
}

interface Schedule {
  id: string
  shop_name: string
  card_type: string
  issue_date: string
  items_description: string
  status: string
}

/* -------------------- COMPONENT -------------------- */

export function PublicInfo() {
  const { data: shopsData } = useSWR("/api/shops", fetcher)
  const { data: announcementsData } = useSWR("/api/announcements", fetcher)
  const { data: scheduleData } = useSWR("/api/schedule", fetcher)

  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)

  // Ensure arrays no matter what API returns
  const shops: Shop[] = Array.isArray(shopsData)
    ? shopsData
    : shopsData?.shops ?? []

  const announcements: Announcement[] = Array.isArray(announcementsData)
    ? announcementsData
    : announcementsData?.announcements ?? []

  const schedule: Schedule[] = Array.isArray(scheduleData)
    ? scheduleData
    : scheduleData?.schedule ?? []

  const upcomingSchedule = schedule.filter(
    (s) => s.status === "upcoming"
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Announcements marquee */}
      {announcements.length > 0 && (
        <div className="mb-6 flex items-center gap-2 overflow-hidden rounded border border-saffron/30 bg-saffron/10 px-4 py-2.5">
          <Megaphone className="h-5 w-5 shrink-0 text-saffron" />
          <div className="overflow-hidden whitespace-nowrap">
            <p className="inline-block animate-[marquee_30s_linear_infinite] text-sm font-medium text-foreground">
              {announcements.map((a) => a.title).join("  |  ")}
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
            {shops.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No shops available
              </p>
            ) : (
              shops.map((shop) => (
                <div
                  key={shop.id}
                  className="mb-4 rounded border border-border bg-muted/30 p-3 last:mb-0"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <h4 className="font-semibold text-foreground">
                      {shop.name}
                    </h4>
                    <Badge
                      variant={shop.is_active ? "default" : "destructive"}
                      className={
                        shop.is_active
                          ? "bg-india-green text-primary-foreground"
                          : ""
                      }
                    >
                      {shop.is_active ? "Open" : "Closed"}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {shop.address}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-3 text-xs">
                    <span className="flex items-center gap-1 text-foreground">
                      <Clock className="h-3.5 w-3.5 text-saffron" />
                      {shop.open_time} - {shop.close_time}
                    </span>

                    <span className="flex items-center gap-1 text-foreground">
                      <CalendarDays className="h-3.5 w-3.5 text-india-green" />
                      Next Issue:{" "}
                      {shop.next_issue_date
                        ? new Date(
                          shop.next_issue_date
                        ).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                        : "TBA"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Upcoming Schedule */}
        <Card className="border-primary/20">
          <CardHeader className="bg-primary/5 pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-primary">
              <Package className="h-5 w-5" />
              Upcoming Ration Distribution Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {upcomingSchedule.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No upcoming schedule announced
              </p>
            ) : (
              upcomingSchedule.map((s) => (
                <div
                  key={s.id}
                  className="mb-3 rounded border border-border bg-muted/30 p-3 last:mb-0"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {s.shop_name}
                    </span>
                    <Badge className="bg-saffron text-primary-foreground">
                      {s.card_type}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Date:{" "}
                    {new Date(s.issue_date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>

                  <p className="mt-1 text-xs text-foreground">
                    {s.items_description}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Announcement Details */}
        <Card className="border-primary/20 lg:col-span-2">
          <CardHeader className="bg-primary/5 pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-primary">
              <Megaphone className="h-5 w-5" />
              Government Announcements
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {announcements.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No announcements available
              </p>
            ) : (
              announcements.map((a) => (
                <div
                  key={a.id}
                  className="mb-3 flex flex-col items-start justify-between gap-2 rounded border-l-4 border-saffron bg-saffron/5 p-3 sm:flex-row sm:items-center last:mb-0"
                >
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {a.title}
                    </h4>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {a.message}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      - {a.author_name},{" "}
                      {new Date(a.created_at).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 border-saffron text-saffron hover:bg-saffron/10"
                    onClick={() => setSelectedAnnouncement(a)}
                  >
                    <Eye className="mr-1 h-3.5 w-3.5" /> Read More
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Announcement Modal */}
      <Dialog open={!!selectedAnnouncement} onOpenChange={(open) => !open && setSelectedAnnouncement(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl text-primary">
              <Megaphone className="h-5 w-5" />
              {selectedAnnouncement?.title}
            </DialogTitle>
            <DialogDescription>
              Posted by {selectedAnnouncement?.author_name} on {selectedAnnouncement && new Date(selectedAnnouncement.created_at).toLocaleDateString("en-IN", { dateStyle: 'long' })}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto py-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {selectedAnnouncement?.message}
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setSelectedAnnouncement(null)} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
