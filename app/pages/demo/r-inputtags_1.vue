
<script setup lang="ts">
/**
 * RInputTags1 — Usage Examples
 * Covers every scenario: local, async, form, custom slots, validation, search
 */
import { z } from 'zod'

// ── 1. Local plain strings ─────────────────────────────────────────────────
const localTags = ref<string[]>(['Vue', 'Nuxt'])

// ── 2. Local object suggestions with custom displayValue ──────────────────
interface Language { code: string; label: string }
const langSuggestions: Language[] = [
  { code: 'km', label: 'ខ្មែរ (Khmer)' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'th', label: 'ภาษาไทย' },
]
const selectedLangs = ref<Language[]>([])

// ── 3. Async suggestions (simulated API) ─────────────────────────────────
const asyncTags   = ref<string[]>([])
const asyncLoading = ref(false)

async function fetchTags(query: string): Promise<string[]> {
  // Simulate API call
  await new Promise(r => setTimeout(r, 600))
  const all = ['Cambodia', 'Phnom Penh', 'Siem Reap', 'Battambang', 'Kampot',
               'Wedding', 'Ceremony', 'Anniversary', 'Birthday', 'Graduation']
  return all.filter(s => s.toLowerCase().includes(query.toLowerCase()))
}

// ── 4. Form integration with UForm + Zod ─────────────────────────────────
const formSchema = z.object({
  name:  z.string().min(1, 'Name is required'),
  tags:  z.array(z.string()).min(1, 'Add at least one tag'),
  skills: z.array(z.string()).max(5, 'Maximum 5 skills allowed'),
})

const formState = reactive({
  name:   '',
  tags:   [] as string[],
  skills: [] as string[],
})

function onFormSubmit({ data }: { data: typeof formState }) {
  console.log('Form submitted:', data)
}

const skillOptions = ['Vue', 'Nuxt', 'React', 'TypeScript', 'SCSS', 'Node.js', 'Python', 'Docker']

// ── 5. Duplicate + delimiter + addOnPaste ─────────────────────────────────
const pastedTags = ref<string[]>([])

// ── 6. No createNew (strict suggestions only) ────────────────────────────
const strictTags   = ref<string[]>([])
const strictOptions = ['PENDING', 'PLANNING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']

// ── 7. Max tags ────────────────────────────────────────────────────────────
const maxTags = ref<string[]>([])

// ── 8. Custom delete icon + size ──────────────────────────────────────────
const customIconTags = ref(['Design', 'Development'])

const basicTags = ref<string[]>(['Vue'])

const skillTags = ref<string[]>([])

const customTags = ref<string[]>([])

const userTags = ref<{ label: string; value: string }[]>([])

const skillOptions2 = [
  { label: 'Vue.js', value: 'vue' },
  { label: 'Nuxt', value: 'nuxt' },
  { label: 'TypeScript', value: 'ts' },
  { label: 'TailwindCSS', value: 'tailwind' }
]

// async function searchUsers(query: string) {
//   const { data } = await useHttp('/api/users/search', {
//     data: { q: query }
//   })

//   return data.map((u: any) => ({
//     label: u.name,
//     value: u.id
//   }))
// }
async function searchUsers(query: string) {
  const { users } = await useHttp(
    `https://dummyjson.com/users/search?q=${encodeURIComponent(query)}`
  )

  return users.map((u: any) => ({
    label: `${u.firstName} ${u.lastName}`,
    value: String(u.id)
  }))
}
async function searchUsers1(query: string) {
  const { results } = await useHttp('https://randomuser.me/api/?results=20')

  return results
    .filter((u: any) =>
      `${u.name.first} ${u.name.last}`
        .toLowerCase()
        .includes(query.toLowerCase())
    )
    .map((u: any) => ({
      label: `${u.name.first} ${u.name.last}`,
      value: u.login.uuid
    }))
}
definePageMeta({layout: 'navbar'})

</script>

