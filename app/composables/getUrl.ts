// ~/composables/useServerUrls.ts
import axios from 'axios'
import { useCookie, useRuntimeConfig } from '#imports'

export const getSUrl = async () => {
  const config = useRuntimeConfig()
  try {
    const { data } = await axios.get(
      `${config.public.apiBase}v1/url/get`
    )
    useCookie('tmp_server', {
      path: '/',
      secure: true
    }).value = data.api_url
    useCookie('tmp_web_server', {
      path: '/',
      secure: true
    }).value = data.web_url
  } catch (err) {
    console.warn('Fallback server URLs used', err)
    useCookie('tmp_server', {
      path: '/',
      secure: true
    }).value = config.public.apiUrl
    useCookie('tmp_web_server', {
      path: '/',
      secure: true
    }).value = config.public.webUrl
  }
}
