<template>
  <RWrapperPage>
    <RContent>
    <RTableDev
      ref="tableRef"
      :api="{url: apiConfig.list.url, method: apiConfig.list.method, filter:apiConfig?.list.filter}"
      :columns="columns"
      :options="tableOptions"
      :loading="loading"
      :selected-pk="'empNo'"
      :checkbox="true"
      :store-id="'employee-table'"
      :hasBorder="true"
      :has-scroll="true"
      @reload="reloadTable"
      @update:filterState="handleFilterChange"
      @actionCheck="handleActionCheck"
    >
      <template #headerApplyFilter>
        <RTblChip v-model="chipFilter" @onRemove="onRemoveChip" />
        <RBtns
          :data="[{ type:'filter' , label: $t('apply_filter'), icon: 'ri-filter-line'}]"
          @click="(type, list) => applyFilter()"
        />
      </template>
      <template #headerLeft>
        <RTblFilter @on-click="onSaveFilter" :width="'w-[350px]'">
          <RForm
            ref="formFilter"
            class="class-ft-form grid gap-3.5 w-[350px]"
            :state="dataFilter"
          >
            <RFormGroup name="EmployeeType" :label="$t('employee_type')">
              <RRadios
                v-model="dataFilter.EmployeeType"
                :options="optionsFilterDataType"
              ></RRadios>
            </RFormGroup>
            <div
              class="text-gray-700 dark:text-gray-200 font-normal text-[13px] color-w-b-2"
            >
              {{ $t("status") }}
              <RCheckbox
                class="text-[11px] grid grid-cols-3"
                v-model="dataFilter.Status"
                :options="optionsFilterStatus"
              >
                <template #option>
                  <div class="text-xs flex text-center items-center">
                    {{ optionsFilterStatus.label }}
                  </div>
                </template>
              </RCheckbox>
            </div>
          </RForm>
        </RTblFilter>
      </template>
      <template #headerRight>
        <RBtn  type="create" :label="t('import_employees')"  @click="showImport = true" />
        <RBtn  type="create" :label="t('add_employee')"  @click="showDrawer = true" />
      </template>
      <template #employee="{ rowData }">
        <div class="flex flex-col">
          <span class="font-medium">
            {{ rowData.firstName }} {{ rowData.lastName }}
          </span>
          <span class="text-xs text-gray-500">
            {{ rowData.firstNameEn }} {{ rowData.lastNameEn }}
          </span>
        </div>
      </template>
      <template #salary="{ value }">
        {{ Number(value).toLocaleString() }}
      </template>
      <template #bonus="{ value }">
        {{ Number(value).toLocaleString() }}
      </template>
      <template #comm="{ value }">
        {{ Number(value).toLocaleString() }}
      </template>
      <template #actions="{ rowData }">
        <RTblBtns :items="btnActionsList(rowData)" @actionClick="(type, action) => handleGuestAction(type, rowData, action)"/>
      </template>
    </RTableDev>
    </RContent>

    <!-- Create / Edit Drawer -->
  <RSlider
    v-model="showDrawer"
    :title="editing ? 'Edit User' : 'Add User'"
    :noClose="noClose"
    @close="closeDrawer"
  >
    <RForm ref="formRef" :schema="formSchema" :state="employee" @onSubmit="createEmployee">
      <RFormGroup label="Employee No" required>
        <RInput
          v-model="employee.empNo"
          placeholder="Employee Number"
        />
      </RFormGroup>
      <RFormGroup label="First Name" required>
        <RInput
          v-model="employee.firstName"
          placeholder="First Name"
        />
      </RFormGroup>
      <RFormGroup label="First Name (English)">
        <RInput
          v-model="employee.firstNameEn"
          placeholder="First Name (English)"
        />
      </RFormGroup>
      <RFormGroup label="Last Name" required>
        <RInput
          v-model="employee.lastName"
          placeholder="Last Name"
        />
      </RFormGroup>
      <RFormGroup label="Last Name (English)">
        <RInput
          v-model="employee.lastNameEn"
          placeholder="Last Name (English)"
        />
      </RFormGroup>
      <RFormGroup label="Middle Initial">
        <RInput
          v-model="employee.midInit"
          placeholder="Middle Initial"
          maxlength="1"
        />
      </RFormGroup>
      <RFormGroup label="Department">
        <RInput
          v-model="employee.workDept"
          placeholder="Department"
        />
      </RFormGroup>
      <RFormGroup label="Phone">
        <RInput
          v-model="employee.phoneNo"
          placeholder="Phone Number"
        />
      </RFormGroup>
      <RFormGroup label="Hire Date">
        <RInput
          v-model="employee.hireDate"
          type="date"
        />
      </RFormGroup>
      <RFormGroup label="Job">
        <RInput
          v-model="employee.job"
          placeholder="Job Title"
        />
      </RFormGroup>
      <RFormGroup label="Education Level">
        <RInput
          v-model.number="employee.edLevel"
          type="number"
          min="0"
        />
      </RFormGroup>
      <RFormGroup label="Gender">
        <RSelect
          v-model="employee.sex"
          :items="[
            { label: 'Male', value: 'M' },
            { label: 'Female', value: 'F' }
          ]"
        />
      </RFormGroup>
      <RFormGroup label="Birth Date">
        <RInput
          v-model="employee.birthDate"
          type="date"
        />
      </RFormGroup>
      <RFormGroup label="Salary">
        <RInput
          v-model.number="employee.salary"
          type="number"
          min="0"
        />
      </RFormGroup>
      <RFormGroup label="Bonus">
        <RInput
          v-model.number="employee.bonus"
          type="number"
          min="0"
        />
      </RFormGroup>
      <RFormGroup label="Commission">
        <RInput
          v-model.number="employee.comm"
          type="number"
          min="0"
        />
      </RFormGroup>
    </RForm>
    
    <template #footer>
      <RBtn color="cancel" :label="$t('cancel')" @click="showDrawer = false" :disabled="loading"/>
      <RBtn color="save" :label="$t('save')" @click="formSubmit" :loading="loading" />
    </template>
  </RSlider>
    
  <!-- Import Modal -->
  <RModal v-model="showImport" :title="$t('import_guests_from_excel')">
    <div style="display: flex; flex-direction: column; gap: var(--sp-4)">
      <p class="text-muted" style="font-size: 0.875rem">
        Upload an <strong>.xlsx</strong> file. Required column:
        <code>name</code>.<br />
        Optional:
        <code
          >phone, email, sideFamily (GROOM/BRIDE/FRIEND), gender, totalGuests,
          notes</code
        >
      </p>
      <div
        class="file-drop-zone"
        :class="{ 'has-file': importFile }"
        @click="importFileRef?.click()"
      >
        <i
          class="ri-file-excel-line"
          style="font-size: 2rem; color: var(--c-success)"
        />
        <span v-if="importFile">{{ importFile.name }}</span>
        <span v-else class="text-muted">Click to select .xlsx file</span>
        <input
          ref="importFileRef"
          type="file"
          accept=".xlsx"
          style="display: none"
          @change="onFileChange"
        />
      </div>
      <div v-if="importResult" class="import-result">
        <div class="badge badge-muted">
          Total rows: {{ importResult.totalRows }}
        </div>
        <div class="badge badge-success">
          Imported: {{ importResult.imported }}
        </div>
        <div v-if="importResult.failed > 0" class="badge badge-danger">
          Failed: {{ importResult.failed }}
        </div>
        <ul
          v-if="importResult.errors?.length"
          style="
            font-size: 0.8rem;
            color: var(--c-danger);
            margin: 4px 0 0;
            padding-left: 1rem;
          "
        >
          <li v-for="err in importResult.errors" :key="err">
            {{ err }}
          </li>
        </ul>
      </div>
    </div>
    <template #footer>
        <RBtn type="cancel" :label="$t('cancel')" :disabled="importing" variant="outline"
          @click=" showImport = false;  importFile = null;  importResult = null; "
        />
        <RBtn type="import":label="$t('import')" :loading="importing" :icon="importing ? 'ri-loader-4-line' : 'ri-upload-2-line'" @click="doImport" />
    </template>
  </RModal>
