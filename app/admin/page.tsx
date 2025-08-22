"use client"

import { useState } from "react"
import { AdminLogin } from "@/components/admin-login"
import { AdminDashboard } from "@/components/admin-dashboard"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const fetchBlogs = async () => {
    // This function will be passed to AdminDashboard for blog updates
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Link href="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <AdminLogin onLogin={() => setIsLoggedIn(true)} onBack={() => {}} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminDashboard onLogout={() => setIsLoggedIn(false)} onBlogUpdate={fetchBlogs} />
    </div>
  )
}
