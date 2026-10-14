// composables/useGuestComms.js — Email & Telegram sending via Spring API
// POST /api/v1/weddings/{id}/guests/{guestId}/email/send
// POST /api/v1/weddings/{id}/email/send-all
// POST /api/v1/weddings/{id}/guests/{guestId}/telegram/send
// POST /api/v1/weddings/{id}/telegram/send-all

export const useGuestComms = () => {
  const eventStore = useEventStore()
  const sending = ref(false)

  const weddingId = () => eventStore.activeEvent?.id

  const sendEmail = async (guestId) => {
    const id = weddingId()
    if (!id) return { success: false }
    sending.value = true
    try {
      const { error } = await useHttp(`/api/v1/events/${id}/guests/${guestId}/email/send`, {
        method: 'POST', isGlobal: true,
      })
      return error.value ? { success: false, error: error.value } : { success: true }
    } finally {
      sending.value = false
    }
  }

  const sendEmailAll = async () => {
    const id = weddingId()
    if (!id) return { success: false }
    sending.value = true
    try {
      const { error } = await useHttp(`/api/v1/events/${id}/email/send-all`, {
        method: 'POST', isGlobal: true,
      })
      return error.value ? { success: false, error: error.value } : { success: true }
    } finally {
      sending.value = false
    }
  }

  const sendTelegram = async (guestId) => {
    const id = weddingId()
    if (!id) return { success: false }
    sending.value = true
    try {
      const { error } = await useHttp(`/api/v1/events/${id}/guests/${guestId}/telegram/send`, {
        method: 'POST', isGlobal: true,
      })
      return error.value ? { success: false, error: error.value } : { success: true }
    } finally {
      sending.value = false
    }
  }

  const sendTelegramAll = async () => {
    const id = weddingId()
    if (!id) return { success: false }
    sending.value = true
    try {
      const { error } = await useHttp(`/api/v1/events/${id}/telegram/send-all`, {
        method: 'POST', isGlobal: true,
      })
      return error.value ? { success: false, error: error.value } : { success: true }
    } finally {
      sending.value = false
    }
  }

  return { sending, sendEmail, sendEmailAll, sendTelegram, sendTelegramAll }
}
