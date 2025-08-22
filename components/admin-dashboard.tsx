"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Edit, Trash2, LogOut, Calendar, User, Save, X, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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

interface AdminDashboardProps {
  onLogout: () => void
  onBlogUpdate: () => void
}

export function AdminDashboard({ onLogout, onBlogUpdate }: AdminDashboardProps) {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    image: "",
  })
  const { toast } = useToast()

  const categories = ["Technology", "Design", "Development", "Business", "Lifestyle"]

  const fetchBlogs = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/blogs")
      if (!response.ok) throw new Error("Failed to fetch blogs")
      const data = await response.json()
      setBlogs(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch blogs",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogs()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const blogData = {
        ...formData,
        author: "Admin", // Set default author as Admin
      }

      if (editingId) {
        const response = await fetch(`/api/blogs/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(blogData),
        })

        if (!response.ok) throw new Error("Failed to update blog")

        toast({
          title: "Blog updated",
          description: "Your blog post has been updated successfully.",
        })
        setEditingId(null)
      } else {
        console.log("[v0] Sending blog data:", blogData)

        const response = await fetch("/api/blogs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(blogData),
        })

        console.log("[v0] API response status:", response.status)
        const responseData = await response.json()
        console.log("[v0] API response data:", responseData)

        if (!response.ok) throw new Error(`Failed to create blog: ${responseData.error || "Unknown error"}`)

        toast({
          title: "Blog created",
          description: "Your new blog post has been published.",
        })
        setIsCreating(false)
      }

      setFormData({ title: "", excerpt: "", content: "", category: "", image: "" })
      await fetchBlogs()
      onBlogUpdate()
    } catch (error) {
      console.log("[v0] Error creating blog:", error)
      toast({
        title: "Error",
        description: editingId ? "Failed to update blog" : "Failed to create blog",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (blog: Blog) => {
    setFormData({
      title: blog.title,
      excerpt: blog.excerpt,
      content: blog.content,
      category: blog.category,
      image: blog.image,
    })
    setEditingId(blog._id)
    setIsCreating(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/blogs/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete blog")

      toast({
        title: "Blog deleted",
        description: "The blog post has been removed.",
      })

      await fetchBlogs()
      onBlogUpdate()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete blog",
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    setIsCreating(false)
    setEditingId(null)
    setFormData({ title: "", excerpt: "", content: "", category: "", image: "" })
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold font-heading">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <Button onClick={() => setIsCreating(true)} className="bg-accent hover:bg-accent/90">
                <PlusCircle className="h-4 w-4 mr-2" />
                New Post
              </Button>
              <Button variant="outline" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {isCreating && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="font-heading">{editingId ? "Edit Blog Post" : "Create New Blog Post"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter blog title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    placeholder="Brief description of the blog post"
                    rows={3}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Write your blog content here..."
                    rows={8}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Image URL (optional)</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="Enter image URL or leave blank for auto-generated"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" className="bg-accent hover:bg-accent/90" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {editingId ? "Updating..." : "Publishing..."}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {editingId ? "Update Post" : "Publish Post"}
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          <h2 className="text-xl font-semibold font-heading">Manage Posts ({blogs.length})</h2>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
              <span className="ml-2 text-muted-foreground">Loading blogs...</span>
            </div>
          ) : blogs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No blog posts yet. Create your first post!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {blogs.map((blog) => (
                <Card key={blog._id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="md:w-32 md:h-20 w-full h-32 flex-shrink-0">
                        <img
                          src={blog.image || "/placeholder.svg"}
                          alt={blog.title}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold font-heading text-lg mb-1">{blog.title}</h3>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {new Date(blog.date).toLocaleDateString()}
                              </div>
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-1" />
                                {blog.author}
                              </div>
                              <Badge variant="secondary">{blog.category}</Badge>
                              <span className="text-xs">{blog.readTime}</span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(blog)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(blog._id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-muted-foreground line-clamp-2">{blog.excerpt}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
