// app/dashboard/layout.tsx
import SidebarNavigation from '@/components/SidebarNavigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <SidebarNavigation />
      
      <main className="flex-1 overflow-y-auto relative mt-12">
        <div className="absolute inset-0 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  )
}