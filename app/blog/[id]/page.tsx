"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, User, Clock, Share2, Facebook, Twitter, Linkedin, Copy, CheckCircle } from "lucide-react"
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
  const [readingProgress, setReadingProgress] = useState(0)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

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

  useEffect(() => {
    const updateReadingProgress = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (scrollTop / docHeight) * 100
      setReadingProgress(Math.min(progress, 100))
    }

    window.addEventListener("scroll", updateReadingProgress)
    return () => window.removeEventListener("scroll", updateReadingProgress)
  }, [])

  const shareUrl = window.location.href
  const shareTitle = blog?.title || ""
  const shareText = blog?.excerpt || ""

  const handleShare = async (platform?: string) => {
    if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank")
    } else if (platform === "twitter") {
      window.open(
        `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
        "_blank",
      )
    } else if (platform === "linkedin") {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, "_blank")
    } else if (platform === "copy") {
      try {
        await navigator.clipboard.writeText(shareUrl)
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      } catch (err) {
        console.error("Failed to copy:", err)
      }
    } else {
      // Native share API fallback
      if (navigator.share && blog) {
        try {
          await navigator.share({
            title: blog.title,
            text: blog.excerpt,
            url: shareUrl,
          })
        } catch (err) {
          console.log("Error sharing:", err)
        }
      } else {
        setShowShareMenu(!showShareMenu)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-12 bg-muted rounded w-3/4"></div>
              <div className="h-6 bg-muted rounded w-1/2"></div>
              <div className="h-64 bg-muted rounded-xl"></div>
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
                <div className="h-4 bg-muted rounded w-4/6"></div>
              </div>
            </div>
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
          <div className="text-center py-20 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-foreground mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              Blog Not Found
            </h1>
            <p className="text-muted-foreground mb-8 text-lg">
              The blog post you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/">
              <Button className="hover-lift">Return to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="reading-progress" style={{ width: `${readingProgress}%` }}></div>

      <Navigation />

      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground max-w-4xl mx-auto">
            <Link href="/" className="hover:text-accent transition-colors font-medium">
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground truncate font-medium">{blog?.title}</span>
          </div>
        </div>
      </div>

      <article className="py-12 px-4 fade-in">
        <div className="container mx-auto max-w-4xl">
          <header className="mb-16 stagger-children">
            <div className="flex items-center gap-4 mb-8">
              <Badge
                variant="secondary"
                className="text-sm px-4 py-2 font-medium bg-accent/10 text-accent border-accent/20"
              >
                {blog?.category}
              </Badge>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                {blog &&
                  new Date(blog.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
              </div>
            </div>

            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-8 leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {blog?.title}
            </h1>

            <p
              className="text-xl md:text-2xl text-muted-foreground mb-10 leading-relaxed font-light max-w-3xl"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {blog?.excerpt}
            </p>

            <div className="flex items-center justify-between flex-wrap gap-6">
              <div className="flex items-center gap-8 text-sm">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mr-3 border-2 border-accent/20">
                    <User className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{blog?.author}</div>
                    <div className="text-muted-foreground">Content Writer</div>
                  </div>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="font-medium">{blog?.readTime}</span>
                </div>
              </div>

              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => handleShare()}
                  className="flex items-center gap-2 hover-lift bg-background border-2 border-accent/20 hover:border-accent/40"
                >
                  <Share2 className="h-4 w-4" />
                  Share Article
                </Button>

                {showShareMenu && (
                  <div className="absolute right-0 top-full mt-2 bg-background border border-border rounded-lg shadow-lg p-2 z-50 min-w-[200px]">
                    <button onClick={() => handleShare("facebook")} className="share-button share-facebook w-full mb-2">
                      <Facebook className="h-4 w-4 mr-2" />
                      Facebook
                    </button>
                    <button onClick={() => handleShare("twitter")} className="share-button share-twitter w-full mb-2">
                      <Twitter className="h-4 w-4 mr-2" />
                      Twitter
                    </button>
                    <button onClick={() => handleShare("linkedin")} className="share-button share-linkedin w-full mb-2">
                      <Linkedin className="h-4 w-4 mr-2" />
                      LinkedIn
                    </button>
                    <button onClick={() => handleShare("copy")} className="share-button share-copy w-full">
                      {copySuccess ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Link
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>


            </div>
          </header>

          {blog?.image && (
            <div className="mb-16 rounded-2xl overflow-hidden shadow-2xl hover-lift">
              <img
                src={blog.image || "/placeholder.svg?height=600&width=1200&query=professional blog featured image"}
                alt={blog.title}
                className="w-full h-64 md:h-96 lg:h-[500px] object-cover"
              />
            </div>
          )}

          <div className="blog-content-display slide-up">
            <div
              className="prose prose-lg prose-slate max-w-none
                prose-headings:text-foreground prose-headings:font-bold
                prose-h1:text-4xl prose-h1:mb-8 prose-h1:mt-12
                prose-h2:text-3xl prose-h2:mb-6 prose-h2:mt-12 prose-h2:border-b prose-h2:border-border prose-h2:pb-4
                prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-8
                prose-p:text-foreground prose-p:leading-relaxed prose-p:mb-6 prose-p:text-lg
                prose-strong:text-foreground prose-strong:font-semibold
                prose-em:text-foreground prose-em:italic
                prose-blockquote:border-l-4 prose-blockquote:border-accent prose-blockquote:bg-muted/50 
                prose-blockquote:pl-8 prose-blockquote:py-6 prose-blockquote:my-8 prose-blockquote:rounded-r-xl
                prose-blockquote:text-muted-foreground prose-blockquote:italic prose-blockquote:text-xl
                prose-ul:text-foreground prose-ul:mb-6 prose-ul:text-lg
                prose-ol:text-foreground prose-ol:mb-6 prose-ol:text-lg
                prose-li:mb-3 prose-li:leading-relaxed
                prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-a:font-medium
                prose-img:rounded-xl prose-img:shadow-lg prose-img:my-10
                prose-code:bg-muted prose-code:px-3 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono
                prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-xl prose-pre:p-6"
              dangerouslySetInnerHTML={{ __html: blog?.content || "" }}
              style={{ fontFamily: "var(--font-body)" }}
            />
          </div>

          <div className="mt-20 pt-12 border-t border-border slide-up">
            <div className="bg-gradient-to-r from-muted/50 to-muted/30 rounded-2xl p-8 hover-lift">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 border-3 border-accent/20">
                  <User className="h-10 w-10 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground text-2xl mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                    {blog?.author}
                  </h3>
                  <p className="text-accent font-medium mb-4">Content Writer & Digital Storyteller</p>
                  <p
                    className="text-muted-foreground leading-relaxed text-lg"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    Passionate about creating engaging content that resonates with readers and drives meaningful
                    conversations. Specializing in technology, lifestyle, and thought leadership articles.
                  </p>
                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" size="sm" className="hover-lift bg-transparent">
                      View Profile
                    </Button>
                    <Button variant="ghost" size="sm" className="hover-lift">
                      More Articles
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-12 border-t border-border flex flex-col sm:flex-row gap-6 justify-between items-center slide-up">
            <Link href="/">
              <Button
                variant="outline"
                className="w-full sm:w-auto hover-lift bg-background border-2 border-primary/20 hover:border-primary/40"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to All Posts
              </Button>
            </Link>

            <div className="flex gap-3">
              <Button
                variant="default"
                onClick={() => handleShare()}
                className="hover-lift bg-accent hover:bg-accent/90"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share This Article
              </Button>
            </div>
          </div>
        </div>
      </article>

      {showShareMenu && <div className="fixed inset-0 z-40" onClick={() => setShowShareMenu(false)} />}
    </div>
  )
}
