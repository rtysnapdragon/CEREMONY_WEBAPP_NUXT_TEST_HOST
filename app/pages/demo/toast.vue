

<template>
  <div class="demo-container">
    <h1 class="demo-title">🍞 RToast Demo</h1>
    <p class="demo-subtitle">Click any button to show a toast notification</p>

    <div class="demo-grid">
      <!-- Success -->
      <button class="demo-btn demo-btn-success" @click="showSuccess">
        <i class="ri-checkbox-circle-fill" />
        Success
      </button>

      <!-- Error -->
      <button class="demo-btn demo-btn-error" @click="showError">
        <i class="ri-close-circle-fill" />
        Error
      </button>

      <!-- Loading -->
      <button class="demo-btn demo-btn-loading" @click="showLoading">
        <i class="ri-loader-4-line" />
        Loading
      </button>

      <!-- Countdown -->
      <button class="demo-btn demo-btn-countdown" @click="showCountdown">
        <i class="ri-time-fill" />
        Countdown
      </button>

      <!-- Progress -->
      <button class="demo-btn demo-btn-progress" @click="showProgress">
        <i class="ri-bar-chart-box-fill" />
        Progress
      </button>

      <!-- Multistep -->
      <button class="demo-btn demo-btn-multistep" @click="showMultistep">
        <i class="ri-git-merge-fill" />
        Multistep
      </button>

      <!-- Action -->
      <button class="demo-btn demo-btn-action" @click="showAction">
        <i class="ri-cursor-fill" />
        Action
      </button>

      <!-- Gradient -->
      <button class="demo-btn demo-btn-gradient" @click="showGradient">
        <i class="ri-magic-fill" />
        Gradient
      </button>

      <!-- Safety -->
      <button class="demo-btn demo-btn-safety" @click="showSafety">
        <i class="ri-shield-check-fill" />
        Safety
      </button>

      <!-- Streaming -->
      <button class="demo-btn demo-btn-streaming" @click="showStreaming">
        <i class="ri-sparkling-fill" />
        Streaming
      </button>

      <!-- Pipeline -->
      <button class="demo-btn demo-btn-pipeline" @click="showPipeline">
        <i class="ri-cpu-fill" />
        Pipeline
      </button>

      <!-- Custom -->
      <button class="demo-btn demo-btn-custom" @click="showCustom">
        <i class="ri-settings-4-line" />
        Custom
      </button>

      <!-- Clear All -->
      <button class="demo-btn demo-btn-clear" @click="clearAll">
        <i class="ri-delete-bin-line" />
        Clear All
      </button>
    </div>

    <!-- Active Toasts Counter -->
    <div class="demo-counter" v-if="toastCount > 0">
      <i class="ri-notification-3-line" />
      {{ toastCount }} active toast{{ toastCount > 1 ? 's' : '' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
definePageMeta({layout:'navbar'})

const toast = useRToast()

// Count active toasts
const toastCount = computed(() => toast.toasts.value.length)

// 1. Success Toast
function showSuccess() {
  toast.add({
    type: 'success',
    title: 'Operation Successful! 🎉',
    icon:'ri-check-circle-fill',
    description: 'Your data has been saved successfully.',
    badges: ['Completed', 'Verified'],
    duration: 5000
  })
}

// 2. Error Toast
function showError() {
  toast.add({
    type: 'error',
    title: 'Operation Failed! ❌',
    description: 'Please check your internet connection and try again.',
    badges: ['Error 500', 'Critical'],
    duration: 6000
  })
}

// 3. Loading Toast
function showLoading() {
  const loadingToast = toast.add({
    type: 'loading',
    title: 'Processing Your Request...',
    description: 'Please wait while we process your data.',
    duration: 0 // Never auto-close
  })

  // Simulate loading completion after 5 seconds
  setTimeout(() => {
    toast.remove(loadingToast.id)
    toast.add({
      type: 'success',
      title: 'Processing Complete! ✅',
      description: 'Your request has been processed successfully.',
      duration: 4000
    })
  }, 5000)
}

// 4. Countdown Toast
function showCountdown() {
  const countdownValue = 30
  const toastItem = toast.add({
    type: 'countdown',
    title: 'Session Expiring Soon ⏰',
    description: 'Your session will expire in 30 seconds.',
    countdown: countdownValue,
    duration: countdownValue * 1000,
    showProgress: true,
    progressPosition: 'bottom'
  })

  // Update countdown every second
  let remaining = countdownValue
  const interval = setInterval(() => {
    remaining--
    if (remaining > 0 && toastItem) {
      // Update the toast item with new countdown
      const index = toast.toasts.value.findIndex(t => t.id === toastItem.id)
      if (index !== -1) {
        toast.toasts.value[index].countdown = remaining
      }
    } else {
      clearInterval(interval)
    }
  }, 1000)
}

// 5. Progress Toast
function showProgress() {
  const progressToast = toast.add({
    type: 'progress',
    title: 'Uploading File 📤',
    description: 'Uploading large file... 0%',
    progress: 0,
    duration: 0 // Never auto-close
  })

  // Simulate progress updates
  let progress = 0
  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 10) + 1
    if (progress >= 100) {
      progress = 100
      clearInterval(interval)
      
      // Update description
      const index = toast.toasts.value.findIndex(t => t.id === progressToast.id)
      if (index !== -1) {
        toast.toasts.value[index].description = 'Upload complete! ✅'
      }
      
      // Auto close after 2 seconds
      setTimeout(() => {
        toast.remove(progressToast.id)
      }, 2000)
    }
    
    // Update progress
    const index = toast.toasts.value.findIndex(t => t.id === progressToast.id)
    if (index !== -1) {
      toast.toasts.value[index].progress = progress
      toast.toasts.value[index].description = `Uploading large file... ${progress}%`
    }
  }, 500)
}

