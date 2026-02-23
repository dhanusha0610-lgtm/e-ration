"use client"

import { Wheat } from "lucide-react"

export function GovHeader({ userName, role, onLogout }: { userName?: string; role?: string; onLogout?: () => void }) {
  return (
    <header className="w-full">
      {/* Tricolor stripe */}
      <div className="flex h-1.5">
        <div className="flex-1 bg-saffron" />
        <div className="flex-1 bg-card" />
        <div className="flex-1 bg-india-green" />
      </div>

      {/* Main header */}
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-saffron bg-primary-foreground/10">
              <Wheat className="h-7 w-7 text-saffron" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight md:text-xl">
                E-Ration Card Management System
              </h1>
              <p className="text-xs text-primary-foreground/80 md:text-sm">
                National Food Security Act | Public Distribution System
              </p>
            </div>
          </div>
          
          {userName && (
            <div className="flex items-center gap-3">
              <div className="hidden text-right text-sm md:block">
                <p className="font-medium">{userName}</p>
                <p className="text-xs text-primary-foreground/70 capitalize">{role?.replace('_', ' ')}</p>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="rounded bg-saffron px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-saffron/80"
                >
                  Logout
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sub header */}
      <div className="bg-primary/90 text-primary-foreground/90">
        <div className="mx-auto max-w-7xl px-4 py-1.5">
          <p className="text-center text-xs">
            Ministry of Consumer Affairs, Food & Public Distribution | Government of India
          </p>
        </div>
      </div>
    </header>
  )
}
