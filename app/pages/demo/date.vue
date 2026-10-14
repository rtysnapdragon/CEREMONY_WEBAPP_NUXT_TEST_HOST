

<template>
  <div class="container mx-auto max-w-3xl py-10">
    <h1 class="text-3xl font-bold mb-8">Component UI Date & dateRange</h1>
  </div>

<RBtns
    :data="actionButtons"
    @click="handleAction"
  />

<RBtn
    label="Create User"
    @click="showForm = true"
  />

 <UButton
    label="Open Slideover"
    @click="open = true"
  />


  <!-- <UColorPicker v-model="color" /> -->


  <!-- <UInputDate ref="inputDate" v-model="date">
    <template #trailing>
      <UPopover :reference="inputDate?.inputsRef[3]?.$el">
        <UButton
          color="neutral"
          variant="link"
          size="sm"
          icon="i-lucide-calendar"
          aria-label="Select a date"
          class="px-0"
        />

        <template #content>
          <UCalendar v-model="modelInputDate" class="p-2" />
        </template>
      </UPopover>
    </template>
  </UInputDate> -->


<div>Data Range Picker Component</div>

<div class="py-[60px]" >RDateRangePicker</div>
<!-- <RDateRangePicker v-model="modelValue"/> -->

<div class="py-[60px]" ></div>

<div class="py-[60px]" >RDateRangePicker_1</div>
<RDateRangePicker_1 v-model="dateRange" class="w-[400px]"/>

<div class="py-[60px]" >RDatePicker</div>
<!-- <RDatePicker
    v-model="modelInputDate"
    placeholder="Select date"
  /> -->
<div class="py-[60px]" >RDatePicker_1</div>
<!-- <RDatePicker_1
    v-model="date"
    placeholder="Select date"
  /> -->
</template>
<script setup>
import { ref } from 'vue'
import { CalendarDate } from '@internationalized/date'
definePageMeta({ layout: 'navbar' })
useHead({
    title: 'Terms & Privacy Policy',
})
const date = ref(
  new CalendarDate(2026, 6, 10)
)

const inputDate = useTemplateRef('inputDate')

const modelInputDate = shallowRef(new CalendarDate(2022, 1, 10))




const dateRange = ref({
  start: new CalendarDate(2026, 6, 1),
  end: new CalendarDate(2026, 6, 30)
})


const modelValue1 = shallowRef({
  start: new CalendarDate(2022, 1, 10),
  end: new CalendarDate(2022, 1, 20)
})
const modelValue = shallowRef({
  start: new Date(),
  end: new Date(),
})

</script>