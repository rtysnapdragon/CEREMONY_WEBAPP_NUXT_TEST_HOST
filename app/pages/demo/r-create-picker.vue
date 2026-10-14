<template>
  <RCreatePicker
    v-model="activeType"
    @select="onCreate"
    @close="showPicker = false"
  />
</template>

<script setup>
definePageMeta({layout: 'navbar'});
// import { ref } from 'vue'
// const showPicker = ref(false)


//    import { defineComponent, ref } from 'vue'
//    import RCreatePicker from './r-create-picker.vue'

//    export default defineComponent({
//    components: { RCreatePicker },
//    data() {
//      return {
//        showPicker: false,
//        activeType: null,
//      }
//    },
//    methods: {
//      onCreate(type) {
//        this.activeType = type
//        this.showPicker = false

//        // Handle creation based on type
//        // For example:
//        // if (type === 'letter') navigateTo('/letters/new')
//        // if (type === 'table') navigateTo('/tables/new')
//        // if (type === 'contract') navigateTo('/contracts/new')
//      },
//    },
//    template: `
//    <div>
//      <button @click="showPicker = true">Create New</button>

//      <!-- RCreatePicker Component -->
//      <RCreatePicker
//        v-model="activeType"
//        @select="onCreate"
//        @close="showPicker = false"
//      />
//    </div>
//  `,
//  })
 </script>