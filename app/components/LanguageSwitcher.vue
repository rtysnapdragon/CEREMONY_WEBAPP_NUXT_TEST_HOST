<template>
  <div class="lang-wrapper" @click.stop>
    <!-- Toggle -->
    <div class="lang-trigger">
      <div
        class="lang-btn"
        @click="toggleDropdown"
        @mouseenter="tooltipShow"
        @mouseleave="tooltipHide"
      >
        <div v-if="currentFlag" class="flag-circle flag-circle--sm">
          <span :class="`fi fi-${currentFlag.toLowerCase()}`" class="flag-sprite" />
        </div>
        <span v-else class="lang-flag-emoji">{{ currentFlagEmoji }}</span>
      </div>
    </div>

    <!-- Dropdown -->
    <div v-if="isOpen" class="lang-dropdown" @click.stop>
      <ul class="lang-list">
        <li
          v-for="lang in displayLanguages"
          :key="lang.code"
          :class="['lang-item', lang.code === currentCode ? 'active' : '']"
          @click="switchTo(lang.code)"
        >
          <div v-if="lang.flag" class="flag-circle flag-circle--md">
            <span :class="`fi fi-${lang.flag.toLowerCase()}`" class="flag-sprite" />
          </div>
          <span v-else class="lang-item-emoji">{{ lang.flagEmoji }}</span>
          <span>{{ lang.name }}</span>
        </li>
      </ul>
    </div>

    <!-- Tooltip -->
    <div v-show="tooltipVisible" class="lang-tooltip">
      {{ tr('language_change') }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useCookie } from '#imports'
const { tr } = useTr()

const langStore        = useLanguageStore()
const translationStore = useTranslationStore()

const isOpen         = ref(false)
const tooltipVisible = ref(false)
const switching      = ref(false)

const dbLangCookie = useCookie('db_lang', {
  maxAge: 60 * 60 * 24 * 365,
  sameSite: 'lax',
  default: () => 'en',
})

const i18nRedirectedCookie = useCookie('i18n_redirected', {
  maxAge: 60 * 60 * 24 * 365,
  sameSite: 'lax',
  default: () => 'en',
})
// Single source of truth — db_lang cookie
const currentCode = computed({
  get: () => dbLangCookie.value || 'en',
  set: (val) => { dbLangCookie.value = val,i18nRedirectedCookie.value = val },
})

const flagEmoji = (code) =>
  code
    ? [...code.toUpperCase()].map(c => String.fromCodePoint(0x1F1E6 - 65 + c.charCodeAt(0))).join('')
    : ''

const FALLBACK_LANGUAGES = [
  { code: 'en', name: 'English', flag: 'GB', flagEmoji: '🇬🇧' },
  { code: 'km', name: 'ខ្មែរ',   flag: 'KH', flagEmoji: '🇰🇭' },
]

const displayLanguages = computed(() => {
  if (langStore.activeItems.length > 0) {
    return langStore.activeItems.map(l => ({
      code:      l.code,
      name:      l.nativeName || l.name,
      flag:      l.flag || '',
      flagEmoji: flagEmoji(l.flag),
    }))
  }
  return FALLBACK_LANGUAGES
})

const currentFlag = computed(
  () => displayLanguages.value.find(l => l.code === currentCode.value)?.flag || ''
)
const currentFlagEmoji = computed(
  () => displayLanguages.value.find(l => l.code === currentCode.value)?.flagEmoji || '🏳️'
)

function toggleDropdown() {
  isOpen.value = !isOpen.value
}

// All languages switch the same way — load from API, update cookie, done.
async function switchTo(code) {
  if (code === currentCode.value || switching.value) { isOpen.value = false; return }
  isOpen.value = false
  switching.value = true
  try {
    // Optional: preload translations before reload
    await translationStore.loadLanguage(code)
    currentCode.value = code
     dbLangCookie.value = code
    i18nRedirectedCookie.value = code

     // Force reload so Nuxt i18n picks up the new locale
    window.location.reload()
  } finally {
    switching.value = false
  }
}

function tooltipShow() { tooltipVisible.value = true }
function tooltipHide()  { tooltipVisible.value = false }

function handleClickOutside(e) {
  if (!e.target.closest('.lang-wrapper')) isOpen.value = false
}

onMounted(async () => {
  // Load languages list so all flags display correctly
  if (!langStore.items.length) await langStore.fetchLanguages()

  // Restore translation map if plugin hasn't loaded it yet
  const lang = dbLangCookie.value  || i18nRedirectedCookie.value || 'en'

  // Optional: normalize cookies on the client once
  if (dbLangCookie.value !== lang) dbLangCookie.value = lang
  if (i18nRedirectedCookie.value !== lang) i18nRedirectedCookie.value = lang
  
  if (translationStore.currentLang !== lang) {
    await translationStore.loadLanguage(lang)
  }
  
  window.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped lang="scss">
.lang-wrapper {
  position: relative;
  display: inline-block;
  text-align: left;

  .lang-trigger {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px !important;
    height: 20px !important;
    padding: 1px;
    border-radius: 999px;
    transition: background 0.2s ease;
    &:hover { background: #f1f5f9; }
    html.dark &:hover { background: #1e293b; }
  }

  .lang-btn {
    cursor: pointer;
    width: 20px !important;
    height: 20px !important;
  }

  .flag-circle {
    position: relative;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
    box-shadow: 0 0 0 1.5px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.14);

    &--sm { width: 20px; height: 20px; }
    &--md { width: 24px; height: 24px; }

    .flag-sprite {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 133% !important;
      height: 100% !important;
      transform: translate(-50%, -50%);
      background-size: cover !important;
      background-position: center !important;
    }
  }

  .lang-flag-emoji {
    font-size: 16px;
    line-height: 1;
  }

  .lang-dropdown {
    position: absolute;
    right: 0;
    z-index: 50;
    margin-top: 8px;
    min-width: 160px;
    border-radius: 16px;
    background: var(--c-surface, #fff);
    border: 1px solid var(--c-border, #f1f5f9);
    box-shadow: 0 10px 30px rgba(15,23,42,0.08);
    padding: 6px;
  }

  .lang-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .lang-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    font-size: 14px;
    border-radius: 12px;
    cursor: pointer;
    transition: background 0.2s ease, color 0.2s ease;
    color: var(--c-text, #374151);
    &:hover { background: var(--c-hover, #f1f5f9); }
    &.active {
      background: var(--c-hover, #f8fafc);
      color: var(--c-muted, #9ca3af);
      cursor: not-allowed;
    }
  }

  .lang-item-emoji {
    font-size: 18px;
    line-height: 1;
  }

  .lang-tooltip {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    margin-top: 8px;
    z-index: 50;
    padding: 6px 12px;
    font-size: 12px;
    white-space: nowrap;
    border-radius: 10px;
    background: var(--c-surface, #fafafa);
    color: var(--c-text);
    box-shadow: 0 4px 10px rgba(0,0,0,0.08);
  }
}
</style>
