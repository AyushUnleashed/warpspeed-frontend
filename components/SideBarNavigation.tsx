'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Video, Package, CreditCard, ArrowUpRight, Coins, Menu, X, Gift, UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger
} from '@/components/ui/sheet'

export default function SidebarNavigation() {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Navigation items mapping to dashboard routes
  const navItems = [
    { name: 'Products', href: '/dashboard/products', icon: <Home className="w-5 h-5 mr-3" /> },
    { name: 'My Designs', href: '/dashboard/projects', icon: <Home className="w-5 h-5 mr-3" /> },
  ]

  // Use effect for client-side mounting detection
  useEffect(() => {
    setIsMounted(true)
    // Add a small delay to ensure smoother rendering
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

  // Close mobile menu when navigating
  const handleNavigation = () => {
    setIsMobileOpen(false)
  }

  // Navigation content - shared between desktop and mobile
  const NavigationContent = () => (
    <>
      {/* Logo and Brand */}
      <div className="mb-6">
        <Link href="/" className="flex items-center">
          <img src="/reels-ai-pro-logo.svg" alt="ReelsAI.pro" className="h-7 mr-2" />
          <span className="text-xl font-bold">ReelsAI.pro</span>
        </Link>
      </div>
      
      {/* Primary Navigation Links */}
      <div className="space-y-1.5">
        {navItems.map((item) => {
          // Check if current path matches this nav item
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          const isGenerateVideo = item.name === 'Generate Video'
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              onClick={handleNavigation}
              className={`flex items-center px-3 py-2.5 rounded-md transition-colors ${
                isGenerateVideo
                  ? 'bg-primary text-white hover:bg-orange-600' // Generate Video in orange
                  : isActive 
                  ? 'border-l-4 border-primary bg-primary/10 text-primary font-medium' // New active style
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              {item.icon}
              {item.name}
              {isActive && !isGenerateVideo && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"></span>}
            </Link>
          )
        })}
      </div>

    </>
  )

  // If not mounted or still loading, return a loading placeholder
  if (!isMounted || isLoading) {
    return (
      <div className="hidden md:flex h-screen flex-col bg-gray-100 w-64 p-4 border-r">
        <div className="flex items-center h-10 mb-6">
          <div className="h-7 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:flex h-screen flex-col bg-gray-100 w-64 p-4 border-r">
        <NavigationContent />
      </div>

      {/* Mobile Header with Menu Button */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white z-30 border-b shadow-sm">
        <div className="flex items-center justify-between p-3">
          <Link href="/" className="flex items-center">
            <img src="/reels-ai-pro-logo.svg" alt="ReelsAI.pro" className="h-6 mr-2" />
            <span className="text-lg font-bold">ReelsAI.pro</span>
          </Link>

          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex flex-col h-full bg-gray-100 p-8 pt-6">
                <NavigationContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      {/* Mobile padding to account for fixed header */}
      <div className="md:hidden h-14"></div>

      {/* Adjust margin to ensure content is not covered by the header */}
      <div className="md:hidden mt-16"></div>
    </>
  )
}