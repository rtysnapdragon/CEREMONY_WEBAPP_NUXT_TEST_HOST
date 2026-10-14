<template>
  <div>
    <fwb-dropdown placement="top" class="rty-popup-drop-record" close-inside>
      <template #trigger>
        <div class="trigger">
          <span
            >{{ model }}
            <i
              class="ri-arrow-down-s-line"
              :class="[!!refPopup ? 'isShow' : '', { disabled: props.loading }]"
            ></i
          ></span>
        </div>
      </template>
      <FwbListGroup class="popup" ref="refPopup">
        <div class="item" v-for="item in items" @click="fnClick(item)">
          <span>{{ item }}</span>
        </div>
      </FwbListGroup>
    </fwb-dropdown>

    <!-- <span>{{ tr('show') }}</span> -->
    <!-- <USelect
        v-model="model"
        :items="items"
        size="sm"
        value-key="value"
        :disabled="props.loading"
        :aria-label="tr('rows_per_page')"
        :ui="uiSelection"
        >
      </USelect> -->
    <!-- :items="sizeItems" -->
    <!-- <template # trailing>
      <i class="ri-arrow-down-s-line" />
    </template> -->
  </div>
</template>

<script setup>
const { tr } = useTr();
const model = defineModel();
const props = defineProps(["loading"]);
const emit = defineEmits(["select"]);
const items = [10, 20, 50, 100];
const refPopup = ref();

function fnClick(val) {
  model.value = val;
  emit("select");
}

const uiSelection = {
  base: "r-select-field-base min-w-[80px] relative group rounded-md inline-flex items-center disabled:cursor-not-allowed disabled:opacity-75 transition-colors",
  content: "r-select-field-content",
  trailing: "r-select-trailing",
  trailingIcon: "r-select-trailing-icon",
};
</script>

<style lang="scss" scoped>
.rty-popup-drop-record {
  display: flex;
  grid-gap: 6px;
  user-select: none;
  position: relative;

  .trigger {
    width: 60px;
    height: 32px;
    border-radius: 10px;
    padding: 0px 8px 0px 10px;

    background: var(--bg-content);
    color: var(--color-w-b-1);
    cursor: pointer;

    span {
      height: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      line-height: 13px;
      pointer-events: none;
      i {
        font-size: 13px;
        line-height: 13px;
        transition: 0.2s ease-in-out;

        &.isShow {
          transform: rotate(180deg);
        }
      }
    }

    .disabled {
      pointer-events: none;
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .popup {
    width: 60px;
    min-width: 60px;
    position: absolute;
    padding: 6px 0px;
    background: var(--bg-content);
    border-radius: 10px;
    box-shadow: 0px 6px 20px #0000002d;
    bottom: 4px;
    animation: ani-top 0.2s ease-in-out;
    transform: translateY(6px);
    opacity: 1;
    display: flex;
    flex-direction: column;
    border: none;

    @keyframes ani-top {
      from {
        transform: translateY(0px);
        opacity: 0;
      }

      to {
        transform: translateY(6px);
        opacity: 1;
      }
    }

    .item {
      height: 25px;
      padding: 0px 16px;
      font-size: 13px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      color: var(--color-w-b-1);
      transition: 0.25s ease-in-out;

      span {
        pointer-events: none;
      }

      &:hover {
        color: var(--color-primary);
      }
      &.active {
        color: var(--color-primary);
      }
    }
  }
}

.rty-content,
.rty-modal {
  .rty-popup-drop-record {
    .trigger {
      background: var(--c-surface);
    }
    .popup {
      background: var(--c-surface);
    }
  }
}

.disabled {
  pointer-events: none;
  opacity: 0.5;
}

// select USelect

.r-select-field-base {
  display: flex;
  align-items: center;
  justify-content: space-between !important;
  gap: 5px;
  width: 100%;
  padding: 4px 8px;
  border-radius: 8px;
  min-width: 40px !important;
  width: 60px !important;
}

.r-select-trailing {
  padding: 0 !important;
  margin: 0 !important;
  gap: 0 !important;
}

// [data-slot="base"] {
//   justify-content: space-between !important;
//   gap: 60px;
// }

.r-select-field-content {
  display: flex;
  flex-direction: column;
  padding: 5px !important;
  min-width: fit-content !important;
}

.pagination-goto {
  display: flex;
  align-items: center;
  gap: 8px;

  .u-input {
    width: 70px;
    height: 70px;
    text-align: center;
  }
}
</style>
