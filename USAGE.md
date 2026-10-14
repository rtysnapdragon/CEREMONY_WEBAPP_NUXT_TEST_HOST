


### Component usages
1. Toast custom
```
<script setup>
const { success, error, info, warning } = useAppToast()

// Simple usage
info('Chat deleted')

// With description
error('Failed to delete chat', {
  description: 'Please try again later'
})

// Full control
success('Payment successful', {
  description: 'Your order has been processed',
  timeout: 6000
})
</script>

```
