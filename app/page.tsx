"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Calendar, User, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"

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
    if (!searchTerm) return true
    return (
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.author.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Blog</h1>
            <Link href="/admin">
              <Button variant="outline" size="sm">
                Admin
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="py-12 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Our Blog</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover amazing stories, insights, and ideas from our community.
          </p>

          <div className="max-w-md mx-auto relative mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </section>

      <section className="py-8 px-4">
        <div className="container mx-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading blogs...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 text-lg mb-4">Error: {error}</p>
              <Button onClick={fetchBlogs} variant="outline">
                Try Again
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBlogs.map((blog) => (
                <Card key={blog._id} className="hover:shadow-lg transition-shadow">
                  <div className="aspect-video overflow-hidden rounded-t-lg">
                    <img
                      src={blog.image || "/placeholder.svg?height=200&width=400&query=blog post"}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(blog.date).toLocaleDateString()}
                      <span className="mx-2">•</span>
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs">{blog.category}</span>
                    </div>

                    <h3 className="font-semibold text-lg mb-2 text-gray-900">{blog.title}</h3>

                    <p className="text-gray-600 mb-4 line-clamp-3">{blog.excerpt}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="h-4 w-4 mr-1" />
                        <span>{blog.author}</span>
                        <span className="mx-2">•</span>
                        <span>{blog.readTime}</span>
                      </div>
                      <Link href={`/blog/${blog._id}`}>
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                          Read More
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && !error && filteredBlogs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                {searchTerm ? `No articles found for "${searchTerm}"` : "No articles found."}
              </p>
            </div>
          )}
        </div>
      </section>

      <footer className="bg-gray-50 py-8 px-4 mt-16">
        <div className="container mx-auto text-center">
          <p className="text-gray-600">© 2024 Blog. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
