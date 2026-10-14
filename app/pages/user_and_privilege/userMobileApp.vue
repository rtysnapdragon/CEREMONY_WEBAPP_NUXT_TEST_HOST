<template>
  <RWrapperPage>
    <OCHead :title="$t('view_guardain_register')" />
    <OCTab class="tap-container" :items="items" @on-change="changeTap" />
    <div
      class="table-of-registered-user h-full rty-parent-table"
      v-show="currentTab == 'R'"
    >
      <OCTable
        ref="ocServerTable"
        v-model="selectedServer"
        :api="{
          url: 'api/user/list',
          method: 'POST',
        }"
        :options="{}"
        :columns="columnsServer"
        @update:data="updateData"
        :show-template="isShowServerTemplate"
      >
        <template #headerLeft>
          <RTblFilter @on-click="onSaveFilter">
            <RForm
              ref="formFilter"
              class="class-ft-form grid gap-3.5 w-[350px]"
              :state="dataFilter"
            >
              <RFormGroup name="DataType" :label="$t('user_type')">
                <RRadios
                  v-model="dataFilter.UserType"
                  :options="optionsFilterDataType"
                ></RRadios>
              </RFormGroup>
              <div
                class="text-gray-700 dark:text-gray-200 font-normal text-[13px] color-w-b-2"
              >
                {{ $t("status") }}
                <OCCheckboxes
                  class="text-[11px] grid grid-cols-3"
                  v-model="dataFilter.Status"
                  :options="optionsFilterStatus"
                >
                  <template #option>
                    <div class="text-xs flex text-center items-center">
                      {{ optionsFilterStatus.label }}
                    </div>
                  </template>
                </OCCheckboxes>
              </div>
            </RForm>
          </RTblFilter>
        </template>
        <template #headerApplyFilter>
          <div class="flex gap-3 items-center">
            <OCTblChip v-model="dataChips" @on-remove="onRemoveChip" />
          </div>
        </template>
        <template #no="props">
          <div>
            {{ formatNumberWithLeadingZero(props.rowIndex + 1) }}
          </div>
        </template>
        <template #name="props">
          <OCProfileInfo
            :title="props.rowData.FirstName + ' ' + props.rowData.LastName"
            :subTitle="'@' + props.rowData.LoginName"
            :gender="
              props.rowData.Gender
                ? props.rowData.Gender == 'Female'
                  ? 'female'
                  : 'male'
                : ''
            "
            :src="`${
              props.rowData.ImagePath == '' ? '' : props.rowData.ImagePath
            }`"
          />
        </template>

        <template #dateOfBird="props">
          <div class="" v-if="props.rowData.DateOfBirth">
            {{ ocdate(props.rowData.DateOfBirth).format() }}
          </div>
        </template>
        <template #UserType="props">
          <OCStatus
            variant="solid"
            size="20px"
            :color="`${
              props.rowData.UserType === 'Guardian' ? 'capture' : 'blue'
            }`"
            :text="`${
              props.rowData.UserType === 'Guardian'
                ? tr('common.guardian')
                : tr('common.student')
            }`"
          >
          </OCStatus>
        </template>
        <template #Email="props">
          <div>
            {{ props.rowData.Email }}
          </div>
        </template>
        <template #Phone="props">
          <div class="phone-number-container">
            <div
              class="phone-number color-bg-wrapper"
              v-if="props.rowData.Phone"
            >
              <i class="ri-phone-line bg-primary"></i>
              <span class="text-[0.69rem] color-text">
                {{ props.rowData.Phone }}</span
              >
            </div>
          </div>
        </template>
        <template #Status="props">
          <div>
            <OCStatus
              variant="solid"
              size="20px"
              :color="`${
                props.rowData.Status === 1
                  ? 'green'
                  : props.rowData.Status === 0
                  ? 'red'
                  : 'orange'
              }`"
              :text="`${
                props.rowData.Status === 1
                  ? tr('common.active')
                  : props.rowData.Status === 0
                  ? tr('common.disabled')
                  : tr('common.pending')
              }`"
            >
            </OCStatus>
          </div>
        </template>

        <template #CreatedBy="props">
          <div>
            <div class="rty-group-view">
              <div class="rty-title">@{{ props.rowData.CreatedBy }}</div>
              <div class="rty-sub-title color-sub-text">
                {{
                  ocdate(props.rowData.CreatedDate).format(
                    "MMM dd, yyyy hh:mm:ss a"
                  )
                }}
              </div>
              <slot name="subTitle"></slot>
            </div>
          </div>
        </template>
        <template #UpdatedBy="props">
          <div v-if="props.rowData.UpdatedBy">
            <div class="rty-group-view">
              <div class="rty-title">@{{ props.rowData.UpdatedBy }}</div>
              <div class="rty-sub-title color-sub-text">
                {{
                  ocdate(props.rowData.UpdatedDate).format(
                    "MMM dd, yyyy hh:mm:ss a"
                  )
                }}
              </div>
              <slot name="subTitle"></slot>
            </div>
          </div>
        </template>
      </OCTable>
    </div>
    <div
      class="table-of-unregistered-guardian h-full rty-parent-table"
      v-show="currentTab == 'UG'"
    >
      <OCTable
        class="h-full"
        ref="ocServerTableUG"
        v-model="selectedServerUG"
        :api="{
          url: 'api/parentguardian/list_not_register',
          method: 'POST',
        }"
        :options="{}"
        :columns="unregisteredGuardian"
        @update:data="updateDataUG"
        @update:dataSrc="updateDataSrcUG"
        :show-template="isShowServerTemplateUG"
      >
        <template #no="props">
          <div>
            {{ formatNumberWithLeadingZero(props.rowIndex + 1) }}
          </div>
        </template>
        <template #name="props">
          <OCProfileInfo
            :title="
              tBy({
                km: `${
                  props.rowData.Name
                    ? props.rowData.Name
                    : props.rowData.EnglishName
                }`,
                en: `${
                  props.rowData.EnglishName
                    ? props.rowData.EnglishName
                    : props.rowData.Name
                }`,
              })
            "
            subTitle=""
            gender=""
            :src="getUrl(props.rowData.PathImage, true)"
          />
        </template>
        <template #Occupation="props">
          <div>
            {{ props.rowData.Occupation }}
          </div>
        </template>
        <template #dateOfBird="props">
          <div v-if="props.rowData.DateOfBirth">
            {{ ocdate(props.rowData.DateOfBirth).format() }}
          </div>
        </template>
        <template #Child="props">
          <OCPopover use="flowbite" placement="bottom">
            <template #trigger>
              <div class="flex">
                <div
                  v-for="(c, i) in props.rowData.Students.slice(0, 3)"
                  :class="`${
                    i > 0 ? 'ml-[-16px]' : ''
                  } w-[25px] h-[25px] rounded-full bg-white p-[2px]`"
                >
                  <img
                    class="rounded-full w-full h-full object-cover"
                    :src="
                      c.PathImage
                        ? getUrl(c.PathImage, true)
                        : '/img/default-user.png'
                    "
                  />
                </div>
              </div>
            </template>

            <div class="grid items-center gap-3">
              <div v-for="relation in props.rowData.StudentRelation">
                <div
                  class="font-bold text-xs color-w-b-1 pb-2"
                  v-if="relation.Relation"
                >
                  {{ relation.Relation }}
                </div>
                <div
                  class="font-bold text-xs color-w-b-1 pb-2"
                  v-if="!relation.Relation"
                >
                  Other
                </div>
                <div class="grid items-center gap-2.5">
                  <div
                    class="flex items-center gap-1"
                    v-for="(child, i) in relation.Detail"
                    :key="child.StudentCode"
                  >
                    <OCAvatar
                      class="w-[30px] h-[30px] rounded-full border p-[2px]"
                      size="1"
                      round="l"
                      errorType="user"
                      :src="
                        child.PathImage
                          ? getUrl(child.PathImage, true)
                          : '/img/default-user.png'
                      "
                      :class="{
                        'borderColor-male': child.Gender === 'Male',
                        'borderColor-female': child.Gender === 'Female',
                      }"
                    />
                    <div class="grid items-center">
                      <div class="text-xs color-w-b-1">
                        {{ tBy({ km: child.Name, en: child.EnglishName }) }}
                      </div>
                      <div class="text-[10px] color-w-b-2">
                        {{ child.StudentCode }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </OCPopover>
        </template>

        <template #Email="props">
          <div>
            {{ props.rowData.Email }}
          </div>
        </template>
        <template #Phone="props">
          <div
            class="phone-number-container"
            v-if="props.rowData.Phone != null"
          >
            <div
              class="phone-number color-bg-wrapper"
              v-if="props.rowData.Phone.length <= 2"
            >
              <i class="ri-phone-line bg-primary"></i>
              <span class="text-[0.69rem] color-text">
                {{ props.rowData.Phone.slice(0, 2).join(" / ") }}
              </span>
            </div>
          </div>
          <OCPopover
            use="flowbite"
            placement="bottom"
            v-if="props.rowData.Phone != null"
          >
            <template #trigger>
              <div class="phone-number-container">
                <div
                  class="phone-number color-bg-wrapper"
                  v-if="props.rowData.Phone.length > 2"
                >
                  <i class="ri-phone-line bg-primary"></i>
                  <span class="text-[0.69rem] color-text">
                    {{ props.rowData.Phone.slice(0, 2).join(" / ") }}
                    <i
                      class="ri-arrow-down-s-fill"
                      v-if="props.rowData.Phone.length > 2"
                    ></i>
                  </span>
                </div>
              </div>
            </template>

            <div class="grid items-center gap-3">
              <div class="phone-number-container">
                <div
                  class="phone-number color-bg-wrapper"
                  v-if="props.rowData.Phone != null"
                >
                  <i class="ri-phone-line bg-primary"></i>
                  <span class="text-[0.69rem] color-text">
                    {{ props.rowData.Phone.slice(2, 3).join(" / ") }}
                  </span>
                </div>
              </div>
            </div>
          </OCPopover>
        </template>
      </OCTable>
    </div>
    <div
      class="table-of-unregistered-student h-full rty-parent-table"
      v-show="currentTab == 'US'"
    >
      <OCTable
        class="h-full"
        ref="ocServerTableUS"
        v-model="selectedServerUS"
        :api="{
          url: 'api/student/list_not_register',
          method: 'POST',
        }"
        :options="{}"
        :columns="unregisteredStudent"
        @update:data="updateDataUS"
        @update:dataSrc="updateDataSrcUS"
        :show-template="isShowServerTemplateUS"
      >
        <template #no="props">
          <div>
            {{ formatNumberWithLeadingZero(props.rowIndex + 1) }}
          </div>
        </template>
        <template #name="props">
          <OCProfileInfo
            :title="
              tBy({
                km: `${
                  props.rowData.Name
                    ? props.rowData.Name
                    : props.rowData.EnglishName
                }`,
                en: `${
                  props.rowData.EnglishName
                    ? props.rowData.EnglishName
                    : props.rowData.Name
                }`,
              })
            "
            :subTitle="props.rowData.Code"
            :gender="props.rowData.Gender == 1 ? 'female' : 'male'"
            :src="`${
              props.rowData.PathImage ? getUrl(props.rowData.PathImage) : ''
            }`"
          />
        </template>

        <template #dateOfBird="props">
          <div class="" v-if="props.rowData.DateOfBirth">
            {{ ocdate(props.rowData.DateOfBirth).format() }}
          </div>
        </template>
        <template #Email="props">
          <div>
            {{ props.rowData.Email }}
          </div>
        </template>
        <template #Phone="props">
          <div class="phone-number-container">
            <div
              class="phone-number color-bg-wrapper"
              v-if="props.rowData.Phone1 != ''"
            >
              <i class="ri-phone-line bg-primary"></i>
              <div>
                <span class="text-[0.69rem] color-text">
                  {{ props.rowData.Phone1 }} </span
                ><span
                  class="text-[0.69rem] color-text"
                  v-if="props.rowData.Phone2 != ''"
                >
                  / </span
                ><span class="text-[0.69rem] color-text">
                  {{ props.rowData.Phone2 }}
                </span>
              </div>
            </div>
          </div>
        </template>
      </OCTable>
    </div>
  </RWrapperPage>
</template>
<script setup>
const { tr } = useTr()
const dataMenu = useMenuStore();
const breadCrumb = useBreadCrumb();
const ocServerTable = ref();
const ocServerTableUG = ref();
const ocServerTableUS = ref();
const isShowServerTemplate = ref(false);
const isShowServerTemplateUG = ref(false);
const isShowServerTemplateUS = ref(false);
const selectedServer = ref([]);
const selectedServerUG = ref([]);
const selectedServerUS = ref([]);
const dataChips = defineModel("chips");
const selectedRadioStatus = ref();
const { t } = useI18n();
const currentTab = ref("R");
const isShowChild = false;
function showChild() {
  isShowChild = !isShowChild;
}
const items = [
  {
    label: t("registered_user"),
    value: "R",
  },
  {
    label: t("unregistered_guardian"),
    value: "UG",
  },
  {
    label: t("unregistered_student"),
    value: "US",
  },
];
const dataFilter = ref({
  UserType: null,
  Status: [],
});

const optionsFilterDataType = [
  { value: "Student", label: t("student") },
  { value: "Guardian", label: t("guardian") },
];
const optionsFilterStatus = [
  { value: 1, label: t("Active"), name: "Active" },
  { value: 4, label: t("Pending"), name: "Pending" },
  { value: 0, label: t("Disabled"), name: "Disabled" },
  { value: 2, label: t("Deleted"), name: "Deleted" },
];
function onSaveFilter(close) {
  let Active = dataFilter.value.Status.filter((v) => v == 1)[0];
  let Pending = dataFilter.value.Status.filter((v) => v == 4)[0];
  let Disabled = dataFilter.value.Status.filter((v) => v == 0)[0];
  let Deleted = dataFilter.value.Status.filter((v) => v == 2)[0];
  dataChips.value = [
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
    dataChips.value = dataChips.value.filter((f) => f.pk != d.pk);
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
function reload() {
  ocServerTable.value.reload();
}
watch(dataChips, () => {
  reload();
});
function changeTap(index) {
  let onTap = items[index];
  currentTab.value = onTap.value;
}
function formatPhone(phone) {
  if (phone.startsWith("+855")) {
    return "0" + phone.slice(4);
  }
  return phone;
}
function formatNumberWithLeadingZero(n) {
  return n < 10 ? `0${n}` : n;
}
const columnsServer = [
  {
    title: t("n_o"),
    data: null,
    ordering: false,
    className: "min-width",
    render: "#no",
  },
  {
    title: t("user_name"),
    data: null,
    ordering: false,
    className: " ",
    render: "#name",
  },

  {
    title: t("date_of_birth"),
    data: null,
    className: "min-width",
    render: "#dateOfBird",
  },
  {
    title: t("user_type"),
    data: null,
    className: "min-width",
    render: "#UserType",
  },
  {
    title: t("email"),
    data: null,
    className: "min-width",
    render: "#Email",
  },
  {
    title: t("phone"),
    data: null,
    className: "min-width",
    render: "#Phone",
  },
  {
    title: t("status"),
    data: null,
    className: "all min-width",
    render: "#Status",
  },
  {
    title: t("user_create"),
    data: null,
    className: "min-width",
    render: "#CreatedBy",
  },

  {
    title: t("user_update"),
    data: null,
    className: "min-width",
    render: "#UpdatedBy",
  },
];
const unregisteredGuardian = [
  {
    title: t("n_o"),
    data: null,
    ordering: false,
    className: "min-width",
    render: "#no",
  },
  {
    title: t("guardian"),
    data: null,
    ordering: false,
    className: "",
    render: "#name",
  },
  {
    title: t("occupation"),
    data: null,
    className: "min-width",
    render: "#Occupation",
  },
  {
    title: t("date_of_birth"),
    data: null,
    className: "min-width",
    render: "#dateOfBird",
  },
  {
    title: t("child"),
    data: null,
    className: "min-width",
    render: "#Child",
  },
  {
    title: t("email"),
    data: null,
    className: "min-width",
    render: "#Email",
  },
  {
    title: t("phone"),
    data: null,
    className: "min-width",
    render: "#Phone",
  },
];
const unregisteredStudent = [
  {
    title: t("n_o"),
    data: null,
    ordering: false,
    className: "min-width",
    render: "#no",
  },
  {
    title: t("student"),
    data: null,
    ordering: false,
    className: "",
    render: "#name",
  },

  {
    title: t("date_of_birth"),
    data: null,
    className: "min-width",
    render: "#dateOfBird",
  },
  {
    title: t("email"),
    data: null,
    className: "min-width",
    render: "#Email",
  },
  {
    title: t("phone"),
    data: null,
    className: "min-width",
    render: "#Phone",
  },
];

function updateDataSrcUG(d) {
  d.dataSrc = d;
}
function updateDataSrcUS(d) {
  d.dataSrc = d;
}
function updateData(d) {
  d.UserType = dataFilter.value?.UserType
    ? [dataFilter.value?.UserType]
    : ["Student", "Guardian"];
  d.Status = dataFilter.value?.Status;
  d.OrderBy = undefined;
  d.OrderDir = undefined;
}
function updateDataUG(d) {
  d = {};
}
function updateDataUS(d) {
  d = {};
}
mounted(async () => {
  if (!dataMenu.getData.length) {
    await dataMenu.get();
  }

  dataMenu.setSelected("user_and_privilege");
  breadCrumb.add({
    hasBack: false,
    label: t("view_guardain_register"),
    fnBack: () => {},
  });
});
onUnmounted(() => {
  dataFilter.value = {};
});
definePageMeta({ layout: 'navbar', middleware: ['auth', 'permission'], permission: 'VIEW_USER' })
</script>
<style>
.rty-head-title {
  display: grid;
  grid-template-columns: auto 1fr auto;
  padding: 0px 20px;
}
.rty-head-title .rty-left {
  display: flex;
  gap: 5px;
  font-weight: bold;
  letter-spacing: 0;
}
.text-title-of-mobile-phone {
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 0;
}

.image-data-table-user-mobile-app {
  display: flex;
  gap: 5px;
  justify-content: start;
  align-items: center;
}

.gender-mobile-phone-male {
  border: 1px solid #1fabbd;
  border-radius: 10px;
  color: #1fabbd;
  padding: 5px 10px;
}
.gender-mobile-phone-female {
  border: 1px solid #ff0000;
  border-radius: 10px;
  color: #ff0000;
  padding: 5px 10px;
}
.Guardian {
  color: #94ff19;
}
.Student {
  color: #066fee;
}
.phone-number-container {
  width: min-content;
  cursor: pointer;
}
.phone-number {
  padding: 5px 10px 5px 5px;
  background-color: #f4f4f4;
  border-radius: 15px;
  color: black;
  display: flex;
  align-items: center;
  gap: 5px;
}
.phone-number i {
  padding: 1.5px 4px;
  color: white;
  border-radius: 100%;
  font-size: 10px;
}
.menu-choose-option-mobile-user {
  display: flex;
  gap: 20px;
  font-size: 13px;
  padding-left: 20px;
  padding-top: 20px;
}
.active-option {
  border-bottom: 4px solid #189c9b;
  color: #189c9b;
  padding-bottom: 3px;
}
.username-content {
  display: flex;
  flex-direction: column;
}
.bolder-font {
  font-weight: 600;
}
.status-active {
  color: #8bc34a;
}
.status-disabled {
  color: #b6b6b6;
}
.status-pending {
  color: #ffc700;
}

.display-none {
  display: none;
}
.child-container {
  position: relative;
  display: flex;
}
.style-child-unregistered-guardian {
  position: absolute;
}
.image-user--2 {
  position: absolute;
  left: 20px;
}
.image-user--3 {
  position: absolute;
  left: 40px;
}
.action-show-child {
  position: absolute;
  background-color: #adadad;
  z-index: 1;
  padding: 10px;
  border-radius: 10px;
}
</style>
