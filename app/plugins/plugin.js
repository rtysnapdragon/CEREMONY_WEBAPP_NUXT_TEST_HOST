import { useCookie, defineNuxtPlugin } from "#app";
import isEmpty from "../utils/isEmpty";
import isNotEmpty from "../utils/isNotEmpty";
import tBy from "../utils/tBy";
import { rtydate } from "../utils/rtydate";
import { formatPhoneNumber } from "../utils/phoneNumberFornat";
import { convertToKhmerDate } from "../utils/dataConvert";
import getUrl from "../utils/getUrl";
import helper from "../utils/helper";
import mounted from "../utils/mounted";
import unMounted from "../utils/unMounted";
import { useDeviceId } from "../composables/useDeviceId";

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const cookie = useCookie('tmp_server');

  if (!cookie.value) {
    cookie.value = config.public.apiUrl;
  }

  nuxtApp.provide("isEmpty", isEmpty);
  nuxtApp.provide("isNotEmpty", isNotEmpty);
  nuxtApp.provide("tBy", tBy);
  nuxtApp.provide("rtyPhoneNumberFormat", formatPhoneNumber);
  nuxtApp.provide("rtydate", rtydate);
  nuxtApp.provide("getUrl", getUrl);
  nuxtApp.provide("helper", helper);
  nuxtApp.provide("mounted", mounted);
  nuxtApp.provide("unMounted", unMounted);
  globalThis.convertToKhmerDate = convertToKhmerDate;
  globalThis.getDeviceId = useDeviceId;
  globalThis.isNotEmpty = isNotEmpty;
  globalThis.isEmpty = isEmpty;
  globalThis.getUrl = getUrl;
  globalThis.helper = helper;
  nuxtApp.vueApp.config.globalProperties.rtydate = rtydate;
  nuxtApp.vueApp.config.globalProperties.tBy = tBy;
});



