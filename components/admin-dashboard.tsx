"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  PlusCircle,
  Edit,
  Trash2,
  LogOut,
  Calendar,
  User,
  Save,
  X,
  Loader2,
  ArrowLeft,
  Search,
  Eye,
  FileText,
  Clock,
  CheckCircle,
  Tag,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import RichTextEditor from "@/components/rich-text-editor"
import AnimatedCounter from "@/components/animated-counter"
import LoadingSkeleton from "@/components/loading-skeleton"

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
  status?: "published" | "draft"
  views?: number
  seoTitle?: string
  seoDescription?: string
  tags?: string[]
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
  const [selectedBlogs, setSelectedBlogs] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    image: "",
    status: "published" as "published" | "draft",
    seoTitle: "",
    seoDescription: "",
    tags: [] as string[],
  })
  const { toast } = useToast()

  const categories = ["Technology", "Design", "Development", "Business", "Lifestyle"]

  const fetchBlogs = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/blogs")
      if (!response.ok) throw new Error("Failed to fetch blogs")
      const data = await response.json()
      setBlogs(
        data.map((blog: Blog) => ({
          ...blog,
          status: blog.status || "published",
          views: blog.views || Math.floor(Math.random() * 1000),
          tags: blog.tags || [],
        })),
      )
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

  const filteredAndSortedBlogs = useMemo(() => {
    const filtered = blogs.filter((blog) => {
      const matchesSearch =
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.author.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || blog.status === statusFilter
      const matchesCategory = categoryFilter === "all" || blog.category === categoryFilter
      return matchesSearch && matchesStatus && matchesCategory
    })

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case "title":
          return a.title.localeCompare(b.title)
        case "views":
          return (b.views || 0) - (a.views || 0)
        case "status":
          return a.status.localeCompare(b.status)
        default:
          return 0
      }
    })

    return filtered
  }, [blogs, searchTerm, statusFilter, categoryFilter, sortBy])

  const analytics = useMemo(() => {
    const totalPosts = blogs.length
    const publishedPosts = blogs.filter((blog) => blog.status === "published").length
    const draftPosts = blogs.filter((blog) => blog.status === "draft").length
    const totalViews = blogs.reduce((sum, blog) => sum + (blog.views || 0), 0)
    const avgViews = totalPosts > 0 ? Math.round(totalViews / totalPosts) : 0

    return { totalPosts, publishedPosts, draftPosts, totalViews, avgViews }
  }, [blogs])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const blogData = {
        ...formData,
        author: "Admin",
        tags: formData.tags.filter((tag) => tag.trim() !== ""),
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
          title: formData.status === "draft" ? "Draft saved" : "Blog published",
          description:
            formData.status === "draft" ? "Your draft has been saved." : "Your new blog post has been published.",
        })
        setIsCreating(false)
      }

      setFormData({
        title: "",
        excerpt: "",
        content: "",
        category: "",
        image: "",
        status: "published",
        seoTitle: "",
        seoDescription: "",
        tags: [],
      })
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
      status: blog.status || "published",
      seoTitle: blog.seoTitle || "",
      seoDescription: blog.seoDescription || "",
      tags: blog.tags || [],
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

  const handleBulkDelete = async () => {
    if (selectedBlogs.length === 0) return

    try {
      await Promise.all(selectedBlogs.map((id) => fetch(`/api/blogs/${id}`, { method: "DELETE" })))

      toast({
        title: "Blogs deleted",
        description: `${selectedBlogs.length} blog posts have been removed.`,
      })

      setSelectedBlogs([])
      await fetchBlogs()
      onBlogUpdate()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete selected blogs",
        variant: "destructive",
      })
    }
  }

  const handleBulkStatusChange = async (newStatus: "published" | "draft") => {
    if (selectedBlogs.length === 0) return

    try {
      await Promise.all(
        selectedBlogs.map((id) => {
          const blog = blogs.find((b) => b._id === id)
          if (!blog) return Promise.resolve()

          return fetch(`/api/blogs/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...blog, status: newStatus }),
          })
        }),
      )

      toast({
        title: "Status updated",
        description: `${selectedBlogs.length} blog posts have been ${newStatus === "published" ? "published" : "saved as drafts"}.`,
      })

      setSelectedBlogs([])
      await fetchBlogs()
      onBlogUpdate()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update blog status",
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
      status: "published",
      seoTitle: "",
      seoDescription: "",
      tags: [],
    })
  }

  const handleAddTag = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tag.trim()] })
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((tag) => tag !== tagToRemove) })
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Site
                </Button>
              </Link>
              <h1 className="text-2xl font-bold font-heading">Admin Dashboard</h1>
            </div>
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
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="posts">Manage Posts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    <AnimatedCounter end={analytics.totalPosts} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Published</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    <AnimatedCounter end={analytics.publishedPosts} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Drafts</CardTitle>
                  <Clock className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    <AnimatedCounter end={analytics.draftPosts} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    <AnimatedCounter end={analytics.totalViews} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {isCreating && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="font-heading">
                    {editingId ? "Edit Blog Post" : "Create New Blog Post"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <Tabs defaultValue="content" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="content">Content</TabsTrigger>
                        <TabsTrigger value="seo">SEO & Meta</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                      </TabsList>

                      <TabsContent value="content" className="space-y-6 mt-6">
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
                            placeholder="Write your blog content here... Use the toolbar to format text, add headings, images, and links."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="image">Featured Image URL (optional)</Label>
                          <Input
                            id="image"
                            value={formData.image}
                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                            placeholder="Enter featured image URL or leave blank for auto-generated"
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="seo" className="space-y-6 mt-6">
                        <div className="space-y-2">
                          <Label htmlFor="seoTitle">SEO Title</Label>
                          <Input
                            id="seoTitle"
                            value={formData.seoTitle}
                            onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                            placeholder="SEO optimized title (leave blank to use main title)"
                          />
                          <p className="text-xs text-muted-foreground">{formData.seoTitle.length}/60 characters</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="seoDescription">SEO Description</Label>
                          <Textarea
                            id="seoDescription"
                            value={formData.seoDescription}
                            onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                            placeholder="SEO meta description (leave blank to use excerpt)"
                            rows={3}
                          />
                          <p className="text-xs text-muted-foreground">
                            {formData.seoDescription.length}/160 characters
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label>Tags</Label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {formData.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="gap-1">
                                {tag}
                                <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
                              </Badge>
                            ))}
                          </div>
                          <Input
                            placeholder="Add tags (press Enter)"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                handleAddTag(e.currentTarget.value)
                                e.currentTarget.value = ""
                              }
                            }}
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="settings" className="space-y-6 mt-6">
                        <div className="space-y-2">
                          <Label>Publication Status</Label>
                          <Select
                            value={formData.status}
                            onValueChange={(value: "published" | "draft") =>
                              setFormData({ ...formData, status: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="published">Published</SelectItem>
                              <SelectItem value="draft">Draft</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TabsContent>
                    </Tabs>

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
                            {editingId ? "Update Post" : formData.status === "draft" ? "Save Draft" : "Publish Post"}
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
          </TabsContent>

          <TabsContent value="posts" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-1 gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Drafts</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="views">Views</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedBlogs.length > 0 && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleBulkStatusChange("published")}>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Publish ({selectedBlogs.length})
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkStatusChange("draft")}>
                    <Clock className="h-4 w-4 mr-1" />
                    Draft ({selectedBlogs.length})
                  </Button>
                  <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete ({selectedBlogs.length})
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold font-heading">Manage Posts ({filteredAndSortedBlogs.length})</h2>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={
                      selectedBlogs.length === filteredAndSortedBlogs.length && filteredAndSortedBlogs.length > 0
                    }
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedBlogs(filteredAndSortedBlogs.map((blog) => blog._id))
                      } else {
                        setSelectedBlogs([])
                      }
                    }}
                  />
                  <span className="text-sm text-muted-foreground">Select All</span>
                </div>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <LoadingSkeleton key={i} variant="card" className="h-32" />
                  ))}
                </div>
              ) : filteredAndSortedBlogs.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No blog posts found matching your criteria.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {filteredAndSortedBlogs.map((blog) => (
                    <Card key={blog._id} className="card-hover">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Checkbox
                            checked={selectedBlogs.includes(blog._id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedBlogs([...selectedBlogs, blog._id])
                              } else {
                                setSelectedBlogs(selectedBlogs.filter((id) => id !== blog._id))
                              }
                            }}
                          />
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
                                  <div className="flex items-center">
                                    <Eye className="h-4 w-4 mr-1" />
                                    {blog.views || 0} views
                                  </div>
                                  <Badge variant="secondary">{blog.category}</Badge>
                                  <Badge variant={blog.status === "published" ? "default" : "outline"}>
                                    {blog.status === "published" ? (
                                      <>
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Published
                                      </>
                                    ) : (
                                      <>
                                        <Clock className="h-3 w-3 mr-1" />
                                        Draft
                                      </>
                                    )}
                                  </Badge>
                                  <span className="text-xs">{blog.readTime}</span>
                                </div>
                                {blog.tags && blog.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {blog.tags.map((tag, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        <Tag className="h-2 w-2 mr-1" />
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="flex space-x-2">
                                <Link href={`/blog/${blog._id}`} target="_blank">
                                  <Button size="sm" variant="outline">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
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
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Most Viewed Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {blogs
                      .sort((a, b) => (b.views || 0) - (a.views || 0))
                      .slice(0, 5)
                      .map((blog, index) => (
                        <div key={blog._id} className="flex items-center justify-between text-sm">
                          <span className="truncate flex-1 mr-2">{blog.title}</span>
                          <span className="text-muted-foreground">{blog.views || 0}</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Posts by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categories.map((category) => {
                      const count = blogs.filter((blog) => blog.category === category).length
                      return (
                        <div key={category} className="flex items-center justify-between text-sm">
                          <span>{category}</span>
                          <span className="text-muted-foreground">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {blogs
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 5)
                      .map((blog) => (
                        <div key={blog._id} className="text-sm">
                          <div className="font-medium truncate">{blog.title}</div>
                          <div className="text-muted-foreground text-xs">
                            {new Date(blog.date).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
