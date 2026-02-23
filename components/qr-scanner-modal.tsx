"use client"

import { useState, useEffect } from "react"
import { Scanner } from "@yudiel/react-qr-scanner"
import { Loader2, Camera, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface QrScannerModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onScan: (result: string) => void
}

export function QrScannerModal({ open, onOpenChange, onScan }: QrScannerModalProps) {
    const [error, setError] = useState<string | null>(null)

    // Reset error when modal opens
    useEffect(() => {
        if (open) setError(null)
    }, [open])

    const handleScan = (result: string) => {
        if (result) {
            onScan(result)
            onOpenChange(false)
        }
    }

    const handleError = (error: unknown) => {
        console.error("QR Scan Error:", error)
        setError("Failed to access camera. Please ensure you have granted camera permissions.")
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-primary">
                        <Camera className="h-5 w-5" /> Scan QR Code
                    </DialogTitle>
                    <DialogDescription>
                        Point your camera at the consumer's QR code to verify.
                    </DialogDescription>
                </DialogHeader>

                <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-black/5">
                    {error ? (
                        <div className="flex h-full flex-col items-center justify-center p-4 text-center text-destructive">
                            <XCircle className="mb-2 h-10 w-10" />
                            <p>{error}</p>
                            <Button
                                variant="outline"
                                className="mt-4 border-destructive text-destructive hover:bg-destructive/10"
                                onClick={() => setError(null)}
                            >
                                Retry
                            </Button>
                        </div>
                    ) : (
                        <Scanner
                            onScan={(result) => result[0] && handleScan(result[0].rawValue)}
                            onError={(err) => handleError(err)}
                            components={{
                                audio: false,
                                torch: false,
                                count: false,
                                onOff: false,
                                tracker: false
                            }}
                            styles={{
                                container: { width: '100%', height: '100%' },
                                video: { width: '100%', height: '100%', objectFit: 'cover' }
                            }}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
