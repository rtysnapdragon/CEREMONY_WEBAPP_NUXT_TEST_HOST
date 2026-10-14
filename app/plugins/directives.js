// plugins/directives.js — Custom Vue directives

export default defineNuxtPlugin((nuxtApp) => {
  // v-click-outside directive
  nuxtApp.vueApp.directive('click-outside', {
    beforeMount(el, binding) {
      el._clickOutsideHandler = (event) => {
        if (!el.contains(event.target)) {
          binding.value(event)
        }
      }
      document.addEventListener('pointerdown', el._clickOutsideHandler)
    },
    unmounted(el) {
      document.removeEventListener('pointerdown', el._clickOutsideHandler)
    },
  })

  // v-focus directive
  nuxtApp.vueApp.directive('focus', {
    mounted(el) {
      el.focus()
    },
  })

  // v-tooltip directive (basic title tooltip)
  nuxtApp.vueApp.directive('tooltip', {
    beforeMount(el, binding) {
      el.setAttribute('title', binding.value)
    },
    updated(el, binding) {
      el.setAttribute('title', binding.value)
    },
  })
})
