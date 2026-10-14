# RSlider Dismissible Mode (Unsaved Changes Protection)

## Overview

Use the `dismissible` prop to prevent users from accidentally closing a drawer while there are unsaved changes.

This pattern compares the current form state with its initial state and automatically disables drawer dismissal when changes are detected.

### Benefits

- Prevents accidental data loss
- Works for both Create and Edit forms
- No manual field tracking required
- Supports nested objects when using Lodash `isEqual`

---

## Dependencies

```bash
npm install lodash-es
```

```js
import isEqual from "lodash-es/isEqual";
import cloneDeep from "lodash-es/cloneDeep";
```

---

## Implementation

### 1. Define Form State

```js
const defaultForm = () => ({
  code: "",
  name: "",
  active: true,
});

const form = reactive(defaultForm());
const initialForm = ref({});
```

---

### 2. Capture Initial State

Store a snapshot of the form whenever the drawer is opened.

#### Create Mode

```js
const openCreate = () => {
  editing.value = null;

  Object.assign(form, defaultForm());

  initialForm.value = cloneDeep(form);

  showDrawer.value = true;
};
```

#### Edit Mode

```js
const openEdit = (item) => {
  editing.value = item;

  Object.assign(form, {
    code: item.code,
    name: item.name,
    active: item.active,
  });

  initialForm.value = cloneDeep(form);

  showDrawer.value = true;
};
```

---

### 3. Detect Changes

```js
const isDirty = computed(() => {
  return !isEqual(form, initialForm.value);
});
```

`isDirty` becomes:

| State            | Value   |
| ---------------- | ------- |
| No changes       | `false` |
| Form modified    | `true`  |
| Changes reverted | `false` |

---

### 4. Control Drawer Dismissal

```js
const dismissible = computed(() => {
  return !isDirty.value;
});
```

Behavior:

| Form State | Dismissible |
| ---------- | ----------- |
| Clean      | ✅ Yes      |
| Modified   | ❌ No       |

---

### 5. Connect to RSlider

```vue
<RSlider v-model="showDrawer" :dismissible="dismissible" @close="closeDrawer" />
```

---

## Complete Example

```js
import isEqual from "lodash-es/isEqual";
import cloneDeep from "lodash-es/cloneDeep";

const showDrawer = ref(false);
const editing = ref(null);

const defaultForm = () => ({
  code: "",
  name: "",
  active: true,
});

const form = reactive(defaultForm());

const initialForm = ref({});

const openCreate = () => {
  editing.value = null;

  Object.assign(form, defaultForm());

  initialForm.value = cloneDeep(form);

  showDrawer.value = true;
};

const openEdit = (item) => {
  editing.value = item;

  Object.assign(form, {
    code: item.code,
    name: item.name,
    active: item.active,
  });

  initialForm.value = cloneDeep(form);

  showDrawer.value = true;
};

const isDirty = computed(() => {
  return !isEqual(form, initialForm.value);
});

const dismissible = computed(() => {
  return !isDirty.value;
});

const closeDrawer = () => {
  showDrawer.value = false;
  editing.value = null;
};
```

---

## Recommended Usage

Use this pattern for:

- Create forms
- Edit forms
- Settings panels
- Configuration drawers
- Multi-step forms
- Any workflow where losing changes would be frustrating

Avoid using this pattern for:

- Read-only drawers
- Filter drawers
- Temporary selection panels
- Non-persistent UI state

---

## Future Enhancement

Instead of completely blocking dismissal, `RSlider` may optionally show a confirmation dialog:

> You have unsaved changes. Discard them?

This provides a better user experience for complex forms while still protecting user data.