</RWrapperPage>
</template>

<script setup>
import { ref } from "vue"
import { z } from "zod"
const { t } = useI18n()
const confirm = useConfirmStore()
definePageMeta({
  layout: "navbar"
})

const loading = ref(false)
const tableRef = ref(null)
const showDrawer = ref(false)
const editing = ref(false)
const noClose = ref(false)
const showImport = ref(false)
const chipFilter = ref([]);
const dataFilter = ref({
  EmployeeType: null,
  Status: [],
});
// API
const apiConfig = {
  list: {
    url: 'api/v1/employees/list',
    method: 'POST',
    filter: {job: 'ADMIN',status:1}
  },

  create: {
    url: 'api/v1/employees/create',
    method: 'POST'
  },

  update: {
    url: 'api/v1/employees/update',
    method: 'POST'
  },

  detail: {
    url: 'api/v1/employees/get-by-id',
    method: 'POST'
  },

  delete: {
    url: 'api/v1/employees/delete',
    method: 'GET'
  }
}
const defaultEmployee = () => ({
  empNo: '',
  firstName: '',
  firstNameEn: '',
  lastName: '',
  lastNameEn: '',
  midInit: '',
  workDept: '',
  phoneNo: '',
  hireDate: '',
  job: '',
  edLevel: 0,
  sex: '',
  birthDate: '',
  salary: 0,
  bonus: 0,
  comm: 0
})

