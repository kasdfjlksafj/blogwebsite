"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bold, Italic, List, ListOrdered, ImageIcon } from "lucide-react"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [imageUrl, setImageUrl] = useState("")

  const insertHtmlAtCursor = useCallback(
    (html: string) => {
      if (!editorRef.current) return

      editorRef.current.focus()
      const selection = window.getSelection()

      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        range.deleteContents()

        const div = document.createElement("div")
        div.innerHTML = html
        const fragment = document.createDocumentFragment()

        while (div.firstChild) {
          fragment.appendChild(div.firstChild)
        }

        range.insertNode(fragment)
        range.collapse(false)
        selection.removeAllRanges()
        selection.addRange(range)
      } else {
        // Fallback: append to end
        editorRef.current.innerHTML += html
      }

      onChange(editorRef.current.innerHTML)
    },
    [onChange],
  )

  const wrapSelection = useCallback(
    (tagName: string, attributes: Record<string, string> = {}) => {
      if (!editorRef.current) return

      editorRef.current.focus()
      const selection = window.getSelection()

      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        const selectedText = range.toString()

        if (selectedText) {
          const element = document.createElement(tagName)
          Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value)
          })
          element.textContent = selectedText

          range.deleteContents()
          range.insertNode(element)
          range.selectNodeContents(element)
          selection.removeAllRanges()
          selection.addRange(range)

          onChange(editorRef.current.innerHTML)
        }
      }
    },
    [onChange],
  )

  const formatHeading = useCallback(
    (level: number) => {
      if (!editorRef.current) return

      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return

      const range = selection.getRangeAt(0)
      const selectedText = range.toString() || "New Heading"

      const heading = `<h${level} style="font-size: ${level === 1 ? "2em" : level === 2 ? "1.5em" : "1.25em"}; font-weight: bold; margin: 16px 0; line-height: 1.3;">${selectedText}</h${level}>`

      range.deleteContents()
      insertHtmlAtCursor(heading)
    },
    [insertHtmlAtCursor],
  )

  const formatBold = useCallback(() => {
    wrapSelection("strong", { style: "font-weight: bold;" })
  }, [wrapSelection])

  const formatItalic = useCallback(() => {
    wrapSelection("em", { style: "font-style: italic;" })
  }, [wrapSelection])

  const formatList = useCallback(
    (ordered = false) => {
      if (!editorRef.current) return

      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return

      const range = selection.getRangeAt(0)
      const selectedText = range.toString() || "List item"

      const listTag = ordered ? "ol" : "ul"
      const listHtml = `<${listTag} style="margin: 16px 0; padding-left: 20px;"><li style="margin: 4px 0;">${selectedText}</li></${listTag}>`

      range.deleteContents()
      insertHtmlAtCursor(listHtml)
    },
    [insertHtmlAtCursor],
  )

  const insertImage = useCallback(() => {
    if (imageUrl.trim()) {
      const imageHtml = `<img src="${imageUrl}" alt="Blog image" style="max-width: 100%; height: auto; margin: 16px 0; border-radius: 8px; display: block;" />`
      insertHtmlAtCursor(imageHtml)
      setImageUrl("")
      setShowImageDialog(false)
    }
  }, [imageUrl, insertHtmlAtCursor])

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        insertHtmlAtCursor("<br><br>")
      }
    },
    [insertHtmlAtCursor],
  )

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="flex flex-wrap gap-2 p-3 border-b bg-gray-50">
        <Button type="button" variant="ghost" size="sm" onClick={() => formatHeading(1)} className="text-xs">
          H1
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => formatHeading(2)} className="text-xs">
          H2
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => formatHeading(3)} className="text-xs">
          H3
        </Button>

        <div className="w-px h-6 bg-gray-300" />

        <Button type="button" variant="ghost" size="sm" onClick={formatBold}>
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={formatItalic}>
          <Italic className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300" />

        <Button type="button" variant="ghost" size="sm" onClick={() => formatList(false)}>
          <List className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => formatList(true)}>
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300" />

        <Button type="button" variant="ghost" size="sm" onClick={() => setShowImageDialog(true)}>
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
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        dangerouslySetInnerHTML={{ __html: value }}
        suppressContentEditableWarning={true}
        data-placeholder={placeholder}
      />

      {showImageDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Add Image</h3>

            <div className="space-y-4">
              <Input
                placeholder="Enter image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && insertImage()}
              />
            </div>

            <div className="flex gap-2 mt-6">
              <Button onClick={insertImage} disabled={!imageUrl.trim()}>
                Add Image
              </Button>
              <Button variant="outline" onClick={() => setShowImageDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
