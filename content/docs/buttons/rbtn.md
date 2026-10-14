# RBtns Component Usage Guide

## Overview

`RBtns` is a responsive action group component that automatically:

* Displays actions as individual buttons on desktop/tablet.
* Displays actions inside a popover menu on mobile.
* Supports permissions.
* Supports loading states.
* Supports custom icons via slots.
* Emits a unified click event.

This component is intended to be the standard solution for action groups throughout the application.

---

# Basic Usage

```vue
<RBtns
  :data="actions"
  @click="handleAction"
/>
```

```js
const actions = [
  {
    type: 'edit',
    label: 'Edit',
    icon: 'ri-pencil-line'
  },
  {
    type: 'delete',
    label: 'Delete',
    color: 'red',
    icon: 'ri-delete-bin-line'
  }
]

function handleAction(type, item) {
  console.log(type, item)
}
```

---

# Responsive Behavior

Desktop:

```text
[ Edit ] [ Delete ]
```

Mobile:

```text
[ ⋮ ]
```

Clicking the menu button opens:

```text
Edit
Delete
```

No additional configuration is required.

---

# Action Object Structure

Each item inside `data` supports the following properties.

```js
{
  type: 'edit',
  label: 'Edit',
  icon: 'ri-pencil-line',

  color: 'primary',
  variant: 'solid',
  size: 'md',

  disabled: false,
  loading: false,
  hide: false,

  permission: 'language:update',
  showIfAllowed: true,

  class: '',
  isLabelBold: false,
  isIconRight: false,
  iconRight: '',
  noIcon: false,
  typeButton: 'button'
}
```

---

# Required Fields

## type

Unique action identifier.

```js
{
  type: 'edit'
}
```

Used in click events.

```js
function handleAction(type) {
  if (type === 'edit') {
    // edit logic
  }
}
```

---

## label

Button text.

```js
{
  label: 'Edit'
}
```

---

# Appearance

## Icon

```js
{
  icon: 'ri-pencil-line'
}
```

---

## Color

```js
{
  color: 'primary'
}
```

Example:

```js
{
  color: 'red'
}
```

---

## Variant

```js
{
  variant: 'solid'
}
```

Supported values depend on `RBtn`.

Examples:

```js
{
  variant: 'outline'
}
```

```js
{
  variant: 'ghost'
}
```

---

## Size

```js
{
  size: 'sm'
}
```

Example:

```js
{
  size: 'lg'
}
```

---

# Loading State

Useful during API requests.

```js
{
  loading: true
}
```

Example:

```js
{
  type: 'save',
  label: 'Saving...',
  loading: true
}
```

---

# Disabled State

```js
{
  disabled: true
}
```

The action cannot be clicked.

---

# Hide Action

```js
{
  hide: true
}
```

The action will not be rendered.

Example:

```js
{
  type: 'delete',
  hide: !canDelete
}
```

---

# Permission Control

Actions can be permission-based.

```js
{
  permission: 'language:update',
  showIfAllowed: true
}
```

Example:

```js
{
  type: 'edit',
  label: 'Edit',
  permission: 'language:update',
  showIfAllowed: true
}
```

Only users with the specified permission will see the action.

---

# Custom Action Icons

Provide custom icons through named slots.

## Action Configuration

```js
{
  type: 'edit'
}
```

## Component Usage

```vue
<RBtns
  :data="actions"
  @click="handleAction"
>
  <template #editicon>
    <MyCustomIcon />
  </template>
</RBtns>
```

Slot naming convention:

```text
{type}icon
```

Examples:

```vue
<template #editicon>
```

```vue
<template #deleteicon>
```

```vue
<template #publishicon>
```

---

# Handling Click Events

The component emits:

```js
@click="handleAction"
```

Example:

```js
function handleAction(type, item) {
  switch (type) {
    case 'edit':
      openEdit(item)
      break

    case 'delete':
      confirmDelete(item)
      break
  }
}
```

Parameters:

| Parameter | Description        |
| --------- | ------------------ |
| type      | Action identifier  |
| item      | Full action object |

---

# CRUD Example

```vue
<RBtns
  :data="[
    {
      type: 'edit',
      label: 'Edit',
      icon: 'ri-pencil-line'
    },
    {
      type: 'delete',
      label: 'Delete',
      color: 'red',
      icon: 'ri-delete-bin-line'
    }
  ]"
  @click="handleAction"
/>
```

```js
function handleAction(type) {
  if (type === 'edit') {
    openEdit()
  }

  if (type === 'delete') {
    openDeleteConfirm()
  }
}
```

---

# Language Management Example

```js
const actions = [
  {
    type: 'edit',
    label: 'Edit',
    icon: 'ri-pencil-line',
    permission: 'language:update',
    showIfAllowed: true
  },
  {
    type: 'delete',
    label: 'Delete',
    icon: 'ri-delete-bin-line',
    color: 'red',
    permission: 'language:delete',
    showIfAllowed: true
  }
]
```

```vue
<RBtns
  :data="actions"
  @click="handleAction"
/>
```

---

# Best Practices

### Use type as the action identifier

```js
{
  type: 'edit'
}
```

Avoid using labels for logic.

---

### Keep actions small

Recommended:

```js
[
  { type: 'edit' },
  { type: 'delete' }
]
```

Avoid placing large business objects inside action definitions.

---

### Use loading during API operations

```js
{
  type: 'save',
  loading: saving.value
}
```

---

### Always use permissions for protected actions

```js
{
  permission: 'user:delete',
  showIfAllowed: true
}
```

---

# Summary

`RBtns` provides:

* Responsive desktop/mobile action rendering
* Automatic mobile popover support
* Permission-aware actions
* Loading and disabled states
* Custom icon slots
* Unified click handling
* Consistent UI across the application

Use `RBtns` whenever multiple related actions need to be displayed for a record, page, card, table row, or management screen.
