"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  ImageIcon,
  Link,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [linkUrl, setLinkUrl] = useState("")
  const [linkText, setLinkText] = useState("")

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
        `<img src="${imageUrl}" alt="Blog image" class="w-full rounded-lg shadow-md my-4" />`,
      )
      setImageUrl("")
      setShowImageDialog(false)
    }
  }

  const insertLink = () => {
    if (linkUrl && linkText) {
      executeCommand(
        "insertHTML",
        `<a href="${linkUrl}" class="text-primary hover:text-primary/80 underline">${linkText}</a>`,
      )
      setLinkUrl("")
      setLinkText("")
      setShowLinkDialog(false)
    }
  }

  const formatHeading = (level: number) => {
    executeCommand("formatBlock", `h${level}`)
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-3 border-b border-border bg-muted/50">
        <Button type="button" variant="ghost" size="sm" onClick={() => formatHeading(1)} className="h-8 px-2">
          <Type className="h-4 w-4" />
          H1
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => formatHeading(2)} className="h-8 px-2">
          <Type className="h-4 w-4" />
          H2
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => formatHeading(3)} className="h-8 px-2">
          <Type className="h-4 w-4" />
          H3
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button type="button" variant="ghost" size="sm" onClick={() => executeCommand("bold")} className="h-8 px-2">
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => executeCommand("italic")} className="h-8 px-2">
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand("underline")}
          className="h-8 px-2"
        >
          <Underline className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand("justifyLeft")}
          className="h-8 px-2"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand("justifyCenter")}
          className="h-8 px-2"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand("justifyRight")}
          className="h-8 px-2"
        >
          <AlignRight className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

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
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand("formatBlock", "blockquote")}
          className="h-8 px-2"
        >
          <Quote className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button type="button" variant="ghost" size="sm" onClick={() => setShowImageDialog(true)} className="h-8 px-2">
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setShowLinkDialog(true)} className="h-8 px-2">
          <Link className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[300px] p-4 focus:outline-none blog-content"
        style={{ whiteSpace: "pre-wrap" }}
        dangerouslySetInnerHTML={{ __html: value }}
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        data-placeholder={placeholder}
      />

      {/* Image Dialog */}
      {showImageDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Insert Image</h3>
            <Input
              placeholder="Image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="mb-4"
            />
            <div className="flex gap-2">
              <Button onClick={insertImage} className="flex-1">
                Insert
              </Button>
              <Button variant="outline" onClick={() => setShowImageDialog(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
            <Input
              placeholder="Link URL"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="mb-3"
            />
            <Input
              placeholder="Link Text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              className="mb-4"
            />
            <div className="flex gap-2">
              <Button onClick={insertLink} className="flex-1">
                Insert
              </Button>
              <Button variant="outline" onClick={() => setShowLinkDialog(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
