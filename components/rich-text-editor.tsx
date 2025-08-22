"use client"

import { useState, useRef } from "react"
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

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const insertImage = () => {
    if (imageUrl) {
      executeCommand(
        "insertHTML",
        `<img src="${imageUrl}" alt="Blog image" style="max-width: 100%; height: auto; margin: 16px 0; border-radius: 8px;" />`,
      )
      setImageUrl("")
      setShowImageDialog(false)
    }
  }

  const handleImageUpload = (url: string) => {
    executeCommand(
      "insertHTML",
      `<img src="${url}" alt="Blog image" style="max-width: 100%; height: auto; margin: 16px 0; border-radius: 8px;" />`,
    )
    setShowImageDialog(false)
  }

  const formatHeading = (level: number) => {
    executeCommand("formatBlock", `h${level}`)
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
        dangerouslySetInnerHTML={{ __html: value }}
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        data-placeholder={placeholder}
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
