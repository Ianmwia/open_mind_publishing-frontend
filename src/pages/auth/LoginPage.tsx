import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn, AlertCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {Eye, EyeOff} from "lucide-react";
import {toast} from 'sonner'

export const LoginPage: React.FC = () => {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      // Determine if identifier is an email or username
      const isEmail = identifier.includes('@')
      await login({
        ...(isEmail ? { email: identifier } : { username: identifier }),
        password,
      })
      toast.success('Login successful!')
      navigate('/profile')
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Login failed. Please check your credentials.')
      } else {
        setError('Login failed. Please check your credentials.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6">
      <Card className="w-full max-w-md shadow-lg border-slate-200 dark:border-slate-800">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-2">
            <LogIn className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Enter your credentials to access your Open Mind Publishing account
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 p-3 text-sm text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="identifier">Username or Email</Label>
              <Input
                id="identifier"
                type="text"
                required
                placeholder="author_jane or jane@openmind.org"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative flex items-center">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                style={{ width: '100%', paddingRight: '40px' }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </Button>
            </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>

            <p className="text-center text-xs text-slate-500 dark:text-slate-400">
              Don&apos;t have an account?{' '}
              <Link to="/signup" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
