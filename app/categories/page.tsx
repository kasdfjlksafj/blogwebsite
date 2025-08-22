"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { Loader2, Grid } from "lucide-react"
import Link from "next/link"

interface Blog {
  _id: string
  title: string
  excerpt: string
  category: string
  date: string
  author: string
}

export default function CategoriesPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<{ [key: string]: Blog[] }>({})

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch("/api/blogs")
        if (!response.ok) throw new Error("Failed to fetch blogs")
        const data = await response.json()
        setBlogs(data)

        // Group blogs by category
        const grouped = data.reduce((acc: { [key: string]: Blog[] }, blog: Blog) => {
          if (!acc[blog.category]) {
            acc[blog.category] = []
          }
          acc[blog.category].push(blog)
          return acc
        }, {})

        setCategories(grouped)
      } catch (error) {
        console.error("Error fetching blogs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBlogs()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-heading text-foreground mb-4">
            Browse by <span className="text-accent">Categories</span>
          </h1>
          <p className="text-xl text-muted-foreground">Explore articles organized by topics and interests</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <span className="ml-2 text-muted-foreground">Loading categories...</span>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(categories).map(([category, categoryBlogs]) => (
              <Card key={category} className="overflow-hidden">
                <CardHeader className="bg-muted/30">
                  <CardTitle className="flex items-center gap-2">
                    <Grid className="h-5 w-5 text-accent" />
                    {category}
                    <Badge variant="secondary">{categoryBlogs.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryBlogs.slice(0, 6).map((blog) => (
                      <Link key={blog._id} href={`/blog/${blog._id}`}>
                        <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{blog.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{blog.excerpt}</p>
                            <div className="text-xs text-muted-foreground">
                              By {blog.author} • {new Date(blog.date).toLocaleDateString()}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                  {categoryBlogs.length > 6 && (
                    <div className="mt-4 text-center">
                      <Link href={`/?category=${category}`}>
                        <Badge variant="outline" className="cursor-pointer hover:bg-accent/10">
                          View all {categoryBlogs.length} articles
                        </Badge>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
