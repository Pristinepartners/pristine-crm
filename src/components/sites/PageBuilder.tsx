'use client'

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft,
  Save,
  Eye,
  Smartphone,
  Monitor,
  Type,
  Image,
  Square,
  Minus,
  AlignLeft,
  List,
  Mail,
  Play,
  MousePointer,
  Columns,
  Trash2,
  Settings,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Code,
} from 'lucide-react'
import Link from 'next/link'

type ElementType = 'heading' | 'text' | 'image' | 'button' | 'divider' | 'spacer' | 'form' | 'video' | 'columns' | 'html'

interface Element {
  id: string
  type: ElementType
  content: Record<string, any>
  styles: Record<string, string>
}

interface PageBuilderProps {
  type: 'funnels' | 'websites' | 'forms' | 'surveys'
  item: {
    id: string
    name: string
    slug: string
    content?: string
    status?: string
  }
}

const elementTypes: { type: ElementType; icon: React.ElementType; label: string }[] = [
  { type: 'heading', icon: Type, label: 'Heading' },
  { type: 'text', icon: AlignLeft, label: 'Text' },
  { type: 'image', icon: Image, label: 'Image' },
  { type: 'button', icon: MousePointer, label: 'Button' },
  { type: 'divider', icon: Minus, label: 'Divider' },
  { type: 'spacer', icon: Square, label: 'Spacer' },
  { type: 'form', icon: Mail, label: 'Form' },
  { type: 'video', icon: Play, label: 'Video' },
  { type: 'columns', icon: Columns, label: 'Columns' },
  { type: 'html', icon: Code, label: 'Custom HTML' },
]

const defaultContent: Record<ElementType, Record<string, any>> = {
  heading: { text: 'Your Headline Here', level: 'h1' },
  text: { text: 'Add your text content here. Click to edit.' },
  image: { src: '', alt: 'Image' },
  button: { text: 'Click Here', link: '#', variant: 'primary' },
  divider: {},
  spacer: { height: '40px' },
  form: { fields: [{ type: 'email', label: 'Email', required: true }], submitText: 'Submit' },
  video: { src: '', type: 'youtube' },
  columns: { columns: 2, gap: '20px' },
  html: { code: '<div style="padding: 20px; background: #f3f4f6; border-radius: 8px;">\n  <p>Your custom HTML here</p>\n</div>' },
}

const defaultStyles: Record<ElementType, Record<string, string>> = {
  heading: { fontSize: '36px', fontWeight: 'bold', color: '#111827', textAlign: 'center', marginBottom: '20px' },
  text: { fontSize: '16px', color: '#4B5563', lineHeight: '1.6', textAlign: 'left', marginBottom: '16px' },
  image: { width: '100%', maxWidth: '600px', margin: '0 auto', borderRadius: '8px' },
  button: { backgroundColor: '#2563EB', color: '#ffffff', padding: '12px 32px', borderRadius: '8px', fontSize: '16px', fontWeight: '600' },
  divider: { borderTop: '1px solid #E5E7EB', margin: '24px 0' },
  spacer: { height: '40px' },
  form: { maxWidth: '400px', margin: '0 auto' },
  video: { width: '100%', maxWidth: '800px', margin: '0 auto', aspectRatio: '16/9' },
  columns: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' },
  html: {},
}

