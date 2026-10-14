---
title: Documentation
description: Sarika UI Components
---

# Sarika UI Documentation

Welcome to Sarika UI documentation.

## Components

- RButton
- RSwitch
- RDatePicker

---

## Quick Links

- [Getting Started](/docs/getting-started)
- [Components](/docs/components)
- [Forms](/docs/forms)
- [RTable](/docs/table)
- [RDatePicker](/docs/components/r-datepicker)
- [RInput](/docs/components/r-input)
- [RSwitch](/docs/components/r-switch)

---

# ---------------------Special Usage-----------------------------------

```bash
##### Translate key
/// Use tBy function to translate the key with both template and script don't need import
Example : const title = tBy({ en: 'English', km: 'Khmer' })

/// t function is used to translate the key in script
Example :
    const { t } = useI18n()
    const title = t('English')

/// $t in template
Example : {{ $t('English') }}

```

# ---------------------General Usages----------------------------------

```bash
#### RConfirm Usage------------------------------------------------------
const confirm = useConfirmStore()
confirm.show({
    type:'confirm',
    title:'Confirm',
    message:'Do you want to update?',
    onConfirm: async ()=>{
        console.log('confirm')
    },
    onCancel:async ()=>{
        await console.log('cancel') //for using with api
    }
})

Note : use async await to wait loading while user press yes in confirm before close panel mean when success close panel
```

## Available Components

### Inputs

- [RInput](/docs/components/r-input)
- [RDatePicker](/docs/components/r-datepicker)

### Actions

- [RButton](/docs/components/r-button)
- [RSwitch](/docs/components/r-switch)

## Form Components

- [RTable](/docs/table)
- [RDatePicker](/docs/components/r-datepicker)

---
