"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Edit, Trash2, LogOut, Save, X, Loader2, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import RichTextEditor from "@/components/rich-text-editor"

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
        author: "Admin",
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
        const response = await fetch("/api/blogs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(blogData),
        })

        if (!response.ok) throw new Error("Failed to create blog")

        toast({
          title: "Blog published",
          description: "Your new blog post has been published.",
        })
        setIsCreating(false)
      }

      setFormData({
        title: "",
        excerpt: "",
        content: "",
        category: "",
        image: "",
      })
      await fetchBlogs()
      onBlogUpdate()
    } catch (error) {
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
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      category: "",
      image: "",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Site
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => setIsCreating(true)} className="bg-blue-600 hover:bg-blue-700">
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
              <CardTitle>{editingId ? "Edit Blog Post" : "Create New Blog Post"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
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
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                  <RichTextEditor
                    value={formData.content}
                    onChange={(content) => setFormData({ ...formData, content })}
                    placeholder="Write your blog content here..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Featured Image URL (optional)</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="Enter featured image URL"
                  />
                </div>

                <div className="flex space-x-2">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={submitting}>
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
          <h2 className="text-xl font-semibold">Your Blog Posts ({blogs.length})</h2>

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : blogs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">No blog posts yet. Create your first post!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {blogs.map((blog) => (
                <Card key={blog._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-24 h-16 flex-shrink-0">
                        <img
                          src={blog.image || "/placeholder.svg"}
                          alt={blog.title}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{blog.title}</h3>
                        <p className="text-gray-600 text-sm mb-2">{blog.excerpt}</p>
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            {blog.category} • {new Date(blog.date).toLocaleDateString()}
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(blog)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(blog._id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
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