export function PageBuilder({ type, item }: PageBuilderProps) {
  const [elements, setElements] = useState<Element[]>(() => {
    try {
      const parsed = JSON.parse(item.content || '{}')
      return parsed.elements || []
    } catch {
      return []
    }
  })
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [saving, setSaving] = useState(false)
  const [showLeftPanel, setShowLeftPanel] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const addElement = (elementType: ElementType) => {
    const newElement: Element = {
      id: `el_${Date.now()}`,
      type: elementType,
      content: { ...defaultContent[elementType] },
      styles: { ...defaultStyles[elementType] },
    }
    setElements([...elements, newElement])
    setSelectedElement(newElement.id)
  }

  const updateElement = (id: string, updates: Partial<Element>) => {
    setElements(elements.map(el =>
      el.id === id ? { ...el, ...updates } : el
    ))
  }

  const deleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id))
    if (selectedElement === id) setSelectedElement(null)
  }

  const moveElement = (id: string, direction: 'up' | 'down') => {
    const index = elements.findIndex(el => el.id === id)
    if (direction === 'up' && index > 0) {
      const newElements = [...elements]
      ;[newElements[index - 1], newElements[index]] = [newElements[index], newElements[index - 1]]
      setElements(newElements)
    } else if (direction === 'down' && index < elements.length - 1) {
      const newElements = [...elements]
      ;[newElements[index], newElements[index + 1]] = [newElements[index + 1], newElements[index]]
      setElements(newElements)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase
      .from(type)
      .update({
        content: JSON.stringify({ elements }),
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', item.id)

    setSaving(false)
    if (error) {
      alert('Error saving: ' + error.message)
    }
  }

  const handlePublish = async () => {
    setSaving(true)
    const { error } = await supabase
      .from(type)
      .update({
        content: JSON.stringify({ elements }),
        status: 'published',
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', item.id)

    setSaving(false)
    if (error) {
      alert('Error publishing: ' + error.message)
    } else {
      router.refresh()
    }
  }

  const selectedEl = elements.find(el => el.id === selectedElement)

  return (
    <div className="h-screen flex flex-col bg-stone-100">
      {/* Top Bar */}
      <div className="bg-white border-b border-[var(--color-border)] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/sites"
            className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-stone-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-semibold text-[var(--color-text)]">{item.name}</h1>
            <p className="text-xs text-[var(--color-text-secondary)]">/{item.slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex bg-stone-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('desktop')}
              className={`p-2 rounded ${viewMode === 'desktop' ? 'bg-white shadow-sm' : 'text-[var(--color-text-secondary)]'}`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={`p-2 rounded ${viewMode === 'mobile' ? 'bg-white shadow-sm' : 'text-[var(--color-text-secondary)]'}`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => window.open(`/preview/${type}/${item.slug}`, '_blank')}
            className="flex items-center gap-2 px-3 py-2 text-[var(--color-text)] hover:bg-stone-100 rounded-lg transition"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-3 py-2 border border-[var(--color-border-strong)] text-[var(--color-text)] rounded-lg hover:bg-stone-50 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Save
          </button>

          <button
            onClick={handlePublish}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            Publish
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Elements */}
        <div className={`w-64 bg-white border-r border-[var(--color-border)] flex flex-col ${showLeftPanel ? '' : 'hidden'}`}>
          <div className="p-4 border-b border-[var(--color-border)]">
            <h2 className="font-semibold text-[var(--color-text)]">Elements</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 gap-2">
              {elementTypes.map(({ type: elType, icon: Icon, label }) => (
                <button
                  key={elType}
                  onClick={() => addElement(elType)}
                  className="flex flex-col items-center gap-2 p-3 border border-[var(--color-border)] rounded-lg hover:bg-stone-50 hover:border-amber-300 transition"
                >
                  <Icon className="w-5 h-5 text-[var(--color-text-secondary)]" />
                  <span className="text-xs text-[var(--color-text-secondary)]">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-y-auto p-8">
          <div
            className={`mx-auto bg-white shadow-lg min-h-[600px] transition-all ${
              viewMode === 'mobile' ? 'max-w-[375px]' : 'max-w-[1200px]'
            }`}
          >
            <div className="p-8">
              {elements.length === 0 ? (
                <div className="border-2 border-dashed border-[var(--color-border-strong)] rounded-lg p-12 text-center">
                  <p className="text-[var(--color-text-secondary)] mb-2">Your page is empty</p>
                  <p className="text-sm text-[var(--color-text-muted)]">Add elements from the left panel</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {elements.map((element, index) => (
                    <div
                      key={element.id}
                      onClick={() => setSelectedElement(element.id)}
                      className={`relative group cursor-pointer ${
                        selectedElement === element.id ? 'ring-2 ring-[var(--color-primary)] ring-offset-2' : ''
                      }`}
                    >
                      {/* Element Controls */}
                      <div className={`absolute -left-10 top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition ${
                        selectedElement === element.id ? 'opacity-100' : ''
                      }`}>
                        <button
                          onClick={(e) => { e.stopPropagation(); moveElement(element.id, 'up') }}
                          disabled={index === 0}
                          className="p-1 bg-gray-800 text-white rounded hover:bg-gray-700 disabled:opacity-30"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); moveElement(element.id, 'down') }}
                          disabled={index === elements.length - 1}
                          className="p-1 bg-gray-800 text-white rounded hover:bg-gray-700 disabled:opacity-30"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteElement(element.id) }}
                          className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Element Render */}
                      <ElementRenderer element={element} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Properties */}
        {selectedEl && (
          <div className="w-80 bg-white border-l border-[var(--color-border)] flex flex-col">
            <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
              <h2 className="font-semibold text-[var(--color-text)]">Properties</h2>
              <button
                onClick={() => setSelectedElement(null)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <ElementProperties
                element={selectedEl}
                onUpdate={(updates) => updateElement(selectedEl.id, updates)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ElementRenderer({ element }: { element: Element }) {
  const style = element.styles

  switch (element.type) {
    case 'heading':
      const HeadingTag = (element.content.level || 'h1') as React.ElementType
      return <HeadingTag style={style}>{element.content.text}</HeadingTag>
    case 'text':
      return <p style={style}>{element.content.text}</p>
    case 'image':
      return element.content.src ? (
        <img src={element.content.src} alt={element.content.alt} style={style} />
      ) : (
        <div style={{ ...style, backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
          <Image className="w-8 h-8 text-[var(--color-text-muted)]" />
        </div>
      )
    case 'button':
      return (
        <div style={{ textAlign: 'center' }}>
          <button style={style}>{element.content.text}</button>
        </div>
      )
    case 'divider':
      return <hr style={style} />
    case 'spacer':
      return <div style={{ height: element.content.height }} />
    case 'form':
      return (
        <div style={style}>
          {element.content.fields?.map((field: any, i: number) => (
            <div key={i} className="mb-3">
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">{field.label}</label>
              <input
                type={field.type}
                className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg"
                placeholder={field.label}
              />
            </div>
          ))}
          <button className="w-full py-2 bg-[var(--color-primary)] text-white rounded-lg">
            {element.content.submitText}
          </button>
        </div>
      )
    case 'video':
      return element.content.src ? (
        <div style={style}>
          <iframe src={element.content.src} className="w-full h-full" />
        </div>
      ) : (
        <div style={{ ...style, backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
          <Play className="w-12 h-12 text-[var(--color-text-muted)]" />
        </div>
      )
    case 'html':
      return (
        <div dangerouslySetInnerHTML={{ __html: element.content.code }} />
      )
    default:
      return <div>Unknown element</div>
  }
}

function ElementProperties({ element, onUpdate }: { element: Element; onUpdate: (updates: Partial<Element>) => void }) {
  const updateContent = (key: string, value: any) => {
    onUpdate({ content: { ...element.content, [key]: value } })
  }

  const updateStyle = (key: string, value: string) => {
    onUpdate({ styles: { ...element.styles, [key]: value } })
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase">{element.type}</h3>

      {/* Content Properties */}
      {element.type === 'heading' && (
        <>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Text</label>
            <input
              type="text"
              value={element.content.text}
              onChange={(e) => updateContent('text', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Level</label>
            <select
              value={element.content.level}
              onChange={(e) => updateContent('level', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm"
            >
              <option value="h1">H1</option>
              <option value="h2">H2</option>
              <option value="h3">H3</option>
              <option value="h4">H4</option>
            </select>
          </div>
        </>
      )}

      {element.type === 'text' && (
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Text</label>
          <textarea
            value={element.content.text}
            onChange={(e) => updateContent('text', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm"
          />
        </div>
      )}

      {element.type === 'image' && (
        <>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Image URL</label>
            <input
              type="text"
              value={element.content.src}
              onChange={(e) => updateContent('src', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Alt Text</label>
            <input
              type="text"
              value={element.content.alt}
              onChange={(e) => updateContent('alt', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm"
            />
          </div>
        </>
      )}

      {element.type === 'button' && (
        <>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Button Text</label>
            <input
              type="text"
              value={element.content.text}
              onChange={(e) => updateContent('text', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Link URL</label>
            <input
              type="text"
              value={element.content.link}
              onChange={(e) => updateContent('link', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm"
            />
          </div>
        </>
      )}

      {element.type === 'video' && (
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Video URL (YouTube/Vimeo)</label>
          <input
            type="text"
            value={element.content.src}
            onChange={(e) => updateContent('src', e.target.value)}
            className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm"
            placeholder="https://youtube.com/embed/..."
          />
        </div>
      )}

      {element.type === 'spacer' && (
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Height</label>
          <input
            type="text"
            value={element.content.height}
            onChange={(e) => updateContent('height', e.target.value)}
            className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm"
            placeholder="40px"
          />
        </div>
      )}

      {element.type === 'html' && (
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Custom HTML Code</label>
          <textarea
            value={element.content.code}
            onChange={(e) => updateContent('code', e.target.value)}
            rows={12}
            className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm font-mono"
            placeholder="<div>Your HTML here</div>"
          />
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Enter any valid HTML, CSS, or JavaScript code
          </p>
        </div>
      )}

      {/* Style Properties */}
      <hr className="my-4" />
      <h3 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase">Styles</h3>

      {(element.type === 'heading' || element.type === 'text') && (
        <>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Font Size</label>
            <input
              type="text"
              value={element.styles.fontSize}
              onChange={(e) => updateStyle('fontSize', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Text Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={element.styles.color}
                onChange={(e) => updateStyle('color', e.target.value)}
                className="w-10 h-10 rounded border border-[var(--color-border-strong)]"
              />
              <input
                type="text"
                value={element.styles.color}
                onChange={(e) => updateStyle('color', e.target.value)}
                className="flex-1 px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Text Align</label>
            <select
              value={element.styles.textAlign}
              onChange={(e) => updateStyle('textAlign', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </>
      )}

      {element.type === 'button' && (
        <>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Background Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={element.styles.backgroundColor}
                onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                className="w-10 h-10 rounded border border-[var(--color-border-strong)]"
              />
              <input
                type="text"
                value={element.styles.backgroundColor}
                onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                className="flex-1 px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Text Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={element.styles.color}
                onChange={(e) => updateStyle('color', e.target.value)}
                className="w-10 h-10 rounded border border-[var(--color-border-strong)]"
              />
              <input
                type="text"
                value={element.styles.color}
                onChange={(e) => updateStyle('color', e.target.value)}
                className="flex-1 px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Border Radius</label>
            <input
              type="text"
              value={element.styles.borderRadius}
              onChange={(e) => updateStyle('borderRadius', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm"
            />
          </div>
        </>
      )}
    </div>
  )
}
