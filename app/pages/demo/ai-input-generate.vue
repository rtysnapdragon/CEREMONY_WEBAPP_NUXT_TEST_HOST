<template>
    <div class="text-center my-4 font-bold text-2xl text-green-600">AI Input Generate Demo</div>
    <!-- Basic AI fill -->
    <RInput :ai="true" name="email" type="email" placeholder="Work email" />

    <!-- With form context for smarter fills -->
    <RInput
    :ai="true"
    name="bio"
    type="textarea"
    :form-context="{ name: 'Rithy Sok', role: 'Developer', company: 'SARIKA' }"
    ai-lang="en"
    />

    <!-- Khmer name fill -->
    <RInput :ai="true" name="name" ai-lang="km" placeholder="ឈ្មោះ" />

    <!-- Custom instruction -->
    <RInput
    :ai="true"
    name="title"
    ai-instruction="Generate a professional Khmer wedding ceremony title, 5-8 words"
    />
</template>
<script setup>

definePageMeta({layout: 'navbar'})
useHead({title: 'AI Input Generate Demo'})


</script>
