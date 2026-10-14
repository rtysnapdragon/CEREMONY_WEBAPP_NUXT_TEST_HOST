<template>
  <div class="rselect-demo">
    <h1>RSelect — Usage Reference</h1>

    <!-- 1. Basic single select, local data -->
    <section>
      <h2>1. Single select — local data</h2>
      <RSelect
        v-model="form.department"
        :local-data="{ data: departments, keySearch: ['NameEnglish', 'Name'] }"
        pk="Id"
        placeholder="Select department"
      />
      <pre>{{ form.department }}</pre>
    </section>

    <!-- 2. Multiple select -->
    <section>
      <h2>2. Multiple select — local data</h2>
      <RSelect
        v-model="form.staffIds"
        multiple
        :local-data="{ data: staffList }"
        pk="Id"
        placeholder="Select staff"
      />
      <pre>{{ form.staffIds }}</pre>
    </section>

    <!-- 3. Remote/API-backed single select -->
    <section>
      <h2>3. Remote select — API, server search + pagination</h2>
      <RSelect
        ref="refCustomerSelect"
        v-model="form.customer"
        :api="{
          url: 'api/customer/basic/list',
          method: 'POST',
          filter: customerFilter
        }"
        pk="Id"
        v-model:loading="isLoadingCustomers"
        placeholder="Search customer"
        @selected="onCustomerSelected"
        @mapData="onCustomerListLoaded"
      />
      <div class="row">
        <RBtn size="xs" @click="selectCustomerById(42)">Select customer #42</RBtn>
        <RBtn size="xs" variant="outline" @click="reloadCustomers">Reload list</RBtn>
      </div>
      <p v-if="isLoadingCustomers">Loading customers…</p>
      <pre>{{ form.customer }}</pre>
    </section>

    <!-- 4. Remote/API-backed multiple select -->
    <section>
      <h2>4. Remote select — multiple</h2>
      <RSelect
        v-model="form.customerIds"
        multiple
        :api="{ url: 'api/customer/basic/list', method: 'POST' }"
        pk="Id"
        placeholder="Search customers"
      />
      <pre>{{ form.customerIds }}</pre>
    </section>

    <!-- 5. templateOption / templateLeading (no custom slots needed) -->
    <section>
      <h2>5. Custom field mapping via templateOption / templateLeading</h2>
      <RSelect
        v-model="form.employee"
        :local-data="{ data: employees }"
        pk="Id"
        placeholder="Select employee"
        :template-option="{
          labelKey: 'Name',
          labelKeyEn: 'NameEnglish',
          subLabelKey: 'Position',
          subLabelKeyEn: 'PositionEnglish',
          imagePath: 'AvatarUrl',
          gender: 'Gender'
        }"
        :template-leading="{
          labelKey: 'Name',
          labelKeyEn: 'NameEnglish',
          imagePath: 'AvatarUrl',
          gender: 'Gender'
        }"
      />
      <pre>{{ form.employee }}</pre>
    </section>

    <!-- 6. Fully custom rendering via slots -->
    <section>
      <h2>6. Custom option/leading slots</h2>
      <RSelect
        v-model="form.branch"
        :local-data="{ data: branches }"
        pk="Id"
        placeholder="Select branch"
      >
        <template #option="data">
          <div class="branch-row">
            <img :src="data.data.LogoUrl" class="branch-logo" />
            <div>
              <div class="branch-name">{{ data.data.NameEnglish }}</div>
              <div class="branch-sub">{{ data.data.Address }}</div>
            </div>
          </div>
        </template>

        <template #leading="{ data }">
          <img :src="data.LogoUrl" class="branch-logo-sm" />
        </template>
      </RSelect>
      <pre>{{ form.branch }}</pre>
    </section>

    <!-- 7. Variants / states -->
    <section>
      <h2>7. Variants, disabled, no-clear, full width</h2>
      <div class="stack">
        <RSelect v-model="form.a" :local-data="{ data: departments }" pk="Id" variant="outline" placeholder="outline (default)" />
        <RSelect v-model="form.b" :local-data="{ data: departments }" pk="Id" variant="solid" placeholder="solid" />
        <RSelect v-model="form.c" :local-data="{ data: departments }" pk="Id" variant="solidBackGround" placeholder="solidBackGround" />
        <RSelect v-model="form.d" :local-data="{ data: departments }" pk="Id" variant="none" placeholder="none" />
        <RSelect v-model="form.e" :local-data="{ data: departments }" pk="Id" disabled placeholder="disabled" />
        <RSelect v-model="form.f" :local-data="{ data: departments }" pk="Id" required placeholder="required (no clear row)" />
        <RSelect v-model="form.g" :local-data="{ data: departments }" pk="Id" default-select full-width placeholder="default-select + full-width" />
      </div>
    </section>

    <!-- 8. Programmatic/"official" selection control -->
    <section>
      <h2>8. Programmatic control — clear / open / close / getSelected</h2>
      <RSelect
        ref="refDeptSelect"
        v-model="form.department2"
        :local-data="{ data: departments }"
        pk="Id"
        placeholder="Controlled from buttons below"
      />
      <div class="row">
        <RBtn size="xs" @click="refDeptSelect?.open()">Open</RBtn>
        <RBtn size="xs" @click="refDeptSelect?.close()">Close</RBtn>
        <RBtn size="xs" variant="outline" @click="refDeptSelect?.clear()">Clear</RBtn>
        <RBtn size="xs" variant="outline" @click="logSelected">Log selected</RBtn>
      </div>
      <pre>{{ form.department2 }}</pre>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, computed, useTemplateRef } from 'vue'

