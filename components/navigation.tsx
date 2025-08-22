"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PenTool, Menu, X, Home, Grid, Info, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface NavigationProps {
  showAdminButton?: boolean
}

export function Navigation({ showAdminButton = true }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/categories", label: "Categories", icon: Grid },
    { href: "/about", label: "About", icon: Info },
  ]

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "glass-effect shadow-lg"
          : "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      } border-b border-border`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <PenTool
              className={`h-8 w-8 text-accent transition-all duration-300 ${
                isScrolled ? "floating" : ""
              } group-hover:scale-110`}
            />
            <h1 className="text-2xl font-bold font-heading text-foreground gradient-text">BlogSpace</h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-1 transition-all duration-300 hover:scale-105 ${
                  isActive(item.href) ? "text-accent font-medium" : "text-foreground hover:text-accent"
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
            {showAdminButton && (
              <Link href="/admin">
                <Button variant="outline" size="sm" className="btn-hover-lift bg-transparent">
                  <Settings className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="transition-transform duration-200 hover:scale-110"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border fade-in">
            <nav className="flex flex-col space-y-2 pt-4 stagger-children">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-2 py-2 rounded-md transition-all duration-300 ${
                    isActive(item.href)
                      ? "text-accent bg-accent/10 font-medium"
                      : "text-foreground hover:text-accent hover:bg-accent/5"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
              {showAdminButton && (
                <Link
                  href="/admin"
                  className="flex items-center space-x-2 px-2 py-2 rounded-md text-foreground hover:text-accent hover:bg-accent/5 transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  <span>Admin</span>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navigation
