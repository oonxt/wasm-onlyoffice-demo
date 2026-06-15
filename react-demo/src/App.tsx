import { useState, useCallback } from 'react'
import { OnlyOfficeEditor } from 'wasm-onlyoffice-sdk/react'
import type { OfficeTheme } from 'wasm-onlyoffice-sdk'

// VITE_OO_BASE is injected at build time (e.g. "/wasm-onlyoffice-demo" on GitHub
// Pages, "" for local dev). The OnlyOffice asset tree and x2t live at the site root.
const OO_BASE = import.meta.env.VITE_OO_BASE ?? ''
const ASSETS_PATH = `${OO_BASE}/v9.3.0.24-1`
const X2T_PATH = `${OO_BASE}/x2t`

type DocType = 'docx' | 'xlsx' | 'pptx'

export default function App() {
  const [docType, setDocType] = useState<DocType>('docx')
  const [file, setFile] = useState<File | null>(null)
  const [theme, setTheme] = useState<OfficeTheme>('theme-light')
  const [isDirty, setIsDirty] = useState(false)
  // editorKey forces remount when doc type or theme changes
  const [editorKey, setEditorKey] = useState(0)

  const handleNewDoc = useCallback((type: DocType) => {
    setFile(null)
    setDocType(type)
    setIsDirty(false)
    setEditorKey(k => k + 1)
  }, [])

  const handleOpenFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setIsDirty(false)
    setEditorKey(k => k + 1)
    // Reset input so the same file can be re-opened
    e.target.value = ''
  }, [])

  const handleThemeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(e.target.value as OfficeTheme)
    setEditorKey(k => k + 1)
  }, [])

  const handleError = useCallback((err: Error) => {
    console.error('Editor error:', err)
  }, [])

  const handleSave = useCallback((blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setIsDirty(false)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
        background: '#f5f5f5', borderBottom: '1px solid #ddd', flexShrink: 0,
      }}>
        <span style={{ fontWeight: 600, marginRight: 4 }}>New:</span>
        {(['docx', 'xlsx', 'pptx'] as DocType[]).map(t => (
          <button key={t} onClick={() => handleNewDoc(t)}
            style={{ padding: '4px 10px', cursor: 'pointer' }}>
            {t.toUpperCase()}
          </button>
        ))}

        <label style={{ marginLeft: 8, padding: '4px 10px', cursor: 'pointer',
          background: '#fff', border: '1px solid #ccc', borderRadius: 3 }}>
          Open File...
          <input type="file" style={{ display: 'none' }}
            accept=".docx,.xlsx,.pptx,.doc,.xls,.ppt,.odt,.ods,.odp,.pdf,.txt,.rtf,.csv"
            onChange={handleOpenFile} />
        </label>

        <span style={{ marginLeft: 16 }}>Theme:</span>
        <select value={theme} onChange={handleThemeChange}
          style={{ padding: '4px 6px' }}>
          <option value="theme-light">Light</option>
          <option value="theme-classic-light">Classic Light</option>
          <option value="theme-white">White</option>
          <option value="theme-dark">Dark</option>
          <option value="theme-night">Night</option>
          <option value="theme-contrast-dark">Contrast Dark</option>
        </select>

        <span style={{ marginLeft: 'auto', fontSize: 13, color: isDirty ? '#c00' : '#080' }}>
          {isDirty ? '● Unsaved changes' : '✓ Saved'}
        </span>
      </div>

      {/* Editor */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <OnlyOfficeEditor
          language='zh-CN'
          key={editorKey}
          assetsPath={ASSETS_PATH}
          x2tPath={X2T_PATH}
          {...(file ? { file } : { newDocument: docType })}
          theme={theme}
          user={{ id: 'demo-user', name: 'Demo User' }}
          onDocumentStateChange={setIsDirty}
          onSave={handleSave}
          onError={handleError}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  )
}