const employee = ref(defaultEmployee())


const formSchema = z.object({
  name: z.preprocess(
    (v) => v ?? '',
    z.string()
      .trim()
      .min(1, tBy({en:'Name is required',km:'ឈ្មោះមិនអាចទទេបានឡើយ'}))
      .min(2, tBy({en:'Name must be at least 2 characters',km:'ឈ្មោះត្រូវមានយ៉ាងតិច ២ តួអក្សរ'}))
      .max(10, tBy({en:'Name must be at most 10 characters',km:'ឈ្មោះត្រូវមានមិនលើសពី ១០ តួអក្សរ'}))
  ),

  code: z.preprocess(
    (v) => v ?? '',
    z.string()
      .trim()
      .min(1, tBy({en:'Code is required',km:'កូដមិនអាចទទេបានឡើយ'}))
      .min(2, tBy({en:'Code must be at least 2 characters',km:'កូដត្រូវមានយ៉ាងតិច ២ តួអក្សរ'}))
      .max(10, tBy({en:'Code must be at most 10 characters',km:'កូដត្រូវមានមិនលើសពី ១០ តួអក្សរ'}))
  ),
})


// Columns
// `className` drives RTableDev's collapse behaviour:
//   'width'     → fixed width, never collapses        (needs `width`)
//   'min-width' → collapses into the sub-row only when the table is too narrow (needs `minWidth`)
//   'all'       → always rendered in the expanded sub-row
//   (none)      → normal column, falls back to the default width (180)
const columns = [
  {
    key: "empNo",
    label: "Employee No",
    sortable: true,
    className: "width",
    width: 120,
  },
  {
    key: "employee",
    label: t("Employee"),
    sortable: false,
    className: "width",
    minWidth: 200,
    slot: "#employee"
  },
  {
    key: "workDept",
    label: "Department",
    sortable: true,
    className: "min-width",
    minWidth: 160,
  },
  {
    key: "job",
    label: "Job",
    sortable: true,
    className: "min-width",
    minWidth: 160,
  },
  {
    key: "phoneNo",
    label: "Phone",
    sortable: true,
    className: "width",
    width: 140,
  },
  {
    key: "sex",
    label: "Gender",
    sortable: true,
    className: "width",
    width: 100,
  },
  {
    key: "hireDate",
    label: "Hire Date",
    sortable: true,
    className: "all",
  },
  {
    key: "birthDate",
    label: "Birth Date",
    sortable: true,
    className: "all",
  },
  {
    key: "salary",
    label: "Salary",
    sortable: true,
    className: "all",
    slot: "#salary"
  },
  {
    key: "bonus",
    label: "Bonus",
    sortable: true,
    className: "all",
    slot: "#bonus"
  },
  {
    key: "comm",
    label: "Commission",
    sortable: true,
    className: "width",
    width: 150,
    slot: "#comm"
  },
  {
    key: "actions",
    label: "Actions",
    sortable: false,
    className: "width",
    width: 160,
    slot: "#actions"
  }
]