// 6. Multistep Toast
function showMultistep() {
  const steps = [
    { label: 'Initialize', status: 'done' },
    { label: 'Build', status: 'done' },
    { label: 'Test', status: 'active' },
    { label: 'Deploy', status: 'pending' },
    { label: 'Verify', status: 'pending' }
  ]

  const multistepToast = toast.add({
    type: 'multistep',
    title: 'Deployment Pipeline 🚀',
    description: 'Deploying application to production',
    steps: steps,
    duration: 0
  })

  // Simulate step progression
  let currentStep = 2 // Index of active step
  const interval = setInterval(() => {
    if (currentStep < steps.length - 1) {
      // Mark current as done
      steps[currentStep].status = 'done'
      // Move to next
      currentStep++
      steps[currentStep].status = 'active'
      
      // Update toast
      const index = toast.toasts.value.findIndex(t => t.id === multistepToast.id)
      if (index !== -1) {
        toast.toasts.value[index].steps = [...steps]
        toast.toasts.value[index].description = `Step ${currentStep + 1} of ${steps.length}: ${steps[currentStep].label}`
      }
    } else {
      // All steps done
      steps[currentStep].status = 'done'
      clearInterval(interval)
      
      const index = toast.toasts.value.findIndex(t => t.id === multistepToast.id)
      if (index !== -1) {
        toast.toasts.value[index].steps = [...steps]
        toast.toasts.value[index].description = 'Deployment complete! ✅'
      }
      
      setTimeout(() => {
        toast.remove(multistepToast.id)
      }, 3000)
    }
  }, 2000)
}

// 7. Action Toast
function showAction() {
  toast.add({
    type: 'action',
    title: 'Update Available! 🔄',
    description: 'A new version of the application is ready to install.',
    action: {
      label: 'Update Now',
      icon: 'ri-download-line',
      onClick: () => {
        toast.add({
          type: 'success',
          title: 'Update Started! 📥',
          description: 'Downloading update...',
          duration: 3000
        })
      }
    },
    duration: 8000
  })
}

// 8. Gradient Toast
function showGradient() {
  toast.add({
    type: 'gradient',
    title: '✨ Premium Feature Unlocked!',
    description: 'You now have access to all premium features.',
    icon: 'ri-star-fill',
    duration: 5000
  })
}

// 9. Safety Toast
function showSafety() {
  toast.add({
    type: 'safety',
    title: '🔒 Security Check Passed',
    description: 'All systems are secure and encrypted.',
    badges: ['Secure', 'Encrypted', 'Verified'],
    duration: 5000
  })
}

