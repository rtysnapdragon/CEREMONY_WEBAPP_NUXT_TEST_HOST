

<template>
  <div class="container mx-auto max-w-3xl py-10">
    <h1 class="text-3xl font-bold mb-8">Component UI Demo</h1>
  </div>
  <RBtn variant="secondary" label="Hello" />
  <RBtn variant="tertiary" label="Hello" />
  <RBtn variant="outline" label="Hello" />
  <RBtn variant="danger" label="Hello" />
  <RBtn variant="warning" label="Hello" />
  <RBtn variant="success" label="Hello" />
  <RBtn variant="info" label="Hello" />
  <RBtn variant="link" label="Hello" />
  <RBtn label="Show confirm deletion" variant="secondary" @click="deleteItem"></RBtn>

<RBtns
    :data="actionButtons"
    @click="handleAction"
  />

<RBtn
    label="Create User"
    @click="showForm = true"
  />

 <UButton
    label="Open slideover"
    @click="open = true"
  />
<!-- <RModal v-model:open="openModal" title="Test Modal"/> -->
<UButton label="Open Modal" color="neutral" variant="subtle" @click="openModal = true" />

  <RModal v-model="openModal" :isFullScreen="false" title="Modal with footer" description="This is useful when you want a form in a Modal." :ui="{ footer: 'justify-end' }">
    <!-- <template #header>
      <div class="flex justify-between items-center">
        <h2 class="text-lg font-bold">Custom Header</h2>

        <iRSlider
          class="ri-close-large-fill cursor-pointer"
          @click="openModal = false"
        />
      </div>
    </template> -->
    <div class="form-group">
      <RDateInputPicker
        :model-value="pickedDate"
        :label="$t('wedding_date')"
        required
        @update:model-value="onDateChange"
      />
    </div>
    
    <RInput v-model="formData.name" label="Name" />
    <p>This shows in body</p>
    <p>This shows in body</p>
    <p>This shows in body</p>
    <p>This shows in body</p>
    <p>This shows in body</p>
    <template #footer>
      <div class="flex gap-x-2 justify-end w-full">
        <RBtn icon="cancel" :label="$t('cancel')" size="sm" @click="closeModal = false" />
        <RBtn icon="save" :label="$t('save')" size="sm" type="submit" color="neutral" />
      </div>
    </template>
  </RModal>

<!-- <RTooltip text="This is a tooltip">
  <UButton>Hover me</UButton>
</RTooltip>
<RTooltip
  :isPopper="true"
  placement="top"
>
  <template #default>
    <span class="cursor-help">
      ℹ️ Info
    </span>
  </template>

  <template #text>
    <div class="max-w-[200px]">
      This is a custom tooltip with rich content.
    </div>
  </template>
</RTooltip> -->


  <!-- Form Builder -->
  <!-- <RFormCreateModal
    v-model:show="showForm"
    v-model:data="formData"
    :form="formConfig"
    :inputs="inputs"
    :tabs="tabs"
    title="User Form"
    @onSubmitted="handleSubmit"
    @onCancel="handleCancel"
  /> -->
<!-- <FormCreateProject /> -->

<RBtn
    label="open drawer"
    @click="open = true"
  />

  <USlideover v-model:open="open" title="First slideover" :ui="{ footer: 'justify-end' }">
    <UButton color="neutral" variant="subtle" label="Open" />

    <template #body>
      <div class="space-y-4 w-full flex flex-col">
        <UInput v-model="formData.name" label="Name" />
        <UInput v-model="formData.email" label="Email" />
        <UInput v-model="formData.role" label="Role" />
        <UInput v-model="formData.active" label="Active" type="checkbox" />
      </div>
    </template>

    <template #footer>
      <UButton label="Close" color="neutral" variant="outline" @click="first = false" />

      <USlideover v-model:open="second" title="Second slideover" :ui="{ footer: 'justify-end' }">
        <UButton label="Open second" color="neutral" />

        <template #body>
          <UInput v-model="formData.name" label="Name" />
          <UInput v-model="formData.email" label="Email" />
          <UInput v-model="formData.role" label="Role" />
          <UInput v-model="formData.active" label="Active" type="checkbox" />
        </template>

        <template #footer>
          <UButton label="Close" color="neutral" variant="outline" @click="second = false" />
        </template>
      </USlideover>
    </template>
  </USlideover>


<!-- 
<RSlider
  v-model="showForm"
  title="Notification"
  @close="(result) => console.log('Result ==================> ', result)"