<template>
  <RWrapperPage class="examples-wrap">
    <h2 class="examples-title">RInputTags1 — Usage Examples</h2>

    <!-- ── 1. Basic local ────────────────────────────────────────────────── -->
    <section class="example">
      <h3>1. Basic — local free-text tags</h3>
      <p>Type anything and press Enter (or comma) to add.</p>
      <RInputTags1 trailingIcon='ri-edit-line'
        v-model="localTags"
        placeholder="Add tags..."
        :add-on-paste="true"
        delimiter=","
      />
      <code>{{ localTags }}</code>
    </section>

    <!-- ── 2. Local suggestions with object values ────────────────────── -->
    <section class="example">
      <h3>2. Local suggestions — object values</h3>
      <p>
        Dropdown appears when typing. Uses <code>displayValue</code> to render
        and <code>convertValue</code> to store.
      </p>
      <RInputTags1
        v-model="selectedLangs"
        placeholder="Search languages..."
        :suggestions="langSuggestions"
        :display-value="(l: Language) => l.label"
        :convert-value="(s: string) => langSuggestions.find(l => l.label === s) ?? { code: s, label: s }"
        :filter-fn="(l: Language, q: string) => l.label.toLowerCase().includes(q.toLowerCase())"
        :create-new="false"
        icon="ri-global-line"
      />
      <code>{{ selectedLangs.map(l => l.code).join(', ') }}</code>
    </section>

    <!-- ── 3. Async suggestions ─────────────────────────────────────────── -->
    <section class="example">
      <h3>3. Async suggestions — debounced API search</h3>
      <p>
        <code>fetchSuggestions</code> fires 300ms after each keystroke.
        Results from a simulated API are shown in the dropdown.
      </p>
      <RInputTags1
        v-model="asyncTags"
        placeholder="Search places or events..."
        :fetch-suggestions="fetchTags"
        :debounce="300"
        :create-new="true"
        icon="ri-search-line"
        empty-label="No matching locations"
        @fetch:start="(q) => console.log('fetching:', q)"
        @fetch:done="(r) => console.log('results:', r)"
      >
        <template #suggestion="{ item, query }">
          <i class="ri-map-pin-line" style="margin-right: 6px; color: var(--c-accent)" />
          <span v-html="item.replace(new RegExp(`(${query})`, 'gi'), '<strong>$1</strong>')" />
        </template>
      </RInputTags1>
      <code>{{ asyncTags }}</code>
    </section>

    <!-- ── 4. Form integration with Zod validation ───────────────────── -->
    <section class="example">
      <h3>4. Form integration — Zod validation</h3>
      <UForm :schema="formSchema" :state="formState" @submit="onFormSubmit">
        <UFormField name="name" label="Event name" required>
          <RInput v-model="formState.name" placeholder="My Wedding" />
        </UFormField>

        <UFormField name="tags" label="Tags (min 1)" required>
          <RInputTags1
            v-model="formState.tags"
            name="tags"
            placeholder="Add tags..."
            :highlight="formState.tags.length === 0"
          />
        </UFormField>

        <UFormField name="skills" label="Skills (max 5)">
          <RInputTags1
            v-model="formState.skills"
            placeholder="Choose skills..."
            :suggestions="skillOptions"
            :create-new="false"
            :max="5"
            @invalid="(v) => console.warn('Max reached:', v)"
          />
        </UFormField>

        <RBtn type="submit" label="Submit" icon="ri-check-line" variant="solid" color="primary" />
      </UForm>
    </section>

    <!-- ── 5. Paste + duplicate + delimiter ─────────────────────────────── -->
    <section class="example">
      <h3>5. Paste, duplicates allowed, comma delimiter</h3>
      <p>Paste <code>a,b,c</code> — all three become tags. Duplicates are allowed.</p>
      <RInputTags1
        v-model="pastedTags"
        placeholder="Paste CSV values..."
        :add-on-paste="true"
        :add-on-tab="true"
        :add-on-blur="true"
        :duplicate="true"
        delimiter=","
        size="lg"
      />
    </section>

    <!-- ── 6. Strict — no createNew ─────────────────────────────────────── -->
    <section class="example">
      <h3>6. Strict suggestions — no free-text allowed</h3>
      <p>Only values from the suggestions list can be added.</p>
      <RInputTags1
        v-model="strictTags"
        placeholder="Choose a status..."
        :suggestions="strictOptions"
        :create-new="false"
        variant="soft"
        color="neutral"
      />
    </section>

    <!-- ── 7. Max tags + max-length ──────────────────────────────────────── -->
    <section class="example">
      <h3>7. Max 3 tags, max 10 chars per tag</h3>
      <RInputTags1
        v-model="maxTags"
        placeholder="Add up to 3..."
        :max="3"
        :max-length="10"
        size="sm"
        @invalid="(v) => alert(`Cannot add: ${v}`)"
      />
    </section>

    <!-- ── 8. Custom delete icon + sizes + variants ───────────────────── -->
    <section class="example">
      <h3>8. Custom delete icon · all variants</h3>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <RInputTags1 v-model="customIconTags" delete-icon="ri-close-circle-fill" variant="outline" placeholder="outline" />
        <RInputTags1 v-model="customIconTags" delete-icon="ri-delete-bin-line"  variant="soft"    placeholder="soft" />
        <RInputTags1 v-model="customIconTags" delete-icon="ri-subtract-line"    variant="subtle"  placeholder="subtle" />
        <RInputTags1 v-model="customIconTags" delete-icon="ri-close-line"       variant="ghost"   placeholder="ghost" />
      </div>
    </section>

    <!-- ── 9. Disabled + readonly ────────────────────────────────────────── -->
    <section class="example">
      <h3>9. Disabled &amp; readonly</h3>
      <RInputTags1 :model-value="['locked', 'tag']" disabled placeholder="Disabled" />
      <RInputTags1 :model-value="['readonly', 'tag']" readonly placeholder="Readonly" style="margin-top: 8px" />
    </section>

    <!-- ── 10. Leading avatar + trailing loading ──────────────────────── -->
    <section class="example">
      <h3>10. Avatar leading + loading state</h3>
      <RInputTags1
        v-model="localTags"
        :avatar="{ src: 'https://github.com/vuejs.png', loading: 'lazy' }"
        :loading="true"
        :trailing="true"
        placeholder="Vue tags..."
        variant="outline"
        size="xl"
      />
    </section>
