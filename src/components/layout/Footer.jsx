export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-sm">© {new Date().getFullYear()} E-Bike Rentals. Built for delivery drivers.</p>
      </div>
    </footer>
  )
}
