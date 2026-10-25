import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

export default function CopyButton({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false)
  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(text || '')
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch {
      /* clipboard blocked */
    }
  }
  return (
    <button type="button" className="copy-btn" onClick={onClick}>
      {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Copied' : label}
    </button>
  )
}
