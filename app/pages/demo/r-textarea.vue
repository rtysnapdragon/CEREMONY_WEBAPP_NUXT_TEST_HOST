<template>
  <div class="demo">
    <h1>AI Translation Demo</h1>

    <div class="controls">
      <label>
        Source language:
        <select v-model="from">
          <option value="auto">Auto</option>
          <option value="en">English</option>
          <option value="km">Khmer</option>
        </select>
      </label>

      <label>
        Target language:
        <select v-model="to">
          <option value="auto">Auto</option>
          <option value="en">English</option>
          <option value="km">Khmer</option>
        </select>
      </label>

      <label>
        <input type="checkbox" v-model="replace" />
        Replace text directly
      </label>

      <label>
        Context:
        <input v-model="context" placeholder="e.g., medical, legal" />
      </label>
    </div>

    <RTextarea
      v-model="text"
      :ai="true"
      :ai-from="from"
      :ai-to="to"
      :ai-replace="replace"
      :ai-context="context"
      rows="6"
      placeholder="Type something to translate…"
      @ai-translated="onTranslated"
      @ai-error="onError"
    />

    <pre v-if="lastResult" class="result">
      Original: {{ lastResult.original }}
      Translated: {{ lastResult.translated }}
      From: {{ lastResult.from }} → To: {{ lastResult.to }}
    </pre>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const text = ref('Hello, how are you?')
const from = ref('auto')
const to = ref('km')
const replace = ref(true)
const context = ref('')
const lastResult = ref(null)

function onTranslated(result) {
  lastResult.value = result
}

function onError({ error }) {
  alert('Translation failed: ' + error)
}
</script>

<style scoped>
.demo {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
}
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}
.controls label {
  display: flex;
  align-items: center;
  gap: 8px;
}
.result {
  margin-top: 20px;
  padding: 12px;
  background: #f0f4ff;
  border-radius: 8px;
  white-space: pre-wrap;
}
</style>