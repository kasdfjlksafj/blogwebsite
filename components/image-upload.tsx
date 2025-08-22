"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, X } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  onImageUploaded: (url: string) => void
  className?: string
}

export default function ImageUpload({ onImageUploaded, className = "" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Show preview
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)

    // Upload file
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        onImageUploaded(result.url)
      } else {
        alert(result.error || "Upload failed")
        setPreview(null)
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert("Upload failed")
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const clearPreview = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading..." : "Upload Image"}
        </Button>
        <Input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
      </div>

      {preview && (
        <div className="relative inline-block">
          <Image
            src={preview || "/placeholder.svg"}
            alt="Preview"
            width={200}
            height={150}
            className="rounded-lg object-cover border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={clearPreview}
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  )
}
