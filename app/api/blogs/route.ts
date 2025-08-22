import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export interface Blog {
  _id?: string
  title: string
  excerpt: string
  content: string
  author: string
  date: string
  category: string
  readTime: string
  image: string
}

// GET - Fetch all blogs
export async function GET() {
  try {
    const db = await getDatabase()
    const blogs = await db.collection("blogs").find({}).sort({ date: -1 }).toArray()

    // Convert ObjectId to string for JSON serialization
    const serializedBlogs = blogs.map((blog) => ({
      ...blog,
      _id: blog._id.toString(),
    }))

    return NextResponse.json(serializedBlogs)
  } catch (error) {
    console.error("Error fetching blogs:", error)
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 })
  }
}

// POST - Create new blog
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, excerpt, content, author, category, image } = body

    if (!title || !excerpt || !content || !author || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDatabase()
    const newBlog = {
      title,
      excerpt,
      content,
      author,
      category,
      image: image || "/blog-post-image.png",
      date: new Date().toISOString(),
      readTime: `${Math.ceil(content.split(" ").length / 200)} min read`,
    }

    const result = await db.collection("blogs").insertOne(newBlog)

    return NextResponse.json(
      {
        ...newBlog,
        _id: result.insertedId.toString(),
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating blog:", error)
    return NextResponse.json({ error: "Failed to create blog" }, { status: 500 })
  }
}
