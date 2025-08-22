"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, User, Clock, Loader2, Share2 } from "lucide-react"
import { Navigation } from "@/components/navigation"
import Link from "next/link"
import { useParams } from "next/navigation"

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

export default function BlogDetailPage() {
  const params = useParams()
  const [blog, setBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/blogs/${params.id}`)
        if (!response.ok) {
          throw new Error("Blog not found")
        }
        const data = await response.json()
        setBlog(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        console.error("Error fetching blog:", err)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchBlog()
    }
  }, [params.id])

  const handleShare = async () => {
    if (navigator.share && blog) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.excerpt,
          url: window.location.href,
        })
      } catch (err) {
        console.log("Error sharing:", err)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <span className="ml-2 text-muted-foreground">Loading blog...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-foreground mb-4">Blog Not Found</h1>
            <p className="text-muted-foreground mb-6">The blog post you're looking for doesn't exist.</p>
            <Link href="/">
              <Button>Return to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-accent transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground truncate">{blog?.title}</span>
          </div>
        </div>
      </div>

      <article className="py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Blog Header */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {blog?.category}
              </Badge>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                {blog &&
                  new Date(blog.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading text-foreground mb-6 leading-tight">
              {blog?.title}
            </h1>

            <p className="text-xl text-muted-foreground mb-8 leading-relaxed font-light">{blog?.excerpt}</p>

            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center mr-2">
                    <User className="h-4 w-4 text-accent" />
                  </div>
                  <span className="font-medium">{blog?.author}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{blog?.readTime}</span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center gap-2 bg-transparent"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>

          {/* Featured Image */}
          {blog?.image && (
            <div className="mb-12 rounded-xl overflow-hidden shadow-lg">
              <img
                src={blog.image || "/placeholder.svg"}
                alt={blog.title}
                className="w-full h-64 md:h-96 object-cover"
              />
            </div>
          )}

          <div className="blog-content-display">
            <div
              className="prose prose-lg prose-slate max-w-none
                prose-headings:font-heading prose-headings:text-foreground prose-headings:font-bold
                prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-8
                prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-8 prose-h2:border-b prose-h2:border-border prose-h2:pb-2
                prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-6
                prose-p:text-foreground prose-p:leading-relaxed prose-p:mb-6
                prose-strong:text-foreground prose-strong:font-semibold
                prose-em:text-foreground
                prose-blockquote:border-l-4 prose-blockquote:border-accent prose-blockquote:bg-muted/30 
                prose-blockquote:pl-6 prose-blockquote:py-4 prose-blockquote:my-6 prose-blockquote:rounded-r-lg
                prose-blockquote:text-muted-foreground prose-blockquote:italic
                prose-ul:text-foreground prose-ul:mb-6
                prose-ol:text-foreground prose-ol:mb-6
                prose-li:mb-2 prose-li:leading-relaxed
                prose-a:text-accent prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-lg prose-img:shadow-md prose-img:my-8
                prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
                prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-lg prose-pre:p-4"
              dangerouslySetInnerHTML={{ __html: blog?.content || "" }}
            />
          </div>

          {/* Author Section */}
          <div className="mt-16 pt-8 border-t border-border">
            <div className="bg-muted/30 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-8 w-8 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg mb-1">{blog?.author}</h3>
                  <p className="text-muted-foreground mb-3">Content Writer & Storyteller</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Passionate about sharing insights and creating engaging content that resonates with readers.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row gap-4 justify-between">
            <Link href="/">
              <Button variant="outline" className="w-full sm:w-auto bg-transparent">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to All Posts
              </Button>
            </Link>

            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share Article
              </Button>
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}
