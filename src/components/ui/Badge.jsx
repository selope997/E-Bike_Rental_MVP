const variants = {
  green: 'bg-accent/15 text-accent',
  blue: 'bg-[#7fb0ff]/15 text-[#7fb0ff]',
  yellow: 'bg-[#ffcf66]/15 text-[#ffcf66]',
  red: 'bg-[#e5484d]/15 text-[#ff8079]',
  gray: 'bg-white/10 text-volt-muted',
}

export default function Badge({ children, variant = 'gray', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

export function statusBadge(status) {
  const map = {
    available: { label: 'Available', variant: 'green' },
    rented: { label: 'Rented', variant: 'blue' },
    maintenance: { label: 'Maintenance', variant: 'yellow' },
    active: { label: 'Active', variant: 'green' },
    completed: { label: 'Completed', variant: 'gray' },
    cancelled: { label: 'Cancelled', variant: 'red' },
    past_due: { label: 'Past Due', variant: 'red' },
    canceled: { label: 'Canceled', variant: 'red' },
  }
  return map[status] || { label: status, variant: 'gray' }
}