const btnActionsList = (g) => [
  {
    type: 'view',
    label: t('view_invitation'),
    icon: 'ri-external-link-line',
  },
  {
    type: 'edit',
    label: t('edit'),
    icon: 'ri-edit-line',
  },
  {
    type: 'delete',
    label: t('delete'),
    icon: 'ri-delete-bin-line',
  }
]
async function handleGuestAction(type, guest) {
  if(type==='view') {
    const param = queryParams('data', {empNo: guest.empNo,})
    navigateTo(localePath(`/demo/r-table-dev-localtest${param}`))
  }
  if(type==='edit') return editEmp(guest)
  if(type==='delete') return deleteEmployee(guest)
}

const tableOptions = {
  showNoData: true,
  info: true,
  paging: true
}

const optionsFilterDataType = [
  {label: t('all'), value: null},
  {label: t('full_time'), value: 1},
  {label: t('part_time'), value: 2},
]

const optionsFilterStatus = [
  { label: t("active"), value: 1 },
  { label: t("pending"), value: 4 },
  { label: t("disabled"), value: 0 },
  { label: t("deleted"), value: 2 },
]
/// Function
// const onRemoveChip = (data) => {
//   if (data.icon == "R") console.log("R");
//   if (data.icon == "O") console.log("O");
//   if (data.icon == "D") console.log("D");
// };
function onSaveFilter(close) {
    const status = Array.isArray(dataFilter.value.Status)
    ? dataFilter.value.Status
    : dataFilter.value.Status != null
      ? [dataFilter.value.Status]
      : []

  const active = status.includes(1)
  const pending = status.includes(4)
  const disabled = status.includes(0)
  const deleted = status.includes(2)

    
  let Active = status.includes(1)
  let Pending = status.includes(4)
  let Disabled = status.includes(0)
  let Deleted = status.includes(2)

  // let Active = dataFilter.value.Status.filter((v) => v == 1)[0];
  // let Pending = dataFilter.value.Status.filter((v) => v == 4)[0];
  // let Disabled = dataFilter.value.Status.filter((v) => v == 0)[0];
  // let Deleted = dataFilter.value.Status.filter((v) => v == 2)[0];
  chipFilter.value = [
    {
      pk: "UserType",
      src: "",
      icon: "T",
      value:
        dataFilter.value?.UserType == null
          ? ""
          : dataFilter.value?.UserType == "Student"
          ? t("student")
          : t("guardian"),
    },
    {
      pk: "Active",
      src: "",
      icon: "A",
      value: Active ? "Active" : "",
    },
    {
      pk: "Pending",
      src: "",
      icon: "P",
      value: Pending ? "Pending" : "",
    },
    {
      pk: "Disabled",
      src: "",
      icon: "D",
      value: Disabled == 0 ? "Disabled" : "",
    },
    {
      pk: "Deleted",
      src: "",
      icon: "D",
      value: Deleted ? "Deleted" : "",
    },
  ];
  close();
}
function onRemoveChip(d) {
  if (isNotEmpty(d)) {
    chipFilter.value = chipFilter.value.filter((f) => f.pk != d.pk);
    if (dataFilter.value[d.pk]) dataFilter.value[d.pk] = null;
    if (d.pk == "Active") {
      dataFilter.value.Status = dataFilter.value.Status.filter((v) => v != 1);
    } else if (d.pk == "Pending") {
      dataFilter.value.Status = dataFilter.value.Status.filter((v) => v != 4);
    } else if (d.pk == "Disabled") {
      dataFilter.value.Status = dataFilter.value.Status.filter((v) => v != 0);
    } else if (d.pk == "Deleted") {
      dataFilter.value.Status = dataFilter.value.Status.filter((v) => v != 2);
    }
  }
}

