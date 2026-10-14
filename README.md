# CEREMONY_WEBAPP_NUXT — Wedding Admin Dashboard

> Nuxt 4 SPA · Admin dashboard for managing weddings, guests, invitations, check-in, budget, and gallery.
> Backend: [WED_BUILDER_SERVER](https://github.com/RABUNTHOEUN/WED_BUILDER_SERVER) (Spring Boot 4 / Java 21)

---
npm install @thyrith/momentkh
## 🚀 Quick Run

### Development (local)

```bash
# 1. Copy and fill in env
cp .env.example .env   # set GOOGLE_CLIENT_ID, TELEGRAM_BOT_USERNAME

# 2. Install deps
npm install

# 3. Start dev server → http://localhost:3000
npm run dev
```

### Docker — frontend only (backend already running)

```bash
cd ..   # go to project root (WEDDING/)

# Build and start only the frontend container
docker compose up webapp --no-deps -d --build

# Check it's running
docker ps --filter name=wedding-webapp

# View logs
docker compose logs webapp -f

# Stop
docker compose stop webapp
```

### Docker — full stack (frontend + backend + DB)

```bash
cd ..   # project root (WEDDING/)
docker compose up -d --build
```

App runs at **http://localhost:3000** · API at **http://localhost:8080**

---

## ⚙️ Environment Variables

| Variable                | Description                            | Default                 |
| ----------------------- | -------------------------------------- | ----------------------- |
| `NUXT_PUBLIC_API_URL`   | Spring Boot API base URL               | `http://localhost:8080` |
| `GOOGLE_CLIENT_ID`      | Google OAuth client ID                 | —                       |
| `TELEGRAM_BOT_USERNAME` | Telegram bot username for login widget | `wedding001_bot`        |

---

[![Nuxt UI](https://img.shields.io/badge/Made%20with-Nuxt%20UI-00DC82?logo=nuxt&labelColor=020420)](https://ui.nuxt.com)

Use this template to get started with [Nuxt UI](https://ui.nuxt.com) quickly.

- [Live demo](https://starter-template.nuxt.dev/)
- [Documentation](https://ui.nuxt.com/docs/getting-started/installation/nuxt)

<a href="https://starter-template.nuxt.dev/" target="_blank">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://ui.nuxt.com/assets/templates/nuxt/starter-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="https://ui.nuxt.com/assets/templates/nuxt/starter-light.png">
    <img alt="Nuxt Starter Template" src="https://ui.nuxt.com/assets/templates/nuxt/starter-light.png" width="830" height="466">
  </picture>
</a>

> The starter template for Vue is on https://github.com/nuxt-ui-templates/starter-vue.

## Quick Start

```bash [Terminal]
npm create nuxt@latest -- -t github:nuxt-ui-templates/starter
```

## Deploy your own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-name=starter&repository-url=https%3A%2F%2Fgithub.com%2Fnuxt-ui-templates%2Fstarter&demo-image=https%3A%2F%2Fui.nuxt.com%2Fassets%2Ftemplates%2Fnuxt%2Fstarter-dark.png&demo-url=https%3A%2F%2Fstarter-template.nuxt.dev%2F&demo-title=Nuxt%20Starter%20Template&demo-description=A%20minimal%20template%20to%20get%20started%20with%20Nuxt%20UI.)

## Setup

Make sure to install the dependencies:

```bash
pnpm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

## Production

Build the application for production:

```bash
pnpm build
```

Locally preview production build:

```bash
pnpm preview
```

NuxtUI 4.1.x + Tailwind 4: This combination should work, but there are some version compatibility considerations.
npm install @nuxt/ui tailwindcss

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

```bash [npm]
npm install lucide-vue-next
npm install chart.js
npm install vue3-grid-layout
npm install @nuxtjs/i18n@next
npm install -D sass-embedded
npm install --save-dev sass sass-loader

npm install date-fns
npm install uuid
npm install jwt-decode
npm install @pinia/nuxt
npm install crypto-js
npm install @zxing/library
npm install flowbite-vue flowbite
npm install @vueuse/core
npm install remixicon
npm uninstall vite-plugin-node-polyfills
npm install html-to-image
npm uninstall image-compression
npm install @nuxt/content
npm remove @nuxtjs/tailwindcss flowbite flowbite-vue @tailwindcss/vite

npm install @popperjs/core
npm install lodash-es
npx nuxt upgrade
npm install -D @types/node
npm install vite@^6.0.0 --save-dev
npm install vite@latest --save-dev
npx nuxi@latest module add pinia

npm install xlsx
```



-----------------------
### Need Main App installation
```
//For RAi
npm install ai @ai-sdk/gateway @ai-sdk/vue
npm install @ai-sdk/gateway
```

---

"nuxt": "^3.16.0", // or latest
"vite": "^6.0.0", // or latest compatible
"@vitejs/plugin-vue": "latest"

### No package

"@tailwindcss/vite"
"@nuxtjs/tailwindcss"

---

## Recommand for specific version installation

## Nuxt UI specific version

## Remove current @nuxt/ui

npm remove @nuxt/ui@4.4.0 --save-exact

## Install specific version

npm install @nuxt/ui@4.4.0 --save-exact
npm install pinia


### 🚀 My suggestion (Important)

You are using Nuxt 4 + Tailwind 4 + NuxtUI 4.
DataTables is not the best choice anymore because it is jQuery-era.

Better modern options:

Library Works perfectly with Nuxt
TanStack Table ⭐ Best
AG Grid Enterprise
GridJS Simple
Nuxt UI Table Native

```
There is no tracking information for the current branch.
Please specify which branch you want to merge with.
See git-pull(1) for details.

    git pull <remote> <branch>

If you wish to set tracking information for this branch you can do so with:

    git branch --set-upstream-to=origin/<branch> main

Then command:
git pull
```

### NUXT 3 (FRONTEND PUSH) Firebase

npm install firebase

```
User Action
   ↓
Django API
   ├── Email OTP (Gmail SMTP)
   ├── Push (Firebase)
   ↓
User receives:
   📧 Email OTP
   🔔 Push Notification

```

\

```bash
I skimmed <UInputDate and I believe the issue is upstream from RekaUI, and in either way it might need big / precise modification.

However, in your case, I suggest making it Gregorian at the state level and only convert to Jalali at the display level, this might be the safest and best option here. There's a library for that: https://www.npmjs.com/package/jalaliday

Also, pass  locale="fa-IR" to UInputDate


<script setup lang="ts">
import { ref, computed } from 'vue'
import { fa_ir } from '@nuxt/ui/locale'
import dayjs from 'dayjs'
import jalaliday from 'jalaliday'

dayjs.extend(jalaliday)

const modelValue = ref(null)
const inputDate = ref(null)

// convert gregorian to jalali again if needed
const displayJalali = computed(() => {
  if (!modelValue.value) return ''
  return dayjs(modelValue.value)
    .calendar('jalali')
    .format('YYYY/MM/DD')
})
</script>

<template>
  <UApp :locale="fa_ir">
    <UContainer class="space-y-6 py-6">
      <div class="flex flex-col gap-6">
        <div class="flex items-center gap-6">
          <UInputDate ref="inputDate" v-model="modelValue" locale="fa-IR">
            <template #trailing>
              <UPopover :reference="inputDate?.inputsRef?.[3]?.$el">
                <UButton
                  color="neutral"
                  variant="link"
                  size="sm"
                  icon="i-lucide-calendar"
                  aria-label="Select a date"
                  class="px-0"
                />
                <template #content>
                  <UCalendar v-model="modelValue" locale="fa-IR" class="p-2" />
                </template>
              </UPopover>
            </template>
          </UInputDate>
        </div>

        <div class="space-y-2">
          <div>
            <span class="font-semibold">Gregorian (v-model):</span>
            {{ modelValue }}
          </div>
          <div>
            <span class="font-semibold">Jalali (converted):</span>
            {{ displayJalali }}
          </div>
        </div>
      </div>
    </UContainer>
  </UApp>
</template>


```
"# CEREMONY_WEBAPP_NUXT_TEST_HOST" 
"# CEREMONY_WEBAPP_NUXT_TEST_HOST" 
"# CEREMONY_WEBAPP_NUXT_TEST_HOST" 
