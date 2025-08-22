"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Calendar, User, ArrowRight, PenTool, Loader2, Filter, X } from "lucide-react"
import Navigation from "@/components/navigation"
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
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedAuthor, setSelectedAuthor] = useState("All")
  const [sortBy, setSortBy] = useState("newest")
  const [showFilters, setShowFilters] = useState(false)

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(blogs.map((blog) => blog.category)))
    return ["All", ...uniqueCategories.sort()]
  }, [blogs])

  const authors = useMemo(() => {
    const uniqueAuthors = Array.from(new Set(blogs.map((blog) => blog.author)))
    return ["All", ...uniqueAuthors.sort()]
  }, [blogs])

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

  const filteredAndSortedBlogs = useMemo(() => {
    const filtered = blogs.filter((blog) => {
      const matchesSearch =
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.author.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "All" || blog.category === selectedCategory
      const matchesAuthor = selectedAuthor === "All" || blog.author === selectedAuthor
      return matchesSearch && matchesCategory && matchesAuthor
    })

    // Sort blogs
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case "oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case "title":
          return a.title.localeCompare(b.title)
        case "author":
          return a.author.localeCompare(b.author)
        default:
          return 0
      }
    })

    return filtered
  }, [blogs, searchTerm, selectedCategory, selectedAuthor, sortBy])

  const clearAllFilters = () => {
    setSearchTerm("")
    setSelectedCategory("All")
    setSelectedAuthor("All")
    setSortBy("newest")
  }

  const hasActiveFilters = searchTerm || selectedCategory !== "All" || selectedAuthor !== "All" || sortBy !== "newest"

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold font-heading text-foreground mb-6">
            Share Your{" "}
            <span className="text-accent bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">
              Stories
            </span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Discover amazing stories, insights, and ideas from our community of writers and thinkers.
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto relative mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search articles, authors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Filter Toggle for Mobile */}
          <div className="md:hidden mb-4">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              Filters{" "}
              {hasActiveFilters &&
                `(${[searchTerm, selectedCategory !== "All" ? selectedCategory : "", selectedAuthor !== "All" ? selectedAuthor : ""].filter(Boolean).length})`}
            </Button>
          </div>

          {/* Filters */}
          <div className={`${showFilters ? "block" : "hidden"} md:block space-y-4 md:space-y-0`}>
            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="transition-all duration-200"
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Advanced Filters */}
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-muted-foreground">Author:</label>
                <Select value={selectedAuthor} onValueChange={setSelectedAuthor}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {authors.map((author) => (
                      <SelectItem key={author} value={author}>
                        {author}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-muted-foreground">Sort by:</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="title">Title A-Z</SelectItem>
                    <SelectItem value="author">Author A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container mx-auto">
          {/* Results count */}
          {!loading && !error && (
            <div className="mb-6 flex justify-between items-center">
              <p className="text-muted-foreground">
                {filteredAndSortedBlogs.length} article{filteredAndSortedBlogs.length !== 1 ? "s" : ""} found
                {searchTerm && ` for "${searchTerm}"`}
                {selectedCategory !== "All" && ` in ${selectedCategory}`}
                {selectedAuthor !== "All" && ` by ${selectedAuthor}`}
              </p>
              {hasActiveFilters && (
                <div className="flex gap-2 flex-wrap">
                  {searchTerm && (
                    <Badge variant="secondary" className="gap-1">
                      Search: {searchTerm}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchTerm("")} />
                    </Badge>
                  )}
                  {selectedCategory !== "All" && (
                    <Badge variant="secondary" className="gap-1">
                      {selectedCategory}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory("All")} />
                    </Badge>
                  )}
                  {selectedAuthor !== "All" && (
                    <Badge variant="secondary" className="gap-1">
                      {selectedAuthor}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedAuthor("All")} />
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )}

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
              {filteredAndSortedBlogs.map((blog) => (
                <Card
                  key={blog._id}
                  className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-0 shadow-md"
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={blog.image || "/placeholder.svg?height=200&width=400&query=blog post"}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="secondary" className="text-xs px-2 py-1">
                        {blog.category}
                      </Badge>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(blog.date).toLocaleDateString()}
                      </div>
                    </div>
                    <CardTitle className="font-heading group-hover:text-accent transition-colors text-lg leading-tight">
                      {blog.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground mb-4 line-clamp-3 leading-relaxed text-sm">{blog.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <div className="w-5 h-5 bg-accent/10 rounded-full flex items-center justify-center mr-2">
                          <User className="h-3 w-3 text-accent" />
                        </div>
                        <span className="font-medium">{blog.author}</span>
                        <span className="mx-2">•</span>
                        <span>{blog.readTime}</span>
                      </div>
                      <Link href={`/blog/${blog._id}`}>
                        <Button variant="ghost" size="sm" className="group/btn text-xs">
                          Read More
                          <ArrowRight className="h-3 w-3 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && !error && filteredAndSortedBlogs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-4">No articles found matching your criteria.</p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearAllFilters}>
                  Clear All Filters
                </Button>
              )}
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