// ---- 1 & 2: local data sources ----
const departments = ref([
  { Id: 1, NameEnglish: 'Engineering', Name: 'ផ្នែកវិស្វកម្ម' },
  { Id: 2, NameEnglish: 'Sales', Name: 'ផ្នែកលក់' },
  { Id: 3, NameEnglish: 'HR', Name: 'ធនធានមនុស្ស' }
])

const staffList = ref([
  { Id: 11, NameEnglish: 'Sokha', Name: 'សុខា' },
  { Id: 12, NameEnglish: 'Dara', Name: 'ដារា' },
  { Id: 13, NameEnglish: 'Vanna', Name: 'វណ្ណា' }
])

// ---- 3 & 4: remote data ----
const isLoadingCustomers = ref(false)
const customerFilter = reactive({ Status: 'Active' }) // change this ref to trigger auto-reload
const refCustomerSelect = useTemplateRef('refCustomerSelect')

function onCustomerSelected(customer) {
  console.log('customer selected:', customer)
}
function onCustomerListLoaded(list) {
  console.log('customer list loaded:', list)
}
function selectCustomerById(id) {
  // uses the exposed remoteSelect(): fetches (if needed) and sets selection by pk
  refCustomerSelect.value?.remoteSelect({ Id: id })
}
function reloadCustomers() {
  refCustomerSelect.value?.reload()
}

// ---- 5: template mapping ----
const employees = ref([
  {
    Id: 21,
    Name: 'សុវណ្ណា',
    NameEnglish: 'Sovanna',
    Position: 'អ្នកគ្រប់គ្រង',
    PositionEnglish: 'Manager',
    AvatarUrl: '/avatars/sovanna.jpg',
    Gender: 'female'
  },
  {
    Id: 22,
    Name: 'វិចិត្រ',
    NameEnglish: 'Vichit',
    Position: 'អ្នកអភិវឌ្ឍន៍',
    PositionEnglish: 'Developer',
    AvatarUrl: '/avatars/vichit.jpg',
    Gender: 'male'
  }
])

// ---- 6: custom slot data ----
const branches = ref([
  { Id: 31, NameEnglish: 'Phnom Penh HQ', Address: 'Street 271', LogoUrl: '/logos/pp.png' },
  { Id: 32, NameEnglish: 'Siem Reap', Address: 'Road 6', LogoUrl: '/logos/sr.png' }
])

// ---- 8: programmatic control ----
const refDeptSelect = useTemplateRef('refDeptSelect')
function logSelected() {
  console.log('current selected:', refDeptSelect.value?.getSelected())
}

// ---- form state ----
const form = reactive({
  department: undefined,
  department2: undefined,
  staffIds: [],
  customer: undefined,
  customerIds: [],
  employee: undefined,
  branch: undefined,
  a: undefined, b: undefined, c: undefined, d: undefined, e: undefined, f: undefined, g: undefined
})
</script>

<style lang="scss" scoped>
.rselect-demo {
  max-width: 640px;
  margin: 0 auto;
  padding: var(--sp-6, 24px);

  section {
    margin-bottom: var(--sp-8, 32px);
    padding-bottom: var(--sp-6, 24px);
    border-bottom: 1px solid var(--c-border);
  }

  h2 {
    font-size: 14px;
    margin-bottom: var(--sp-2, 8px);
    color: var(--c-muted);
  }

  pre {
    margin-top: var(--sp-2, 8px);
    font-size: 12px;
    background: var(--c-surface);
    padding: var(--sp-2, 8px);
    border-radius: var(--r-sm, 8px);
    overflow-x: auto;
  }

  .row {
    display: flex;
    gap: var(--sp-2, 8px);
    margin-top: var(--sp-2, 8px);
  }

  .stack {
    display: flex;
    flex-direction: column;
    gap: var(--sp-3, 12px);
  }

  .branch-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .branch-logo { width: 24px; height: 24px; border-radius: 6px; }
  .branch-logo-sm { width: 16px; height: 16px; border-radius: 4px; }
  .branch-name { font-size: 13px; }
  .branch-sub { font-size: 11px; color: var(--c-muted); }
}
</style>