<!-- Free text -->
  <RInputTags1
    v-model="basicTags"
    placeholder="Enter tags..."
    add-on-blur
    add-on-tab
    :max="10"
  />

  <!-- Async search -->
  <RInputTags1
    v-model="userTags"
    :fetch-options="searchUsers"
    option-label="label"
    option-value="value"
    :min-chars="2"
    :debounce="400"
    loading-text="Searching users..."
    no-results-text="No users found"
  />

  <!-- Static options -->
  <RInputTags1
    v-model="skillTags"
    :options="skillOptions2"
    option-label="label"
    option-value="value"
    dropdownUi="nuxtui"
    :allow-custom="false"
    placeholder="Search skills..."
  />

  <!-- Custom item -->
  <RInputTags1
    v-model="customTags"
    icon="i-lucide-tag"
    placeholder="Enter tags..."
  >
    <template #item-text="{ item }">
      <span class="font-semibold">#{{ item }}</span>
    </template>
  </RInputTags1>

  <!-- Custom suggestion -->
  <RInputTags1
    v-model="skillTags"
    :options="skillOptions2"
    dropdownUi="nuxtui"
  >
    <template #suggestion="{ label }">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-hash" class="size-4" />
        {{ label }}
      </div>
    </template>
  </RInputTags1>
  </RWrapperPage>
</template>

<style lang="scss">
.examples-wrap {
  display:        flex;
  flex-direction: column;
  gap:            var(--sp-8);
  padding:        var(--sp-6);
  max-width:      600px;
  font-family:    var(--font-fallback);
}

.examples-title {
  font-size:   1.25rem;
  font-weight: 800;
  color:       var(--c-text);
  margin:      0;
  letter-spacing: -0.02em;
}

.example {
  display:        flex;
  flex-direction: column;
  gap:            var(--sp-2);
  padding:        var(--sp-4);
  border-radius:  var(--r-lg);
  border:         1px solid var(--c-border);
  background:     color-mix(in srgb, var(--c-surface) 55%, transparent);

  h3 {
    font-size:   0.875rem;
    font-weight: 700;
    color:       var(--c-text);
    margin:      0;
  }

  p {
    font-size:   0.8rem;
    color:       var(--c-muted);
    margin:      0;
    line-height: 1.5;
  }

  code {
    font-size:     0.72rem;
    background:    color-mix(in srgb, var(--c-muted) 10%, transparent);
    border:        1px solid var(--c-border);
    border-radius: var(--r-sm);
    padding:       var(--sp-1) var(--sp-2);
    color:         var(--c-muted);
    font-family:   ui-monospace, monospace;
    white-space:   pre-wrap;
    word-break:    break-all;
  }
}
</style>