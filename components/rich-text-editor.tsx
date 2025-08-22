"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ImageUpload from "./image-upload"
import { Bold, Italic, List, ListOrdered, ImageIcon, Type } from "lucide-react"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [imageUrl, setImageUrl] = useState("")

  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || ""
      // Force left-to-right direction
      editorRef.current.style.direction = "ltr"
      editorRef.current.style.textAlign = "left"
      editorRef.current.style.unicodeBidi = "embed"
    }
  }, [])

  const executeCommand = (command: string, value?: string) => {
    if (editorRef.current) {
      editorRef.current.focus()
    }
    document.execCommand(command, false, value)
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const insertImage = () => {
    if (imageUrl && editorRef.current) {
      editorRef.current.focus()
      const imgHtml = `<img src="${imageUrl}" alt="Blog image" style="max-width: 100%; height: auto; margin: 16px 0; border-radius: 8px; display: block;" />`

      // Insert at cursor position
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        range.deleteContents()
        const imgElement = document.createElement("div")
        imgElement.innerHTML = imgHtml
        range.insertNode(imgElement.firstChild!)
        range.collapse(false)
      } else {
        // Fallback: append to end
        editorRef.current.innerHTML += imgHtml
      }

      onChange(editorRef.current.innerHTML)
      setImageUrl("")
      setShowImageDialog(false)

      console.log("[v0] Image inserted:", imageUrl)
    }
  }

  const handleImageUpload = (url: string) => {
    if (editorRef.current) {
      editorRef.current.focus()
      const imgHtml = `<img src="${url}" alt="Blog image" style="max-width: 100%; height: auto; margin: 16px 0; border-radius: 8px; display: block;" />`

      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        range.deleteContents()
        const imgElement = document.createElement("div")
        imgElement.innerHTML = imgHtml
        range.insertNode(imgElement.firstChild!)
        range.collapse(false)
      } else {
        editorRef.current.innerHTML += imgHtml
      }

      onChange(editorRef.current.innerHTML)
      setShowImageDialog(false)

      console.log("[v0] Uploaded image inserted:", url)
    }
  }

  const formatHeading = (level: number) => {
    executeCommand("formatBlock", `h${level}`)
  }

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    // Ensure direction stays left-to-right
    target.style.direction = "ltr"
    target.style.textAlign = "left"
    onChange(target.innerHTML)
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="flex flex-wrap gap-1 p-2 border-b bg-gray-50">
        <Button type="button" variant="ghost" size="sm" onClick={() => formatHeading(1)} className="h-8 px-2">
          <Type className="h-4 w-4 mr-1" />
          H1
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => formatHeading(2)} className="h-8 px-2">
          <Type className="h-4 w-4 mr-1" />
          H2
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => formatHeading(3)} className="h-8 px-2">
          <Type className="h-4 w-4 mr-1" />
          H3
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Button type="button" variant="ghost" size="sm" onClick={() => executeCommand("bold")} className="h-8 px-2">
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => executeCommand("italic")} className="h-8 px-2">
          <Italic className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand("insertUnorderedList")}
          className="h-8 px-2"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand("insertOrderedList")}
          className="h-8 px-2"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Button type="button" variant="ghost" size="sm" onClick={() => setShowImageDialog(true)} className="h-8 px-2">
          <ImageIcon className="h-4 w-4" />
        </Button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        className="min-h-[300px] p-4 focus:outline-none prose max-w-none"
        style={{
          direction: "ltr",
          textAlign: "left",
          lineHeight: "1.6",
          fontSize: "16px",
          unicodeBidi: "embed",
          writingMode: "lr-tb",
        }}
        onInput={handleInput}
        onFocus={() => {
          if (editorRef.current) {
            editorRef.current.style.direction = "ltr"
            editorRef.current.style.textAlign = "left"
          }
        }}
        suppressContentEditableWarning={true}
      />

      {showImageDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Add Image</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Upload Image</label>
                <ImageUpload onImageUploaded={handleImageUpload} />
              </div>

              <div className="text-center text-gray-500">or</div>

              <div>
                <label className="text-sm font-medium mb-2 block">Image URL</label>
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button onClick={insertImage} disabled={!imageUrl} className="flex-1">
                Add Image
              </Button>
              <Button variant="outline" onClick={() => setShowImageDialog(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
