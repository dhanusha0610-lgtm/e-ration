"use client"

import { useState } from "react"
import { GovHeader } from "@/components/gov-header"
import { GovFooter } from "@/components/gov-footer"
import { LoginForm } from "@/components/login-form"
import { PublicInfo } from "@/components/public-info"
import { ConsumerDashboard } from "@/components/consumer-dashboard"
import { ShopDashboard } from "@/components/shop-dashboard"
import { AdminDashboard } from "@/components/admin-dashboard"
import { toast } from "sonner"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Rec = Record<string, any>

export default function Home() {
  const [user, setUser] = useState<Rec | null>(null)
  const [consumer, setConsumer] = useState<Rec | null>(null)
  const [shop, setShop] = useState<Rec | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  const handleLogin = async (data: { loginId: string; password: string }) => {
    setIsLoading(true)
    setLoginError(null)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (!res.ok) {
        setLoginError(result.error || 'Invalid credentials')
        return
      }
      setUser(result.user)
      setConsumer(result.consumer || null)
      setShop(result.shop || null)
      toast.success(`Welcome, ${result.user.name}!`)
    } catch {
      setLoginError('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    setUser(null)
    setConsumer(null)
    setShop(null)
    toast.info("Logged out successfully")
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <GovHeader 
        userName={user?.name} 
        role={user?.role} 
        onLogout={user ? handleLogout : undefined} 
      />

      <main className="flex-1">
        {!user ? (
          <>
            <LoginForm onLogin={handleLogin} isLoading={isLoading} error={loginError} />
            <PublicInfo />
          </>
        ) : user.role === 'consumer' && consumer ? (
          <ConsumerDashboard user={user} consumer={consumer} />
        ) : user.role === 'shop_owner' && shop ? (
          <ShopDashboard user={user} shop={shop} />
        ) : user.role === 'admin' ? (
          <AdminDashboard user={user} />
        ) : null}
      </main>

      <GovFooter />
    </div>
  )
}