// 10. Streaming Toast
function showStreaming() {
  const streamingTexts = [
    'Initializing data stream...',
    'Connecting to server...',
    'Receiving data packets...',
    'Processing data in real-time...',
    'Analyzing patterns...',
    'Stream complete! ✅'
  ]

  const streamingToast = toast.add({
    type: 'streaming',
    title: 'Live Data Stream 📡',
    streamText: streamingTexts[0],
    duration: 0
  })

  let index = 0
  const interval = setInterval(() => {
    index++
    if (index < streamingTexts.length) {
      const toastIndex = toast.toasts.value.findIndex(t => t.id === streamingToast.id)
      if (toastIndex !== -1) {
        toast.toasts.value[toastIndex].streamText = streamingTexts[index]
      }
    } else {
      clearInterval(interval)
      setTimeout(() => {
        toast.remove(streamingToast.id)
        toast.add({
          type: 'success',
          title: 'Stream Complete! ✅',
          description: 'All data has been processed successfully.',
          duration: 3000
        })
      }, 1000)
    }
  }, 1500)
}

// 11. Pipeline Toast
function showPipeline() {
  const pipelineToast = toast.add({
    type: 'pipeline',
    title: 'AI Pipeline Processing 🧠',
    description: 'Processing data through AI pipeline',
    duration: 0
  })

  // Simulate pipeline stages
  const stages = ['Tokenizing', 'Embedding', 'Classifying', 'Analyzing', 'Complete']
  let stageIndex = 0
  
  const interval = setInterval(() => {
    stageIndex++
    if (stageIndex < stages.length) {
      const index = toast.toasts.value.findIndex(t => t.id === pipelineToast.id)
      if (index !== -1) {
        toast.toasts.value[index].description = `${stages[stageIndex]}...`
      }
    } else {
      clearInterval(interval)
      setTimeout(() => {
        toast.remove(pipelineToast.id)
        toast.add({
          type: 'success',
          title: 'Pipeline Complete! ✅',
          description: 'AI processing finished successfully.',
          duration: 3000
        })
      }, 1000)
    }
  }, 1500)
}

// 12. Custom Toast
function showCustom() {
  toast.add({
    type: 'success',
    title: '🎨 Custom Toast',
    description: 'You can customize any aspect of the toast!',
    icon: 'ri-settings-4-line',
    color: '#8b5cf6',
    progressColor: '#8b5cf6',
    badges: ['Custom', 'Flexible'],
    duration: 5000,
    showProgress: true,
    progressPosition: 'bottom'
  })
}

// Clear all toasts
function clearAll() {
  toast.clear()
  // Show confirmation
  toast.add({
    type: 'success',
    title: 'All Toasts Cleared 🧹',
    icon: 'ri-database-2-fill',
    description: 'All notifications have been removed.',
    duration: 2000
  })
}

// const clickOpen =() => {
// toast.alert({
//   title: 'Upgrade Required',
//   description: 'This feature needs Pro plan',
//   action: {
//     label: 'Upgrade',
//     onClick: () => navigateTo('/pricing')
//   },
//   badges: ['Pro', 'Limited']
// })

//   toast.add({
//     title: 'Wedding saved',
//     description: 'Your changes have been stored.',
//     color: 'green',
//     icon: 'i-lucide-check-circle',
//     duration: 5000,
//   })

//   // Premium alert — same pattern
//   toast.alert({
//     title: 'Unlock All Premium Blocks',
//     description: 'Get instant access to 100+ chart & blocks',
//     actions: {
//       label: 'Last Chance – $149',
//       icon: 'i-lucide-zap',
//       onClick: () => navigateTo('/upgrade'),
//     },
//     badges: ['Instant Access', 'No Subscription'],
//   })
//   isOpen.value = true
// }

function showToast() {
    toast.add({
    title: 'Wedding saved',
    description: 'Your changes have been stored.',
    type: 'progress',
    icon: 'ri-database-2-fill',
    duration: 5000,
    color:'#3e5rt54',

  })
}

function showPipelineToast(){
  toast.add({
    type: 'pipeline',
    title: 'AI Pipeline',
    icon: 'ri-openai-fill',
    color: 'linear-gradient(135deg,#00dc82,#36e4da)',
    duration: 5000
  })
}

// toast.alert({
//   message:'Get instant access to 100+ chart & blocks',
//   title: 'Unlock All Premium Blocks',
//   description: 'Get instant access to 100+ chart & blocks',
//   action: {
//     label: 'Last Chance – $149',
//     icon: 'i-lucide-zap',
//     onClick: () => navigateTo('/upgrade'),
//   },
//   badges: ['Instant Access', 'No Subscription'],
// })
// }



// Quick 
// ✅ Success
toast.add({ type: 'success', title: 'Success!', description: 'Operation completed' })

