"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { loginSchema } from "@/lib/schema/schema"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { IconDatabase, IconCheck, IconX } from "@tabler/icons-react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [dbTesting, setDbTesting] = useState(false)
  const [dbStatus, setDbStatus] = useState<"idle" | "success" | "error">("idle")
  const [dbMessage, setDbMessage] = useState("")
  const [dbSuggestions, setDbSuggestions] = useState<string[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"

  async function handleTestDatabase() {
    setDbTesting(true)
    setDbStatus("idle")
    setDbMessage("")
    setDbSuggestions([])

    try {
      const response = await fetch("/api/health/database")
      const data = await response.json()

      if (data.success) {
        setDbStatus("success")
        setDbMessage(`✅ ${data.message} (${data.details.responseTime})`)
        setDbSuggestions([])
        toast.success(`Database Connected! Response time: ${data.details.responseTime}`, {
          description: `Host: ${data.details.host} | Pooler: ${data.details.isPooler ? "Yes" : "No"}`,
        })
      } else {
        setDbStatus("error")
        setDbMessage(`❌ ${data.errorType}: ${data.message}`)
        setDbSuggestions(data.suggestions || [])
        const errorDetails = data.suggestions?.length 
          ? `${data.message}\n\nSuggestions:\n${data.suggestions.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}`
          : data.message
        toast.error(`Database Connection Failed: ${data.errorType}`, {
          description: errorDetails,
          duration: 15000,
        })
      }
    } catch (error: any) {
      setDbStatus("error")
      const errorMsg = error?.message || "Failed to test database connection"
      setDbMessage(`❌ Error: ${errorMsg}`)
      setDbSuggestions([])
      toast.error("Database Test Failed", {
        description: errorMsg,
        duration: 10000,
      })
    } finally {
      setDbTesting(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = loginSchema.safeParse({ email, password })
    if (!parsed.success) {
      const first = parsed.error.issues[0]
      toast.error(first?.message ?? "Validation failed")
      return
    }
    setLoading(true)
    try {
      const result = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error(`Invalid email or password | ${result.error}`)
        setLoading(false)
        return
      }

      if (result?.ok) {
        toast.success("Signed in successfully")
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      toast.error("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email and password to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </Field>
              <Field>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
                <FieldDescription className="text-center">
                  BBM Admin Dashboard
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
          
          {/* Database Connection Test */}
          <div className="mt-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleTestDatabase}
              disabled={dbTesting || loading}
              className={cn(
                "w-full",
                dbStatus === "success" && "border-green-500 bg-green-50 dark:bg-green-950",
                dbStatus === "error" && "border-red-500 bg-red-50 dark:bg-red-950"
              )}
            >
              {dbTesting ? (
                <>
                  <IconDatabase className="mr-2 h-4 w-4 animate-spin" />
                  Testing connection...
                </>
              ) : dbStatus === "success" ? (
                <>
                  <IconCheck className="mr-2 h-4 w-4 text-green-600" />
                  Database Connected
                </>
              ) : dbStatus === "error" ? (
                <>
                  <IconX className="mr-2 h-4 w-4 text-red-600" />
                  Connection Failed
                </>
              ) : (
                <>
                  <IconDatabase className="mr-2 h-4 w-4" />
                  Test Database Connection
                </>
              )}
            </Button>
            {dbMessage && (
              <div
                className={cn(
                  "mt-2 p-3 text-xs rounded-md",
                  dbStatus === "success" && "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
                  dbStatus === "error" && "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                )}
              >
                <div className="font-medium mb-1">{dbMessage}</div>
                {dbStatus === "error" && dbSuggestions.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-red-300 dark:border-red-700">
                    <div className="font-semibold mb-1 text-[11px]">Suggestions:</div>
                    <ul className="list-disc list-inside space-y-1 text-[10px] opacity-90">
                      {dbSuggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
