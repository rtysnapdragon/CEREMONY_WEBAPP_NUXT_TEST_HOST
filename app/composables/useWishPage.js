export function useWishPage() {
  const wishStore = useWishStore()
  const eventStore = useEventStore()
  const toast = useToastStore()

  const deletingItem = ref(null)
  const deleting = ref(false)

  const { init } = useEventPage(() => wishStore.fetchWishes(0), 30_000)

  const formatWishDate = (dt) => {
    if (!dt) return ''
    return new Date(dt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const confirmDelete = (item) => { deletingItem.value = item }

  const doDelete = async () => {
    deleting.value = true
    try {
      const result = await wishStore.deleteWish(deletingItem.value.id)
      if (result.success) toast.add('Wish removed', 'Deleted')
      else toast.add('Failed to delete', 'Error')
      deletingItem.value = null
    } finally { deleting.value = false }
  }

  return {
    wishStore, eventStore,
    deletingItem, deleting,
    init, formatWishDate, confirmDelete, doDelete,
  }
}
