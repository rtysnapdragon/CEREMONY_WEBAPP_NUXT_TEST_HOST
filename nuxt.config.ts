import getOwnerComponentPaths from "./app/utils/getComponentPaths";
import NUXT_MODULE from "../NUXT_MODULES/WEBAPP_NUXT_MODULE/src/module";
import getComponentPaths from "../NUXT_MODULES/WEBAPP_NUXT_MODULE/src/runtime/app/utils/getComponentPaths";
import { resolve } from "node:path";
// import { resolve } from "pathe"
// nuxt.config.ts
import os from "os";

function getLocalIp() {
  const interfaces = os.networkInterfaces();

  for (const network of Object.values(interfaces)) {
    for (const iface of network || []) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }

  return "localhost";
}

export default defineNuxtConfig({
  compatibilityDate: "2026-06-18",
  future: { compatibilityVersion: 5 },

  modules: [
    "@nuxt/ui",
    "@nuxtjs/i18n",
    "@nuxt/eslint",
    "@vueuse/nuxt",
    "@pinia/nuxt",
    "@nuxt/content",
    NUXT_MODULE,
  ],
  ssr: false,

  devtools: { enabled: false },
  // devtools: process.env.NODE_ENV === "development" && false,
  devServer: {
    port: 3000,
    host: "0.0.0.0",
    https: {
      key: "./certs/localhost-key.pem",
      cert: "./certs/localhost.pem",
    },
  },
  components: [
    ...(getComponentPaths() ?? []),
    ...(getOwnerComponentPaths() ?? []),
    // ...(getLayersComponentPaths(layers) ?? []),
  ],
  content: {
    // documentDriven: true,
    build: {
      markdown: {
        toc: {
          depth: 3,
          searchDepth: 3,
        },
      },
    },
  },
  css: [
    "~/assets/css/main.css",
    "~/assets/styles/main.scss",
    "~/assets/css/flag-icons.css",
  ],
  imports: {
    dirs: [
      "./stores/**",
      // ...layers.map((l) => `../${l}/stores/**`)
    ],
  },
  ui: {
    // prefix: 'Nuxt',
    content: true,
    // global: true,
    theme: {
      colors: ["primary", "error"],
      // unstyled: true,
      // prefix: 'tw'
    },
    // global: false,
    // experimental: {
    //   componentDetection: true,
    //   // componentDetection: ['Modal', 'Dropdown', 'Popover']

    // }
  },
  // debug: true,
  // ui: {
  //   global: false,
  // },
  // components: getComponentPaths(),

  routeRules: {
    "/": { prerender: true },
  },

  i18n: {
    lazy: true,
    langDir: "locales",
    strategy: "no_prefix", // all languages share the same URLs — dynamic switching only
    defaultLocale: "en",
    locales: [
      {
        code: "en",
        name: "English",
        iso: "en-US",
        file: "en.json",
        flag: "/flags/gb.svg",
      },
      {
        code: "km",
        name: "ខ្មែរ",
        iso: "km-KH",
        file: "km.json",
        flag: "/flags/kh.svg",
      },
    ],
    detectBrowserLanguage: false, // we manage language via db_lang cookie ourselves
    compilation: {
      strictMessage: false,
      escapeHtml: false,
    },
  },
  plugins: ["./app/plugins/plugin.js", "./app/plugins/theme.client.ts"],

  app: {
    titleTemplate: "%s | — Sarika Wedding",
    rootId: "riththy", // Custom root element ID
    rootTag: "riththy-main", // Custom root element tag
    baseUrl: "/", // Base URL for routing
    buildAssetsDir: "_riththy", // Directory for build assets
    pageTransition: false,
    layoutTransition: false, // Disabled — out-in mode causes blank screen when layout switches
    head: {
      htmlAttrs: {
        lang: "en",
        dir: "ltr",
      },
      // titleTemplate: "%s — Sarika Wedding",
      title: "Wedding Ceremony Management",
      bodyAttrs: {
        class: "riththy-main", // Custom class for body element
      },
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content: "Premium event management platform",
        },
        {
          property: "og:title",
          content: "Sarika Event Management",
        },
        {
          property: "og:description",
          content: "Premium event management platform",
        },
        { property: "og:type", content: "website" },
        {
          name: "theme-color",
          content: "#111111",
        },
      ],
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=Noto+Serif+Khmer:wght@300;400;500&display=swap",
        },
        // Recommended: Phosphor Icons (modern, lightweight) or Remix Icon
        // {
        //   rel: "stylesheet",
        //   href: "https://cdnjs.cloudflare.com/ajax/libs/remixicon/4.6.0/remixicon.css",
        // },
        {
          rel: "stylesheet",
          href: "https://cdn.jsdelivr.net/npm/remixicon@4.9.1/fonts/remixicon.min.css",
        },
        // {
        //   rel: "stylesheet",
        //   href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css",
        // },
        // {
        //   rel: "stylesheet",
        //   href: "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css",
        // },
        // {
        //   rel: "stylesheet",
        //   href: "https://cdn.jsdelivr.net/npm/boxicons@2.1.4/css/boxicons.min.css",
        // },
        // {
        //   rel: "stylesheet",
        //   href: "https://cdn.jsdelivr.net/npm/phosphor-icons@1.4.2/src/css/icons.css",
        // },
        // { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.1/css/all.min.css' },
        // { rel: 'stylesheet', href: 'https://unpkg.com/@fortawesome/fontawesome-free@6.5.1/css/all.min.css' }
      ],
      // script: [{ src:"https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4",defer: true}], // npm install jquery jquery-confirm
    },
  },

  vite: {
    resolve: {
      dedupe: [
        "@tiptap/core",
        "@tiptap/pm",
        "@tiptap/vue-3",
        "prosemirror-view",
        "prosemirror-transform",
        "prosemirror-state",
        "prosemirror-model",
      ],
    },
    optimizeDeps: {
      include: [
        // // Core ProseMirror / Tiptap (critical for REditor + Completion)
        // 'prosemirror-state',
        // 'prosemirror-transform',
        // 'prosemirror-model',
        // 'prosemirror-view',
        // 'prosemirror-gapcursor',
        // 'prosemirror-keymap',

        "@tiptap/core",
        "@tiptap/pm/state",
        "@tiptap/pm/transform",
        "@tiptap/pm/model",
        "@tiptap/pm/view",
        "@tiptap/pm/gapcursor",
        "@tiptap/pm/keymap",

        // Nuxt UI editor dependencies
        "@nuxt/ui > prosemirror-state",
        "@nuxt/ui > prosemirror-transform",
        "@nuxt/ui > prosemirror-model",
        "@nuxt/ui > prosemirror-view",
        "@nuxt/ui > prosemirror-gapcursor",
        "@nuxt/ui > prosemirror-keymap",

        // AI / Completion
        "@ai-sdk/gateway",
        "@ai-sdk/vue",
        "@ai-sdk/provider-utils",

        "axios",
        "pinia",
        "@tiptap/core",
        "uuid",

        // "@nuxt/ui",
        // "@vue/devtools-core",
        // "@vue/devtools-kit",
        // // Add these if you use them frequently
        // "vue",
        "pinia",
        "@pinia/nuxt",
      ],
      // Exclude large dependencies that are already ESM and rarely change
      exclude: [
        // Add if you encounter issues
        "@tailwindcss/vite",
        "@tailwindcss/oxide",
      ],
    },
    server: {
      fs: {
        allow: [resolve(__dirname, "../NUXT_MODULES/WEBAPP_NUXT_MODULE")],
      },
    },
    // plugins: [
    //   require('@tailwindcss/vite')()
    // ],
    build: {
      //Force ESM for the config / Vite
      target: "esnext", // or 'modules'
    },
    // Add this to help with module handling
    define: {
      "import.meta.vitest": "undefined", // if using vitest
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
          @use "~/assets/styles/_variables.scss" as *;
          @use "~/assets/styles/_mixins.scss" as *;
        `,
        },
      },
    },
    // Improve build performance
    // server: {
    //   warmup: {
    //     clientFiles: [
    //       './pages/**/*.vue',
    //       './components/**/*.vue',
    //       './app.vue',
    //     ],
    //   },
    // },
  },
  // eslint: {
  //   config: {
  //     stylistic: {
  //       commaDangle: "never",
  //       braceStyle: "1tbs",
  //     },
  //   },
  // },

  runtimeConfig: {
    public: {
      googleClientId:
        process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID ||
        process.env.GOOGLE_CLIENT_ID ||
        "",
      telegramBotUsername:
        process.env.NUXT_PUBLIC_TELEGRAM_BOT_USERNAME ||
        process.env.TELEGRAM_BOT_USERNAME ||
        "",
      facebookAppId:
        process.env.NUXT_PUBLIC_FACEBOOK_APP_ID ||
        process.env.FACEBOOK_APP_ID ||
        "",
      tiktokClientKey:
        process.env.NUXT_PUBLIC_TIKTOK_CLIENT_KEY ||
        process.env.TIKTOK_CLIENT_KEY ||
        "",
      // apiUrl: process.env.NUXT_PUBLIC_API_URL || process.env.API_URL || '',

      apiUrl: `http://${getLocalIp()}:8080`,
      webUrl: `http://localhost:3000`,
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      googleApiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    },
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    googleApiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  },
  colorMode: {
    classSuffix: "",
    preference: "system",
    fallback: "dark",
    storageKey: "sarika-color-mode",
  },
  pinia: {
    storesDirs: [
      "./stores/**",
      //  './custom-folder/stores/**'
    ],
  },
  typescript: {
    strict: true,
    typeCheck: false, // Keep false for dev performance
    shim: false,
  },
  // tailwindcss: { // need comment because your CSS already uses:: :@source "../../../content/**/*";
  //   config: {
  //     content: [
  //       "./app/**/*.{vue,js,ts}",
  //       "./components/**/*.{vue,js,ts}",
  //       "./pages/**/*.{vue,js,ts}",
  //     ],
  //   },
  // },

  // Add experimental features for better performance
  experimental: {
    optimizeDeps: true, // Enable for Nuxt 4
    resetAsyncData: true,
  },

  // Reduce logging in production
  telemetry: false,
});
