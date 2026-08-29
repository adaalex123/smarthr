import { type RefObject, useRef } from 'react'

type Format = 'bold' | 'h2' | 'h3' | 'ul' | 'ol' | 'separator'

type ToolbarAction = {
  label: string
  title: string
  format: Format
}

const TOOLBAR: ToolbarAction[] = [
  { label: 'B', title: 'Bold: wrap with **', format: 'bold' },
  { label: 'H2', title: 'Section heading', format: 'h2' },
  { label: 'H3', title: 'Sub-heading', format: 'h3' },
  { label: '- List', title: 'Bullet list item', format: 'ul' },
  { label: '1. List', title: 'Numbered list item', format: 'ol' },
  { label: 'Line', title: 'Separator line', format: 'separator' },
]

function applyFormat(
  ref: RefObject<HTMLTextAreaElement>,
  format: Format,
  current: string,
  onChange: (value: string) => void,
) {
  const el = ref.current
  if (!el) return

  const start = el.selectionStart
  const end = el.selectionEnd
  const selected = current.slice(start, end)

  let replacement: string
  let cursorOffset: number

  switch (format) {
    case 'bold':
      replacement = `**${selected || 'bold text'}**`
      cursorOffset = selected ? replacement.length : 2
      break
    case 'h2':
      replacement = `\n## ${selected || 'Section title'}\n`
      cursorOffset = replacement.length
      break
    case 'h3':
      replacement = `\n### ${selected || 'Sub-section'}\n`
      cursorOffset = replacement.length
      break
    case 'ul':
      replacement = selected
        ? selected.split('\n').map((line) => `- ${line}`).join('\n')
        : `- Item`
      cursorOffset = replacement.length
      break
    case 'ol':
      replacement = selected
        ? selected.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n')
        : `1. Item`
      cursorOffset = replacement.length
      break
    case 'separator':
      replacement = `\n\n---\n\n`
      cursorOffset = replacement.length
      break
    default:
      return
  }

  const next = current.slice(0, start) + replacement + current.slice(end)
  onChange(next)

  requestAnimationFrame(() => {
    if (!ref.current) return
    const pos = start + (selected ? cursorOffset : cursorOffset)
    ref.current.focus()
    ref.current.setSelectionRange(pos, pos)
  })
}

type Props = {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
}

export default function RichTextarea({ id, value, onChange, placeholder, rows = 10 }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null!)

  return (
    <div className="rta-wrap">
      <div className="rta-toolbar" role="toolbar" aria-label="Formatting toolbar">
        {TOOLBAR.map((action) => (
          <button
            key={action.format}
            type="button"
            title={action.title}
            className="rta-btn"
            onMouseDown={(e) => {
              e.preventDefault()
              applyFormat(ref, action.format, value, onChange)
            }}
          >
            {action.label}
          </button>
        ))}
        <span className="rta-hint">Markdown: headers, bold, lists</span>
      </div>
      <textarea
        ref={ref}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="rta-body"
        spellCheck
      />
    </div>
  )
}
