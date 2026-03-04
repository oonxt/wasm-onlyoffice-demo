<script setup lang="ts">
import { ref } from 'vue'
import { OnlyOfficeEditor } from 'wasm-onlyoffice-sdk/vue'
import type { OfficeTheme } from 'wasm-onlyoffice-sdk'

const ASSETS_PATH = '/v9.3.0.24-1'
const X2T_PATH = 'https://example.com/x2t'

type DocType = 'docx' | 'xlsx' | 'pptx'

const docType = ref<DocType>('docx')
const file = ref<File | null>(null)
const theme = ref<OfficeTheme>('theme-light')
const isDirty = ref(false)
const editorKey = ref(0)

function handleNewDoc(type: DocType) {
  file.value = null
  docType.value = type
  isDirty.value = false
  editorKey.value++
}

function handleOpenFile(e: Event) {
  const input = e.target as HTMLInputElement
  const f = input.files?.[0]
  if (!f) return
  file.value = f
  isDirty.value = false
  editorKey.value++
  input.value = ''
}

function handleThemeChange(e: Event) {
  theme.value = (e.target as HTMLSelectElement).value as OfficeTheme
  editorKey.value++
}

function handleSave(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  isDirty.value = false
}

function handleError(err: Error) {
  console.error('Editor error:', err)
}
</script>

<template>
  <div style="display:flex;flex-direction:column;width:100%;height:100%">
    <!-- Toolbar -->
    <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:#f5f5f5;border-bottom:1px solid #ddd;flex-shrink:0">
      <span style="font-weight:600;margin-right:4px">New:</span>
      <button v-for="t in ['docx','xlsx','pptx']" :key="t" @click="handleNewDoc(t as DocType)"
        style="padding:4px 10px;cursor:pointer">
        {{ t.toUpperCase() }}
      </button>

      <label style="margin-left:8px;padding:4px 10px;cursor:pointer;background:#fff;border:1px solid #ccc;border-radius:3px">
        Open File...
        <input type="file" style="display:none"
          accept=".docx,.xlsx,.pptx,.doc,.xls,.ppt,.odt,.ods,.odp,.pdf,.txt,.rtf,.csv"
          @change="handleOpenFile" />
      </label>

      <span style="margin-left:16px">Theme:</span>
      <select :value="theme" @change="handleThemeChange" style="padding:4px 6px">
        <option value="theme-light">Light</option>
        <option value="theme-classic-light">Classic Light</option>
        <option value="theme-white">White</option>
        <option value="theme-dark">Dark</option>
        <option value="theme-night">Night</option>
        <option value="theme-contrast-dark">Contrast Dark</option>
      </select>

      <span style="margin-left:auto;font-size:13px" :style="{ color: isDirty ? '#c00' : '#080' }">
        {{ isDirty ? '● Unsaved changes' : '✓ Saved' }}
      </span>
    </div>

    <!-- Editor -->
    <div style="flex:1;overflow:hidden">
      <OnlyOfficeEditor
        language="zh-CN"
        :key="editorKey"
        :assets-path="ASSETS_PATH"
        :x2t-path="X2T_PATH"
        v-bind="file ? { file } : { 'new-document': docType }"
        :theme="theme"
        :user="{ id: 'demo-user', name: 'Demo User' }"
        @document-state-change="(v: boolean) => isDirty = v"
        @save="handleSave"
        @error="handleError"
        style="width:100%;height:100%"
      />
    </div>
  </div>
</template>