const formSubmit = () => {
  formRef.value.submit()
}

const handleFilterChange = (filterState) => {
  console.log("Filter:", filterState)
}

const handleActionCheck = (d) => {
  console.log("Handle Select data table ==============> ", d)
}

const editEmp = async (emp) => {
  showDrawer.value = true
  editing.value = true
  employee.value = emp.map((v) => ({
    empNo: v.empNo,
    firstName: v.firstName,
    firstNameEn: v.firstNameEn,
    lastName: v.lastName,
    lastNameEn: v.lastNameEn,
    midInit: v.midInit,
    workDept: v.workDept,
    phoneNo: v.phoneNo,
    hireDate: v.hireDate,
    job: v.job,
    edLevel: v.edLevel,
    sex: v.sex,
    birthDate: v.birthDate,
    salary: v.salary,
    bonus: v.bonus,
    comm: v.comm
  })                                                                                                                                                                         )
}

const updateEmployee = async (employee) => {
  loading.value = true

  try {
    await useHttp(apiConfig.update.url, {
      method: apiConfig.update.method,
      data:employee.value
    })
    console.log("Employee updated", employee)
    tableRef.value?.reload()
  } finally {
    loading.value = false
  }
}

const createEmployee = async () => {
  try {
    loading.value = true

    await useHttp(editing.value ? apiConfig.update.url:apiConfig.create.url, {
      method: editing.value ? apiConfig.update.method:apiConfig.create.method,
      data: employee.value
    })

    showDrawer.value = false
    editing.value = false
    employee.value = defaultEmployee()
    tableRef.value?.reload()
  } finally {
    loading.value = false
  }
}

const importEmployee = async () => {
  showImport.value = true
}

const deleteEmployee = async (employee) => {
  const confirmed  = await confirm.show({
    type: 'delete',
    title: "Delete Employee",
    message: `Delete employee <span class="font-bold">"${employee.firstName} ${employee.lastName}"</span>?`,
    confirmText: "Delete",
    cancelText: "Cancel"
  })

  if (!confirmed) return;
  
  try {
    await useHttp(`/api/employees/${employee.empNo}`, {
      method: "GET"
    })
    toast.add("Employee deleted successfully.");
    tableRef.value?.reload()
  } catch (err) {
    toast.add("Failed to delete employee.");
  }
}

const reloadTable = async () => {
  tableRef.value?.reload()
}

usePageBreadcrumb({
  showBack: true,

  backTooltip: 'Back to dashboard',

  backAction: () => navigateTo('/dashboard'),

  items: [
    {
      label: 'Dashboard',
      to: '/',
      icon: 'i-lucide-home',
    },

    {
      label: 'Users',
      to: '/users',

      children: [
        {
          label: 'Create User',
          icon: 'i-lucide-plus',
          to: '/users/create',
        },

        {
          label: 'User Roles',
          icon: 'i-lucide-shield',
          to: '/users/roles',
        },

        {
          label: 'Permission Matrix',
          icon: 'i-lucide-lock',
          onClick: () => {
            console.log('Permission clicked')
          },
        },
      ],
    },

    {
      label: 'Detail',
    },
  ],
})
defineExpose({
  reloadTable,
  clearSelection: () => tableRef.value?.clearAll(),
  getSelected: () => tableRef.value?.getSelected?.() ?? [],
})
</script>