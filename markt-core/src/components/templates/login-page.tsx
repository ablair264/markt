import { useState, type ReactNode } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export interface LoginPageTemplateProps {
  /** Called when the user submits the form. Wire this to your auth provider. */
  onLogin: (credentials: { username: string; password: string }) => Promise<void>
  /** Optional logo element rendered above the subtitle. */
  logo?: ReactNode
  /** Subtitle text below the logo. */
  subtitle?: string
  /** Label for the first input field. */
  usernameLabel?: string
  /** Placeholder for the first input field. */
  usernamePlaceholder?: string
  /** Label for the password field. */
  passwordLabel?: string
  /** Placeholder for the password field. */
  passwordPlaceholder?: string
  /** Submit button label. */
  submitLabel?: string
  /** Loading state label shown while onLogin is in-flight. */
  loadingLabel?: string
  /** Optional footer content below the form (e.g. "Forgot password?" link). */
  helpText?: ReactNode
}

export function LoginPageTemplate({
  onLogin,
  logo,
  subtitle = 'Access your dashboard',
  usernameLabel = 'Username',
  usernamePlaceholder = 'Enter your username',
  passwordLabel = 'Password',
  passwordPlaceholder = 'Enter your password',
  submitLabel = 'Sign In',
  loadingLabel = 'Signing In...',
  helpText,
}: LoginPageTemplateProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await onLogin({ username: username.trim(), password })
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Invalid credentials. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-template relative flex min-h-dvh items-center justify-center overflow-hidden bg-gradient-to-br from-[#0f1419] via-[#1a1f2a] to-[#2c3e50] p-4 font-sans">
      {/* Animated gradient background */}
      <div className="absolute inset-0 animate-[gradient-shift_12s_ease_infinite] bg-[linear-gradient(45deg,rgba(15,20,25,0.9)_0%,rgba(121,213,233,0.15)_20%,rgba(26,31,42,0.95)_40%,rgba(77,174,172,0.1)_60%,rgba(44,62,80,0.9)_80%,rgba(121,213,233,0.1)_100%)] bg-[length:300%_300%]" />

      {/* Radial overlay for depth */}
      <div className="pointer-events-none absolute inset-0 z-[1] animate-[gradient-pulse_8s_ease-in-out_infinite] bg-[radial-gradient(ellipse_at_30%_40%,rgba(121,213,233,0.12)_0%,transparent_40%),radial-gradient(ellipse_at_70%_60%,rgba(77,174,172,0.08)_0%,transparent_50%)]" />

      {/* Floating accent blob */}
      <div className="pointer-events-none absolute right-[15%] top-[20%] z-[3] h-[clamp(200px,30vw,300px)] w-[clamp(200px,30vw,300px)] animate-[gentle-float_6s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle,rgba(121,213,233,0.1)_0%,rgba(121,213,233,0.05)_50%,transparent_100%)] blur-[40px] max-sm:hidden" />

      {/* Login card */}
      <div className="relative z-10 w-full max-w-[400px] md:max-w-[440px] lg:max-w-[480px]">
        <div className="rounded-2xl border-2 border-primary/20 bg-[rgba(26,31,42,0.95)] p-8 shadow-[0_25px_50px_rgba(0,0,0,0.5),0_0_40px_rgba(121,213,233,0.1)] backdrop-blur-xl transition-shadow duration-300 hover:shadow-[0_25px_50px_rgba(0,0,0,0.5),0_0_60px_rgba(121,213,233,0.15)] lg:p-10">
          {/* Header */}
          <div className="mb-8 text-center">
            {logo && <div className="mb-4 flex items-center justify-center">{logo}</div>}
            <p className="text-sm font-medium text-muted-foreground opacity-90">{subtitle}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-1">
            {error && (
              <div className="mb-4 flex animate-[error-slide-in_0.3s_ease-out] items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-medium text-red-400 backdrop-blur-sm">
                <span className="shrink-0 text-xl">&#9888;&#65039;</span>
                <span>{error}</span>
              </div>
            )}

            <div className="mb-4 flex flex-col gap-2">
              <label htmlFor="login-username" className="pl-1 text-xs font-semibold text-white">
                {usernameLabel}
              </label>
              <input
                id="login-username"
                type="text"
                placeholder={usernamePlaceholder}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="min-h-[48px] w-full rounded-xl border-2 border-transparent bg-input px-5 py-3 text-sm font-medium text-foreground shadow-md outline-none transition-all duration-300 placeholder:text-muted-foreground focus:border-primary focus:bg-muted focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:bg-muted/50 disabled:text-muted-foreground md:text-base"
                required
                disabled={loading}
                autoComplete="username"
              />
            </div>

            <div className="mb-4 flex flex-col gap-2">
              <label htmlFor="login-password" className="pl-1 text-xs font-semibold text-white">
                {passwordLabel}
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={passwordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="min-h-[48px] w-full rounded-xl border-2 border-transparent bg-input px-5 py-3 pr-12 text-sm font-medium text-foreground shadow-md outline-none transition-all duration-300 placeholder:text-muted-foreground focus:border-primary focus:bg-muted focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:bg-muted/50 disabled:text-muted-foreground md:text-base"
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground transition-colors hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border-none bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-[0_8px_25px_rgba(121,213,233,0.15)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_15px_35px_rgba(121,213,233,0.25)] focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 active:-translate-y-px disabled:cursor-not-allowed disabled:opacity-80 disabled:hover:translate-y-0"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  <span>{loadingLabel}</span>
                </>
              ) : (
                <>
                  <span>{submitLabel}</span>
                  <svg
                    className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          {helpText && (
            <div className="mt-6 text-center">
              <p className="text-xs leading-relaxed text-muted-foreground">{helpText}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
