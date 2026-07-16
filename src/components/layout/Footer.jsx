export default function Footer() {
  return (
    <footer className="bg-volt-bg border-t border-volt-line text-volt-faint py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 flex-wrap">
        <span className="flex items-center gap-2 font-display font-bold text-volt-text">
          <span className="w-6 h-6 rounded-md bg-accent text-volt-bg grid place-items-center text-sm">⚡</span>
          VOLTBIKE
        </span>
        <p className="text-sm">© {new Date().getFullYear()} VoltBike. Built for delivery drivers.</p>
      </div>
    </footer>
  )
}
