// Thin wrapper around your backend (mirrors the useHttp(url, {method, data})
// convention used across SARIKA/Report Management projects).
// Swap the endpoints below for the real API once ready — everything that
// consumes this composable only cares about the shape returned by
// normalizeTemplate(), so the backend can evolve independently.

export const useWeddingApi = () => {
  const config = useRuntimeConfig()
  const base = config.public.apiUrl || '/api/weddings'

  const normalizeTemplate = (raw) => ({
    id: raw?.id ?? null,
    slug: raw?.slug ?? '',
    theme: raw?.theme ?? 'gold-cream', // 'gold-cream' | 'celestial' | custom key
    background: raw?.background ?? { type: 'gradient', value: null },
    groom: raw?.groom ?? {},
    bride: raw?.bride ?? {},
    eventDate: raw?.eventDate ?? null,
    schedule: raw?.schedule ?? [],
    location: raw?.location ?? {},
    gifts: raw?.gifts ?? [],
    story: raw?.story ?? [],
    sections: raw?.sections ?? [], // ordered list driving WTemplateRenderer
  })

  const fetchTemplate = async (slug) => {
    const { data, error } = await useFetch(`${base}/${slug}`)
    if (error.value) throw error.value
    return normalizeTemplate(data.value)
  }

  const fetchTemplateList = async () => {
    try {
      const { data, error } = await useHttp('/api/v1/invitation-templates?page=0&size=200', {
        method: 'GET',
        isGlobal: true,
      })
      if (error?.value) return []
      const result = data.value?.data ?? data.value
      const content = Array.isArray(result) ? result : result?.content ?? []
      return content.map((t) => ({
        id: t.id,
        slug: t.name ?? t.id,
        title: t.labelEn ?? t.name ?? t.id,
        eventDate: null,
        cover: t.thumbnail ?? '',
        theme: 'gold-cream',
      }))
    } catch {
      return []
    }
  }

  const saveTemplate = async (slug, payload) => {
    return await $fetch(`${base}/${slug}`, { method: 'PUT', body: payload })
  }

  const submitRsvp = async (slug, payload) => {
    return await $fetch(`${base}/${slug}/rsvp`, { method: 'POST', body: payload })
  }

  return { fetchTemplate, fetchTemplateList, saveTemplate, submitRsvp, normalizeTemplate }
}