// ❌ Error
toast.add({ type: 'error', title: 'Error!', description: 'Something went wrong' })

// ⏳ Loading
toast.add({ type: 'loading', title: 'Loading...', duration: 0 })

// ⏱️ Countdown
toast.add({ type: 'countdown', title: 'Countdown', countdown: 30, duration: 30000 })

// 📊 Progress
toast.add({ type: 'progress', title: 'Progress', progress: 50, duration: 0 })

// 📝 Multistep
// toast.add({ type: 'multistep', title: 'Steps', steps: [...] })

// 🎯 Action
toast.add({ type: 'action', title: 'Action Needed', action: { label: 'Click Me' } })

// 🌈 Gradient
toast.add({ type: 'gradient', title: '✨ Premium', icon: 'ri-star-fill' })

// 🛡️ Safety
toast.add({ type: 'safety', title: 'Secure', badges: ['Encrypted'] })

// 📡 Streaming
toast.add({ type: 'streaming', title: 'Live Stream', streamText: 'Data flowing...' })

// 🧠 Pipeline
toast.app({ type: 'pipeline', title: 'AI Pipeline' })

// 🧹 Clear All
toast.clear()
</script>

<style scoped lang="scss">
.demo-container {
  min-height: 100vh;
  padding: 40px 20px;
 // background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.demo-title {
  font-size: 42px;
  font-weight: 800;
  background: linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 8px;
}

.demo-subtitle {
  color: #6b7280;
  font-size: 16px;
  margin: 0 0 32px;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  max-width: 800px;
  width: 100%;
  margin-bottom: 24px;
}

.demo-btn {
  padding: 14px 20px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.demo-btn i {
  font-size: 18px;
}

.demo-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.demo-btn:active {
  transform: translateY(0);
}

.demo-btn-success {
  background: linear-gradient(135deg, #10b981, #059669);
}
.demo-btn-success:hover {
  background: linear-gradient(135deg, #059669, #047857);
}

.demo-btn-error {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}
.demo-btn-error:hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
}

.demo-btn-loading {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}
.demo-btn-loading:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
}

.demo-btn-countdown {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}
.demo-btn-countdown:hover {
  background: linear-gradient(135deg, #d97706, #b45309);
}

.demo-btn-progress {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
}
.demo-btn-progress:hover {
  background: linear-gradient(135deg, #4f46e5, #4338ca);
}

.demo-btn-multistep {
  background: linear-gradient(135deg, #06b6d4, #0891b2);
}
.demo-btn-multistep:hover {
  background: linear-gradient(135deg, #0891b2, #0e7490);
}

.demo-btn-action {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}
.demo-btn-action:hover {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
}

.demo-btn-gradient {
  background: linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899);
}
.demo-btn-gradient:hover {
  background: linear-gradient(135deg, #8b5cf6, #ec4899, #f472b6);
}

.demo-btn-safety {
  background: linear-gradient(135deg, #14b8a6, #0d9488);
}
.demo-btn-safety:hover {
  background: linear-gradient(135deg, #0d9488, #0f766e);
}

.demo-btn-streaming {
  background: linear-gradient(135deg, #f97316, #ea580c);
}
.demo-btn-streaming:hover {
  background: linear-gradient(135deg, #ea580c, #c2410c);
}

.demo-btn-pipeline {
  background: linear-gradient(135deg, #00c16a, #059669);
}
.demo-btn-pipeline:hover {
  background: linear-gradient(135deg, #059669, #047857);
}

.demo-btn-custom {
  background: linear-gradient(135deg, #8b5cf6, #a855f7);
}
.demo-btn-custom:hover {
  background: linear-gradient(135deg, #a855f7, #d946ef);
}

.demo-btn-clear {
  background: linear-gradient(135deg, #6b7280, #4b5563);
}
.demo-btn-clear:hover {
  background: linear-gradient(135deg, #4b5563, #374151);
}

.demo-counter {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  color: #374151;
  font-weight: 600;
  font-size: 14px;
  margin-top: 8px;
}

.demo-counter i {
  font-size: 18px;
  color: #6366f1;
}

/* Responsive */
@media (max-width: 640px) {
  .demo-title {
    font-size: 28px;
  }
  
  .demo-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 8px;
  }
  
  .demo-btn {
    padding: 10px 14px;
    font-size: 12px;
  }
  
  .demo-btn i {
    font-size: 14px;
  }
}
</style>