>
  Content here...
  <template #footer="{ close }">
    <div class="flex gap-2 justify-end w-full">
      <RBtn
        :label="$t('cancel')"
        color="neutral"
        @click="close(false)"
      />

      <RBtn
        :label="$t('save')"
        color="primary"
        @click="close(true)"
      />
    </div>
  </template>
</RSlider> -->
<!-- 
<RSlider
  v-model="showForm"
  title="Notification"
  @close="(result) => console.log('Result ==================> ', result)"
  :ui="{ header: 'justify-end' }"
>
  Content here...
  <template #footer="{ close }">
    <div class="flex gap-2 justify-end w-full">
      <RBtn
        :label="$t('cancel')"
        color="neutral"
        @click="close(false)"
      />

      <RBtn
        :label="$t('save')"
        color="primary"
        @click="close(true)"
      />
    </div>
  </template>
</RSlider> -->

<RCheckbox v-model="formData.active" label="Active" />
<UCheckbox v-model="active" label="Active ffffffffffff" color="primary" variant="list"/>

   <UPopover mode="hover">
    <UButton label="Open" color="neutral" variant="subtle" />

    <template #content>
      <Placeholder class="size-48 m-4 inline-flex" />
    </template>
  </UPopover>

  <!-- <UColorPicker v-model="color" /> -->


  <!-- <UInputDate ref="inputDate" v-model="modelValue" range>
    <template #trailing>
      <UPopover :reference="inputDate?.inputsRef[0]?.$el">
        <UButton
          color="neutral"
          variant="link"
          size="sm"
          icon="i-lucide-calendar"
          aria-label="Select a date range"
          class="px-0"
        />

        <template #content>
          <UCalendar v-model="modelValue" class="p-2" :number-of-months="2" range />
        </template>
      </UPopover>
    </template>
  </UInputDate> -->
<div class="py-[60px]" >RSwitch</div>
<RSwitch v-model="enabled" />

<RSwitch
  v-model="enabled"
  mode="icon"
  checked-icon="ri-check-line"
  unchecked-icon="ri-close-line"
/>

<RSwitch
  v-model="enabled"
  mode="text"
  checked-text="ON"
  unchecked-text="OFF"
/>

<RSwitch
  v-model="enabled"
  mode="icon-text"
  checked-icon="ri-sun-line"
  unchecked-icon="ri-moon-line"
  :checked-text="$t('day')"
  :unchecked-text="$t('night')"
/>

<RSwitch v-model="enabled" :loading="false" />
<RSwitch v-model="enabled" :loading="true" />
<RSwitch
v-model="enabled"
mode="icon"
checked-icon="ri-check-line"
unchecked-icon="ri-close-line"
@change="handleChange"
/>
<!-- <USwitch label="Check me" description="This is a checkbox." /> -->
<div>Data Range Picker Component</div>

<div class="py-[60px]" >RDateRangePicker</div>
<!-- <RDateRangePicker v-model="modelValue"/> -->

<div class="py-[60px]" ></div>

<div class="py-[60px]" >RDateRangePicker_1</div>
<!-- <RDateRangePicker_1 v-model="dateRange" class="w-[400px]"/> -->

<div class="py-[60px]" >RDatePicker</div>
<!-- <RDatePicker
    v-model="date"
    placeholder="Select date"
  /> -->
<div class="py-[60px]" >RDatePicker_1</div>
<!-- <RDatePicker_1
    v-model="date"
    placeholder="Select date"
  /> -->

  <div>RSelect</div>
 <RSelect
    v-model="selected"
    :localData="{
      data: [
        { Id: 1, Name: 'Apple', NameEnglish: 'Apple' },
        { Id: 2, Name: 'Banana', NameEnglish: 'Banana' },
        { Id: 3, Name: 'Orange', NameEnglish: 'Orange' }
      ],
      keySearch: ['Name', 'NameEnglish']
    }"
    pk="Id"
    placeholder="Select fruit"
  />
<RSelect
  v-model="selected"
  :local-data="{
    data: [
      { Id: 1, Name: 'John Doe', Avatar: '/avatar.jpg' }
    ]
  }"
  :template-leading="{
    labelKey: 'Name',
    imagePath: 'Avatar',
    imageType: 'user'
  }"
