<template>
  <div class="flex h-screen bg-gray-100">

    <!-- sidebar -->
    <FileSidebar />

    <!-- main -->
    <div class="flex-1 flex flex-col">

      <FileToolbar />

      <div class="flex-1 overflow-auto p-6">
        <slot />
      </div>

    </div>

  </div>
</template>