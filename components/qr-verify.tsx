"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { CheckCircle, XCircle, Search, User, CreditCard, Package, Camera } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { QrScannerModal } from "@/components/qr-scanner-modal"
import { toast } from "sonner"

interface QRVerifyProps {
    shopId?: string | number
    isAdmin?: boolean
}

export function QRVerify({ shopId, isAdmin }: QRVerifyProps) {
    const [code, setCode] = useState("")
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [scannerOpen, setScannerOpen] = useState(false)

    const handleVerify = async (val?: string) => {
        const codeToVerify = val || code
        if (!codeToVerify) { toast.error("Please enter or scan a code"); return }
        setLoading(true)
        setResult(null)
        try {
            const res = await fetch('/api/queue/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ qr_code: codeToVerify.trim(), shop_id: shopId, isAdmin }),
            })
            const data = await res.json()
            if (res.ok) {
                setResult(data.details)
                toast.success("Verification Successful!")
            } else {
                toast.error(data.error || "Verification failed")
            }
        } catch {
            toast.error("An error occurred during verification")
        } finally {
            setLoading(false)
        }
    }

    const handleScan = (decodedText: string) => {
        setCode(decodedText)
        handleVerify(decodedText)
    }

    const handleIssueRation = async () => {
        if (!result) return
        setLoading(true)
        try {
            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    consumer_id: result.consumer.id,
                    shop_id: result.shop_id,
                    items: result.items,
                    total_amount: 0 // In this system, price might be handled differently or be 0 for some items
                }),
            })
            const data = await res.json()
            if (res.ok) {
                toast.success("Ration issued and stock updated!")
                setResult(null)
                setCode("")
                // If mutations are needed for dashboards, they should be triggered here,
                // but since this is a sub-component, we rely on the parent or global mutate.
                mutate(key => typeof key === 'string' && key.startsWith('/api/stock'))
                mutate(key => typeof key === 'string' && key.startsWith('/api/transactions'))
            } else {
                toast.error(data.error || "Failed to issue ration")
            }
        } catch {
            toast.error("An error occurred while issuing ration")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-primary/20">
                <CardHeader className="bg-primary/5 pb-3">
                    <CardTitle className="flex items-center gap-2 text-base text-primary">
                        <Search className="h-5 w-5" /> Verify Booking
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Booking ID / Unique Code</label>
                            <div className="flex gap-2">
                                <Input
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder="Enter Q-YYYYMMDD-ID..."
                                    className="font-mono"
                                    onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                                />
                                <Button variant="outline" size="icon" onClick={() => setScannerOpen(true)} className="shrink-0 border-primary text-primary hover:bg-primary/10">
                                    <Camera className="h-4 w-4" />
                                </Button>
                                <Button onClick={() => handleVerify()} disabled={loading} className="bg-primary hover:bg-primary/90">
                                    {loading ? "Verifying..." : "Verify"}
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Enter the unique code provided by the consumer or scan their QR code.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 rounded-lg bg-muted p-4 border border-border">
                            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                                <CheckCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground">Wait for User Confirmation</p>
                                <p className="text-xs text-muted-foreground">Once verified, the ration allocation details will appear on the right.</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <QrScannerModal
                open={scannerOpen}
                onOpenChange={setScannerOpen}
                onScan={handleScan}
            />

            {result ? (
                <Card className="border-india-green/20 animate-in fade-in slide-in-from-right-4 duration-300">
                    <CardHeader className="bg-india-green/5 border-b border-india-green/10 pb-3">
                        <CardTitle className="flex items-center gap-2 text-base text-india-green">
                            <User className="h-5 w-5" /> Consumer & Ration Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-foreground">{result.consumer.name}</h3>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <CreditCard className="h-3.5 w-3.5" /> {result.consumer.card_no}
                                </p>
                                <Badge className="mt-1 bg-saffron text-primary-foreground">
                                    {result.consumer.type}
                                </Badge>
                            </div>
                            <Badge variant="outline" className="border-india-green text-india-green bg-india-green/5">
                                Verified Slot
                            </Badge>
                        </div>

                        <div className="rounded-lg border border-border bg-muted/30 overflow-hidden">
                            <div className="bg-primary/5 px-3 py-2 border-b border-border flex items-center gap-2">
                                <Package className="h-4 w-4 text-primary" />
                                <span className="text-xs font-bold text-primary uppercase tracking-wider">Allocated Items ({result.timing})</span>
                            </div>
                            <div className="divide-y divide-border">
                                {result.items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between px-3 py-2 text-sm">
                                        <span className="font-medium text-foreground">{item.name}</span>
                                        <span className="text-muted-foreground font-mono">{item.quantity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Button
                            onClick={handleIssueRation}
                            disabled={loading}
                            className="w-full bg-india-green hover:bg-india-green/90 text-primary-foreground gap-2"
                        >
                            <CheckCircle className="h-4 w-4" /> {loading ? "Issuing..." : "Issue Ration Items"}
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="flex flex-col items-center justify-center p-8 rounded-lg border-2 border-dashed border-border opacity-50 text-center">
                    <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-muted-foreground">No Verification Data</h3>
                    <p className="text-sm text-muted-foreground mt-1">Verify a code to view ration details.</p>
                </div>
            )}
        </div>
    )
}
