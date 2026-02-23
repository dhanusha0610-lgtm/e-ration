"use client"

import { useState } from "react"
import { LogIn, Shield, Store, User, Eye, EyeOff } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

type UserRole = "consumer" | "shop_owner" | "admin"

const roleConfig = {
  consumer: { icon: User, label: "Consumer / Citizen", color: "bg-india-green", hint: "Login ID: RC-DL-2024-001 | Pass: user123" },
  shop_owner: { icon: Store, label: "Shop Owner (FPS)", color: "bg-saffron", hint: "Login ID: SHOP001 | Pass: shop123" },
  admin: { icon: Shield, label: "Administrator", color: "bg-primary", hint: "Login ID: ADMIN001 | Pass: admin123" },
}

interface LoginFormProps {
  onLogin: (data: { loginId: string; password: string }) => void
  isLoading: boolean
  error: string | null
}

export function LoginForm({ onLogin, isLoading, error }: LoginFormProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [loginId, setLoginId] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onLogin({ loginId, password })
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Welcome section */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-foreground md:text-3xl">
          Welcome to E-Ration Portal
        </h2>
        <p className="mt-2 text-muted-foreground">
          Select your role and login to access the Public Distribution System
        </p>
      </div>

      {/* Role selection */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {(Object.entries(roleConfig) as [UserRole, typeof roleConfig.consumer][]).map(([role, config]) => {
          const Icon = config.icon
          return (
            <button
              key={role}
              onClick={() => { setSelectedRole(role); setLoginId(""); setPassword("") }}
              className={`flex flex-col items-center gap-2 rounded-lg border-2 p-5 text-center transition-all ${
                selectedRole === role
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border bg-card hover:border-primary/40 hover:shadow"
              }`}
            >
              <div className={`flex h-14 w-14 items-center justify-center rounded-full ${config.color} text-primary-foreground`}>
                <Icon className="h-7 w-7" />
              </div>
              <span className="text-sm font-semibold text-card-foreground">{config.label}</span>
            </button>
          )
        })}
      </div>

      {/* Login form */}
      {selectedRole && (
        <Card className="mx-auto max-w-md border-primary/20">
          <CardHeader className="bg-primary/5 pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-primary">
              <LogIn className="h-5 w-5" />
              Login as {roleConfig[selectedRole].label}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="loginId" className="text-sm font-medium text-foreground">
                  {selectedRole === "consumer" ? "Ration Card No." : "Login ID"}
                </Label>
                <Input
                  id="loginId"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder={selectedRole === "consumer" ? "RC-DL-2024-001" : selectedRole === "shop_owner" ? "SHOP001" : "ADMIN001"}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <div className="rounded bg-muted p-2 text-xs text-muted-foreground">
                <strong>Demo:</strong> {roleConfig[selectedRole].hint}
              </div>

              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