/>
<RSelect
  v-model="selected"
  searchable
  :localData="{
    data: [
      { Id: 1, Name: 'Car' },
      { Id: 2, Name: 'Bike' },
      { Id: 3, Name: 'Bus' }
    ],
    keySearch: ['Name']
  }"
/>
<div class="flex w-full">
  <RSelect
    class="w-full"
    v-model="selected"
    multiple
    pk="Id"
    :localData="{
      data: [
        { Id: 1, Name: 'USA' },
        { Id: 2, Name: 'UK' },
        { Id: 3, Name: 'Japan' }
      ],
      keySearch: ['Name']
    }"
    placeholder="Select countries"
  />
  </div>

  <div>RInput with type PinInput</div>
  <RInput v-model="otp" type="pininput" typePinInput="number" :length="6" :mask="false" />
<!-- 
    <UPinInput :length="6" :separator="3" placeholder="○">
    <template #separator>
      <UIcon name="i-lucide-minus" class="size-4" />
    </template>
  </UPinInput> -->

</template>
<script setup>
import { CalendarDate } from '@internationalized/date'
const confirm = useConfirmStore()
import { ref } from 'vue'
const { t }  = useI18n()
definePageMeta({ layout: 'navbar' })
useHead({
  title: 'Component Demo',
})
const selected = ref()
const selected1 = ref([])
const otp = ref()
const active = ref(true)
const toast = useToast()
const openModal = ref(false)
const pickedDate = ref(null)
const onDateChange = (val) => {
  console.log("Date change val ==============> ",val)
  pickedDate.value = val ? toRaw(val) : null
}
const date = ref(
  new CalendarDate(2026, 6, 10)
)
const enabled = ref(false)
function handleChange(value) {
  console.log("Switch change value ==============> ",value)
}
const user = 'Riththy'

function deleteItem() {
  console.log("Delete confirm ==============> ")
  confirm.show({
    type:'ok',
    title: t('delete_user'),
    description: t('do_you_want_to_delete',{ value: user }),

    // color: 'delete',

    confirmText: t('Delete'),

    onConfirm: async () => {
      // await userApi.delete(id)

      toast.add({
        title: 'Deleted'
      })
    }
  })
}


const actionButtons = [
  {
    type: 'add',
    label: 'Add',
    icon: 'ri-add-line',
    color: 'primary',
    variant: 'solid'
  },
  {
    type: 'edit',
    label: 'Edit',
    icon: 'ri-edit-line',
    color: 'warning'
  },
  {
    type: 'delete',
    label: 'Delete',
    icon: 'ri-delete-bin-line',
    color: 'danger',
    disabled: false
  }
]

function handleAction(type, item) {
  console.log('Clicked:', type)
  console.log('Button config:', item)

  switch (type) {
    case 'add':
      addItem()
      break
    case 'edit':
      editItem()
      break
    case 'delete':
      deleteItem()
      break
  }
}

function addItem() {
  console.log('Add')
}

function editItem() {
  console.log('Edit')
}

const formOpen = ref(false)

const inputs = [
        {
          key: 'name',
          type: 'text',
          label: 'name',
          validation: { required: true }
        },
        {
          key: 'email',
          type: 'email',
          label: 'email',
          validation: { required: true, email: true }
        },
        {
          key: 'role',
          type: 'select',
          label: 'role',
          options: [
            { label: 'Admin', value: 'admin' },
            { label: 'Viewer', value: 'viewer' },
          ]
        },
        {
          key: 'active',
          type: 'toggle',
          label: 'active',
          defaultValue: true
        }
      ]

function handleSubmit(data) {
  console.log('Form submitted:', data)
  formOpen.value = false
}

function openForm() {
  formOpen.value = true
}

const showForm = ref(false)

const formData = ref({
  name: '',
  email: ''
})

const formConfig = {
  width: 500,
  showSubmit: true,
  showReset: true,
  showCancel: true
}

const tabs = ['user','group'] // optional

function handleCancel() {
  console.log('Cancelled')
}


// const open = ref(true)
const open = ref(false)
defineShortcuts({
  o: () => open.value = !open.value
})
const second = ref(false)

const dateRange = ref({
  start: new CalendarDate(2026, 6, 1),
  end: new CalendarDate(2026, 6, 30)
})

const inputDate = useTemplateRef('inputDate')

const modelValue1 = shallowRef({
  start: new CalendarDate(2022, 1, 10),
  end: new CalendarDate(2022, 1, 20)
})
const modelValue = shallowRef({
  start: new Date(),
  end: new Date(),
})

</script>