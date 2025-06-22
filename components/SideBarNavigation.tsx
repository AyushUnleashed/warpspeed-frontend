'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Package, FolderOpen, MessageCircle, Menu, X } from 'lucide-react'
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
    { 
      name: 'Products', 
      href: '/dashboard/products', 
      icon: <Package className="w-5 h-5 mr-3" />,
      description: 'Manage your products'
    },
    { 
      name: 'Projects', 
      href: '/dashboard/projects', 
      icon: <FolderOpen className="w-5 h-5 mr-3" />,
      description: 'View AI-generated projects'
    },
    { 
      name: 'AI Chat', 
      href: '/dashboard/ai-chat', 
      icon: <MessageCircle className="w-5 h-5 mr-3" />,
      description: 'Edit images with AI'
    },
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
      <div className="mb-8">
        <Link href="/dashboard/products" className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mr-3">
            <Package className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            PhotoAI
          </span>
        </Link>
        <p className="text-sm text-gray-500 mt-1 ml-11">Product Photography</p>
      </div>
      
      {/* Primary Navigation Links */}
      <div className="space-y-2">
        {navItems.map((item) => {
          // Check if current path matches this nav item
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              onClick={handleNavigation}
              className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? 'bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-purple-500 text-purple-700 font-medium shadow-sm' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <div className={`transition-colors ${
                isActive ? 'text-purple-600' : 'text-gray-500 group-hover:text-gray-700'
              }`}>
                {item.icon}
              </div>
              <div className="flex-1">
                <div className="font-medium">{item.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
              </div>
              {isActive && (
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              )}
            </Link>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-6 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          <p>AI-Powered Product Photography</p>
          <p className="mt-1">© 2024 PhotoAI</p>
        </div>
      </div>
    </>
  )

  // If not mounted or still loading, return a loading placeholder
  if (!isMounted || isLoading) {
    return (
      <div className="hidden md:flex h-screen flex-col bg-white w-64 p-4 border-r border-gray-200 shadow-sm">
        <div className="flex items-center h-10 mb-6">
          <div className="h-7 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:flex h-screen flex-col bg-white w-64 p-4 border-r border-gray-200 shadow-sm">
        <NavigationContent />
      </div>

      {/* Mobile Header with Menu Button */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white z-30 border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <Link href="/dashboard/products" className="flex items-center">
            <div className="w-6 h-6 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mr-2">
              <Package className="h-3 w-3 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              PhotoAI
            </span>
          </Link>

          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex flex-col h-full bg-white p-4">
                <NavigationContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      {/* Mobile spacing adjustment */}
      <div className="md:hidden h-16"></div>
    </>
  )
}