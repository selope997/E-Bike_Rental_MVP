const variants = {
  green: 'bg-green-100 text-green-800',
  red: 'bg-red-100 text-red-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  blue: 'bg-blue-100 text-blue-800',
  gray: 'bg-gray-100 text-gray-800',
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
