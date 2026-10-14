<template>
  <div class="p-6 space-y-6">
    <!-- Single Select with Local Data -->
    <div>
              <RSelect
        v-model="selectedUser"
        :local-data="localUsersData"
        />
      <h3 class="text-lg font-semibold mb-2">Single Select with Local Data</h3>
      <RSelect
        v-model="selectedUser"
        :local-data="localUsersData"
        :pk="'id'"
        :searchInput="false"
        :template-leading="{
          labelKey: 'name',
          labelKeyEn: 'nameEn',
          imagePath: 'avatar',
          imageType: 'user',
          gender: 'gender'
        }"
        :template-option="{
          labelKey: 'name',
          labelKeyEn: 'nameEn',
          subLabelKey: 'email',
          subLabelKeyEn: 'email',
          imagePath: 'avatar',
          imageType: 'user'
        }"
        placeholder="Select a user"
        :clear-select="true"
        @selected="handleSingleSelect"
      />
      <div class="mt-2 text-sm text-gray-600">
        Selected: {{ selectedUser ? selectedUser.name : 'None' }}
      </div>
    </div>

    <!-- Multiple Select with Local Data -->
    <div>
      <h3 class="text-lg font-semibold mb-2">Multiple Select with Local Data</h3>
      <RSelect
        v-model="selectedUsers"
        :local-data="localUsersData"
        :pk="'id'"
        :multiple="true"
        :template-leading="{
          labelKey: 'name',
          labelKeyEn: 'nameEn',
          imagePath: 'avatar',
          imageType: 'user'
        }"
        :template-option="{
          labelKey: 'name',
          labelKeyEn: 'nameEn',
          subLabelKey: 'email',
          subLabelKeyEn: 'email',
          imagePath: 'avatar',
          imageType: 'user'
        }"
        placeholder="Select users"
        @selected="handleMultipleSelect"
      />
      <div class="mt-2 text-sm text-gray-600">
        Selected: {{ selectedUsers ? selectedUsers?.map(u => u.name).join(', ') : 'None' }}
      </div>
    </div>

    <!-- Required Field Example -->
    <div>
      <h3 class="text-lg font-semibold mb-2">Required Field with Local Data</h3>
      <RSelect
        v-model="requiredUser"
        :local-data="localUsersData"
        :pk="'id'"
        :required="true"
        :template-leading="{
          labelKey: 'name',
          labelKeyEn: 'nameEn'
        }"
        :template-option="{
          labelKey: 'name',
          labelKeyEn: 'nameEn',
          subLabelKey: 'department',
          subLabelKeyEn: 'department'
        }"
        placeholder="Select required user"
        @selected="handleRequiredSelect"
      />
      <div class="mt-2 text-sm text-gray-600">
        Selected: {{ requiredUser ? requiredUser.name : 'None' }}
      </div>
    </div>

    <!-- With Custom Variant -->
    <div>
      <h3 class="text-lg font-semibold mb-2">Custom Variant (Solid)</h3>
      <RSelect
        v-model="variantUser"
        :local-data="localUsersData"
        :pk="'id'"
        variant="solid"
        :template-leading="{
          labelKey: 'name',
          labelKeyEn: 'nameEn'
        }"
        placeholder="Select with solid variant"
        @selected="handleVariantSelect"
      />
    </div>

    <!-- Disabled State -->
    <div>
      <h3 class="text-lg font-semibold mb-2">Disabled State</h3>
      <RSelect
        v-model="disabledUser"
        :local-data="localUsersData"
        :pk="'id'"
        :disabled="true"
        :template-leading="{
          labelKey: 'name',
          labelKeyEn: 'nameEn'
        }"
        placeholder="Disabled select"
      />
    </div>

    <!-- Auto Select First Item -->
    <div>
      <h3 class="text-lg font-semibold mb-2">Auto Select First (defaultSelect=true)</h3>
      <RSelect
        v-model="autoSelectUser"
        :local-data="localUsersData"
        :pk="'id'"
        :default-select="true"
        :template-leading="{
          labelKey: 'name',
          labelKeyEn: 'nameEn'
        }"
        placeholder="Auto selects first item"
        @selected="handleAutoSelect"
      />
    </div>

    <!-- Searchable with Custom Key Search -->
    <div>
      <h3 class="text-lg font-semibold mb-2">Searchable with Custom Keys</h3>
      <RSelect
        v-model="searchableUser"
        :local-data="{
          data: localUsersData.data,
          keySearch: ['name', 'nameEn', 'email', 'department']
        }"
        :pk="'id'"
        :searchable="true"
        :template-leading="{
          labelKey: 'name',
          labelKeyEn: 'nameEn'
        }"
        :template-option="{
          labelKey: 'name',
          labelKeyEn: 'nameEn',
          subLabelKey: 'department',
          subLabelKeyEn: 'department'
        }"
        placeholder="Search by name, email, or department"
        @selected="handleSearchableSelect"
      />
    </div>

    <!-- Display selected info -->
    <div class="mt-8 p-4 bg-gray-50 rounded-lg">
      <h3 class="font-semibold mb-2">Selected Data Summary:</h3>
      <pre class="text-sm">{{ JSON.stringify({
        singleUser: selectedUser,
        multipleUsers: selectedUsers,
        requiredUser: requiredUser,
        variantUser: variantUser,
        autoSelectUser: autoSelectUser,
        searchableUser: searchableUser
      }, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
definePageMeta({layout:'navbar'})
// Generate 20 sample users
const generateUsers = () => {
  const firstNames = ['Sok', 'Chantha', 'Vannak', 'Srey', 'Kong', 'Maly', 'Rith', 'Sopheap', 'Kimsour', 'Sovann'];
  const lastNames = ['Pich', 'Sok', 'Touch', 'Chea', 'Phann', 'Cheng', 'Kong', 'Nhem', 'Vann', 'Khat'];
  const departments = ['IT', 'HR', 'Finance', 'Marketing', 'Operations', 'Sales', 'Engineering', 'Support'];
  const genders = ['Male', 'Female', 'Male', 'Female', 'Male', 'Female'];
  
  const users = [];
  for (let i = 1; i <= 20; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    const nameEn = `${firstName} ${lastName}`;
    const gender = genders[Math.floor(Math.random() * genders.length)];
    
    users.push({
      id: i,
      name: name,
      nameEn: name,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      department: departments[Math.floor(Math.random() * departments.length)],
      gender: gender,
      avatar: `https://i.pravatar.cc/40?img=${i}`,
      IsCurrent: i === 1, // Mark first user as current for academicYear type
      RecordCount: 20
    });
  }
  console.log("Users ======================> ", users)
  return users;
};

// Local data configuration
const localUsersData = {
  data: generateUsers(),
  keySearch: ['name', 'nameEn', 'email', 'department']
};

// Reactive refs for different use cases
const selectedUser = ref(null);
const selectedUsers = ref([]);
const requiredUser = ref(null);
const variantUser = ref(null);
const disabledUser = ref(null);
const autoSelectUser = ref(null);
const searchableUser = ref(null);

// Event handlers
function handleSingleSelect(value) {
  console.log('Single select:', value);
}

function handleMultipleSelect(value) {
  console.log('Multiple select:', value);
}

function handleRequiredSelect(value) {
  console.log('Required select:', value);
}

function handleVariantSelect(value) {
  console.log('Variant select:', value);
}

function handleAutoSelect(value) {
  console.log('Auto select:', value);
}

function handleSearchableSelect(value) {
  console.log('Searchable select:', value);
}

// Computed for demo purposes
const selectedCount = computed(() => {
  return selectedUsers.value ? selectedUsers.value.length : 0;
});
</script>

<style scoped>
.p-6 {
  max-width: 800px;
  margin: 0 auto;
}
</style>