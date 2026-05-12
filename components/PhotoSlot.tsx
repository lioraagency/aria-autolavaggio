'use client'

import { useRef } from 'react'

interface Props {
  label: string
  imageUrl?: string
  onCapture: (dataUrl: string) => void
}

export default function PhotoSlot({ label, imageUrl, onCapture }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleClick() {
    inputRef.current?.click()
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      if (dataUrl) onCapture(dataUrl)
    }
    reader.readAsDataURL(file)
    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  return (
    <div
      className="aspect-square rounded-xl overflow-hidden cursor-pointer"
      onClick={handleClick}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={label}
          className="w-full h-full object-cover rounded-xl"
        />
      ) : (
        <div className="w-full h-full bg-aria-elevated border border-dashed border-aria-border-strong rounded-xl flex flex-col items-center justify-center gap-2">
          <svg
            width={28}
            height={28}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-aria-muted"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          <span className="text-[11px] text-aria-muted font-condensed uppercase tracking-wider">
            {label}
          </span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}
