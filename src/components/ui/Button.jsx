const variants = {
  primary: 'bg-accent text-volt-bg hover:bg-accent-600 font-display font-bold',
  secondary: 'border border-volt-outline text-volt-text hover:bg-volt-surface',
  danger: 'bg-[#e5484d] text-white hover:bg-[#d13b40]',
  ghost: 'text-volt-muted hover:bg-volt-surface',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg font-medium
        focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-volt-bg
        transition-colors duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
