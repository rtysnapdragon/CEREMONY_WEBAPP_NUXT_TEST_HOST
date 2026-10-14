<script setup>
import { ref } from 'vue'
definePageMeta({layout: 'navbar'})

const editorRef = ref()

const content = ref(`
<h1>Welcome to REditor</h1>

<p>
This editor supports <strong>HTML</strong>, Markdown, JSON,
mentions, emojis, slash commands, links, images, and more.
</p>
`)

const mentionItems = [
  {
    label: 'John Doe',
    avatar: '/avatars/john.png'
  },
  {
    label: 'Jane Smith',
    avatar: '/avatars/jane.png'
  },
  {
    label: 'Development Team'
  }
]

// Example custom TipTap extension(s)
const extraExtensions = [
  // Highlight,
  // CharacterCount,
]

// Example custom handler(s)
const extraHandlers = {
  customAction: {
    canExecute: editor => editor.isEditable,

    execute: editor => {
      editor
        .chain()
        .focus()
        .insertContent('⭐ Custom Action')
        .run()

      return editor.chain().focus()
    },

    isActive: () => false
  }
}

function onChange(value) {
  console.log('Content changed')
  console.log(value)
}

function onFocus() {
  console.log('Focused')
}

function onBlur() {
  console.log('Blurred')
}

function onImageUploaded({ file, src }) {
  console.log("File =====================> ",file)
  console.log("src =====================> ",src)
}

function focusEditor() {
  editorRef.value.focus()
}

function clearEditor() {
  editorRef.value.clear()
}

function insertText() {
  editorRef.value.insertContent(
    '<p><strong>Hello from REditor!</strong></p>'
  )
}

function setContent() {
  editorRef.value.setContent(`
    <h2>New Content</h2>
    <p>This content was inserted using setContent().</p>
  `)
}

function getHTML() {
  console.log(editorRef.value.getHTML())
}

function getJSON() {
  console.log(editorRef.value.getJSON())
}

function getText() {
  console.log(editorRef.value.getText())
}
</script>

<template>
  <div class="space-y-6">

    <div class="flex flex-wrap gap-2">
      <UButton @click="focusEditor">
        Focus
      </UButton>

      <UButton @click="clearEditor">
        Clear
      </UButton>

      <UButton @click="insertText">
        Insert Content
      </UButton>

      <UButton @click="setContent">
        Set Content
      </UButton>

      <UButton @click="getHTML">
        Get HTML
      </UButton>

      <UButton @click="getJSON">
        Get JSON
      </UButton>

      <UButton @click="getText">
        Get Text
      </UButton>
    </div>

    <REditor
      ref="editorRef"
      v-model="content"
      content-type="html"
      
    />

    <UCard>
      <template #header>
        Model Value
      </template>

      <pre class="text-xs whitespace-pre-wrap">{{ content }}</pre>
    </UCard>

    <UCard>
      <template #header>
        Real View
      </template>
      <div class="prose text-sm border border-dashed" v-html="content"></div>
    </UCard>
  </div>
</template>