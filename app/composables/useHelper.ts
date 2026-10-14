// /composables/useHelper.ts
import { ref } from 'vue'
import getHelper from '../utils/getHelper'
export const useHelper = async (layers = []) => {
  const helper = ref({ api: {}, str: {},config:{} })
  try {
    helper.value = await getHelper(layers)
  } catch (e) {
    helper.value = { api: {}, str: {},config:{} }
  }
  return helper.value
}