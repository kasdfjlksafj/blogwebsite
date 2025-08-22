"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Calendar, User, ArrowRight, PenTool, Loader2 } from "lucide-react"
import { AdminLogin } from "@/components/admin-login"
import { AdminDashboard } from "@/components/admin-dashboard"

interface Blog {
  _id: string
  title: string
  excerpt: string
  content: string
  author: string
  date: string
  category: string
  readTime: string
  image: string
}

export default function BlogHomepage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const categories = ["All", "Technology", "Design", "Development", "Business", "Lifestyle"]

  const fetchBlogs = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/blogs")
      if (!response.ok) {
        throw new Error("Failed to fetch blogs")
      }
      const data = await response.json()
      setBlogs(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      console.error("Error fetching blogs:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogs()
  }, [])

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || blog.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (isAdminMode && !isLoggedIn) {
    return <AdminLogin onLogin={() => setIsLoggedIn(true)} onBack={() => setIsAdminMode(false)} />
  }

  if (isAdminMode && isLoggedIn) {
    return (
      <AdminDashboard
        onLogout={() => {
          setIsLoggedIn(false)
          setIsAdminMode(false)
        }}
        onBlogUpdate={fetchBlogs}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <PenTool className="h-8 w-8 text-accent" />
              <h1 className="text-2xl font-bold font-heading text-foreground">BlogSpace</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-foreground hover:text-accent transition-colors">
                Home
              </a>
              <a href="#" className="text-foreground hover:text-accent transition-colors">
                Categories
              </a>
              <a href="#" className="text-foreground hover:text-accent transition-colors">
                About
              </a>
              <Button variant="outline" size="sm" onClick={() => setIsAdminMode(true)}>
                Admin
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold font-heading text-foreground mb-6">
            Share Your <span className="text-accent">Stories</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover amazing stories, insights, and ideas from our community of writers and thinkers.
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto relative mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 px-4">
        <div className="container mx-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
              <span className="ml-2 text-muted-foreground">Loading blogs...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive text-lg mb-4">Error: {error}</p>
              <Button onClick={fetchBlogs} variant="outline">
                Try Again
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBlogs.map((blog) => (
                <Card key={blog._id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={blog.image || "/placeholder.svg"}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">{blog.category}</Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(blog.date).toLocaleDateString()}
                      </div>
                    </div>
                    <CardTitle className="font-heading group-hover:text-accent transition-colors">
                      {blog.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 line-clamp-3">{blog.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="h-4 w-4 mr-1" />
                        {blog.author} • {blog.readTime}
                      </div>
                      <Button variant="ghost" size="sm" className="group/btn">
                        Read More
                        <ArrowRight className="h-4 w-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && !error && filteredBlogs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No articles found matching your search.</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12 px-4 mt-16">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <PenTool className="h-6 w-6 text-accent" />
            <h3 className="text-xl font-bold font-heading">BlogSpace</h3>
          </div>
          <p className="text-muted-foreground mb-4">A modern platform for sharing stories and ideas.</p>
          <p className="text-sm text-muted-foreground">© 2024 BlogSpace. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
