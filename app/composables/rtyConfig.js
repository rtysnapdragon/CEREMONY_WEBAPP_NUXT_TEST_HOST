// import { useCookie } from '#imports'

// export const rtyConfig = () => {
//   const isProd = process.env.NODE_ENV === 'production'
//   const runtimeConfig = useRuntimeConfig()
//   return {
//     config: {
//       // apiUrl: isProd
//       //   ? 'https://riththy-tech-api-django.onrender.com'
//       //   : 'http://localhost:45687',
//       // webUrl: isProd
//       //   ? 'https://riththy-agriculture-nuxt.vercel.app'
//       //   : 'http://localhost:3003',

//       apiUrl: useCookie('tmp_server').value,
//       webUrl: useCookie('tmp_web_server').value
//     },
//   }
// }


export const rtyConfig = () => {
  const runtimeConfig = useRuntimeConfig()
  const tmpServer = useCookie('tmp_server').value
  const tmpWebServer = useCookie('tmp_web_server').value

  return {
    config: {
      apiUrl: tmpServer || runtimeConfig.public.apiUrl,
      webUrl: tmpWebServer || runtimeConfig.public.webUrl
    }
  }
}