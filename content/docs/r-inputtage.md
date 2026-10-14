# RInputTags — usage

Register once (Nuxt: auto-imported from `~/components/RInputTags.vue`; plain Vue: `import RInputTags from './RInputTags.vue'`).

## 1. Plain free-text tags (mode="none", default UInputTags behaviour)

```vue
<script setup lang="ts">
const tags = ref<string[]>(['vue'])
</script>

<template>
  <RInputTags
    v-model="tags"
    placeholder="Enter tags..."
    add-on-blur
    add-on-tab
    :max="10"
  />
</template>
```

## 2. Local data source (static option list)

Mode is auto-detected as `local` because `options` is passed. Typing opens a
filtered dropdown; picking an item (or pressing Enter on a highlighted item)
adds it as a tag. `allow-custom="false"` restricts tags to the given list.

```vue
<script setup lang="ts">
const tags = ref<string[]>([])

const skillOptions = [
  { label: 'Vue.js', value: 'vue' },
  { label: 'Nuxt', value: 'nuxt' },
  { label: 'TypeScript', value: 'ts' },
  { label: 'TailwindCSS', value: 'tailwind' }
]
</script>

<template>
  <RInputTags
    v-model="tags"
    :options="skillOptions"
    option-label="label"
    option-value="value"
    :allow-custom="false"
    placeholder="Search skills..."
  />
</template>
```

## 3. API-backed data source (async search)

Mode is auto-detected as `api` because `fetch-options` is passed. Input is
debounced (`debounce`, default 300ms) before calling your function.

```vue
<script setup lang="ts">
const tags = ref<{ label: string; value: string }[]>([])

async function searchUsers(query: string) {
  const { data } = await $fetch('/api/users/search', { query: { q: query } })
  // must return TagValue[] — array of strings or objects
  return data.map((u: any) => ({ label: u.name, value: u.id }))
}
</script>

<template>
  <RInputTags
    v-model="tags"
    :fetch-options="searchUsers"
    option-label="label"
    option-value="value"
    :min-chars="2"
    :debounce="400"
    loading-text="Searching users..."
    no-results-text="No users found"
    @search="(q) => console.log('searching for', q)"
    @select-option="(opt) => console.log('picked', opt)"
  />
</template>
```

## 4. Inside a FormField, with custom item slot and a leading icon

```vue
<script setup lang="ts">
const tags = ref<string[]>(['Vue'])
</script>

<template>
  <UFormField label="Tags" required>
    <RInputTags
      v-model="tags"
      icon="i-lucide-tag"
      placeholder="Enter tags..."
      color="neutral"
      variant="subtle"
    >
      <template #item-text="{ item }">
        <span class="font-semibold">#{{ item }}</span>
      </template>
    </RInputTags>
  </UFormField>
</template>
```

## 5. Custom suggestion rendering

```vue
<template>
  <RInputTags v-model="tags" :options="skillOptions">
    <template #suggestion="{ option, label }">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-hash" class="size-4" />
        {{ label }}
      </div>
    </template>
  </RInputTags>
</template>
```

## Forwarded API surface

- **Props**: every `UInputTags` prop (`placeholder`, `color`, `variant`,
  `size`, `disabled`, `readonly`, `max`, `maxLength`, `delimiter`,
  `addOnPaste`, `addOnTab`, `addOnBlur`, `duplicate`, `icon`, `avatar`,
  `leading`/`leadingIcon`, `trailing`/`trailingIcon`, `loading`,
  `loadingIcon`, `deleteIcon`, `highlight`, `fixed`, `convertValue`,
  `displayValue`, `name`, `required`, `list`, `autocomplete`, `ui`,
  `class`, `defaultValue`, `modelValue`, ...) plus native `<input>`
  attributes.
- **Slots**: `leading`, `default`, `trailing`, `item-text`, `item-delete`
  (all forwarded as-is), plus a new `suggestion` slot for RInputTags'
  own dropdown.
- **Emits**: `change`, `blur`, `focus`, `update:modelValue`, `invalid`,
  `addTag`, `removeTag` (all forwarded as-is), plus `search` and
  `selectOption` for the data-integration layer.
- **Extra props**: `mode` (`auto` | `local` | `api` | `none`), `options`,
  `fetchOptions`, `optionLabel`, `optionValue`, `debounce`, `minChars`,
  `suggestionsLimit`, `allowCustom`, `loadingText`, `noResultsText`.
