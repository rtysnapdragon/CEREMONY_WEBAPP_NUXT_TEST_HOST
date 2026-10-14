<template>
  <canvas ref="canvas" />
</template>

<script setup>
import QRCode from 'qrcode'

const props = defineProps({
  value: { type: String, default: '' },
  size: { type: Number, default: 160 },
  color: { type: String, default: '#000000' },
  background: { type: String, default: '#ffffff' },
})

const canvas = ref(null)

async function render() {
  if (!canvas.value || !props.value) return
  await QRCode.toCanvas(canvas.value, props.value, {
    width: props.size,
    margin: 1,
    color: { dark: props.color, light: props.background },
  })
}

watch(() => [props.value, props.size], render)
onMounted(render)
</script>
