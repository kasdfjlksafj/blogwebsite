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
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || ""
    }
  }, [value])

  const saveSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      return selection.getRangeAt(0)
    }
    return null
  }

  const restoreSelection = (range: Range | null) => {
    if (range) {
      const selection = window.getSelection()
      if (selection) {
        selection.removeAllRanges()
        selection.addRange(range)
      }
    }
  }

  const executeCommand = (command: string, value?: string) => {
    if (!editorRef.current) return

    editorRef.current.focus()
    const range = saveSelection()

    try {
      document.execCommand(command, false, value)
    } catch (error) {
      console.log("[v0] Command failed:", command, error)
    }

    onChange(editorRef.current.innerHTML)
  }

  const insertImageAtCursor = (url: string) => {
    if (!editorRef.current) return

    editorRef.current.focus()
    const selection = window.getSelection()

    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)

      // Create image element
      const img = document.createElement("img")
      img.src = url
      img.alt = "Blog image"
      img.style.cssText = "max-width: 100%; height: auto; margin: 16px 0; border-radius: 8px; display: block;"

      // Insert at cursor
      range.deleteContents()
      range.insertNode(img)

      // Move cursor after image
      range.setStartAfter(img)
      range.setEndAfter(img)
      selection.removeAllRanges()
      selection.addRange(range)
    } else {
      // Fallback: append to end
      const img = document.createElement("img")
      img.src = url
      img.alt = "Blog image"
      img.style.cssText = "max-width: 100%; height: auto; margin: 16px 0; border-radius: 8px; display: block;"
      editorRef.current.appendChild(img)
    }

    onChange(editorRef.current.innerHTML)
    console.log("[v0] Image inserted at cursor:", url)
  }

  const insertImage = () => {
    if (imageUrl) {
      insertImageAtCursor(imageUrl)
      setImageUrl("")
      setShowImageDialog(false)
    }
  }

  const handleImageUpload = (url: string) => {
    insertImageAtCursor(url)
    setShowImageDialog(false)
  }

  const formatHeading = (level: number) => {
    if (!editorRef.current) return

    editorRef.current.focus()
    const selection = window.getSelection()

    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)

      // Get the current block element
      let blockElement = range.commonAncestorContainer
      if (blockElement.nodeType === Node.TEXT_NODE) {
        blockElement = blockElement.parentNode!
      }

      // Find the closest block element
      while (
        blockElement &&
        blockElement !== editorRef.current &&
        !["P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6"].includes((blockElement as Element).tagName)
      ) {
        blockElement = blockElement.parentNode!
      }

      if (blockElement && blockElement !== editorRef.current) {
        const heading = document.createElement(`h${level}`)
        heading.innerHTML = (blockElement as Element).innerHTML
        heading.style.cssText = "margin: 16px 0; font-weight: bold;"

        if (blockElement.parentNode) {
          blockElement.parentNode.replaceChild(heading, blockElement)
        }

        // Restore cursor position
        const newRange = document.createRange()
        newRange.selectNodeContents(heading)
        newRange.collapse(false)
        selection.removeAllRanges()
        selection.addRange(newRange)
      }
    }

    onChange(editorRef.current.innerHTML)
  }

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    onChange(target.innerHTML)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      executeCommand("insertHTML", "<br><br>")
    }
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
        className="min-h-[300px] p-4 focus:outline-none"
        style={{
          direction: "ltr",
          textAlign: "left",
          lineHeight: "1.6",
          fontSize: "16px",
        }}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        suppressContentEditableWarning={true}
        placeholder={placeholder}
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
