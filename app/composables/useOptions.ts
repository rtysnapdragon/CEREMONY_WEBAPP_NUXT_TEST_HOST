import type { HttpOptions, HeaderResult } from "../models/http.js";
import { useCookie } from "#imports";

export default function useOptions(
  url: string,
  options?: HttpOptions
): HeaderResult | undefined {
  const { str } = helper();
  const lang = useCookie(str.langCode).value ?? "en";
  const deviceId = getDeviceId();
  const dbCookie = useCookie(str.dbCode);

  // Single source of truth: access_token cookie written by auth store on login/refresh
  const accessToken = useCookie('access_token').value;
  const authorization = accessToken ? `Bearer ${accessToken}` : "";

  const extraHeaders = isNotEmpty(options?.headers) ? options!.headers : undefined;
  const { headers: _dropped, body, ...restOptions } = options ?? {};

  // Don't set Content-Type for FormData — let the browser set it with the multipart boundary
  const isMultipart = body instanceof FormData;

  const mergedOptions = {
    ...restOptions,
    data: body ?? restOptions.data,
    headers: {
      Authorization: authorization,
      ...(isMultipart ? {} : { "Content-Type": "application/json" }),
      Accept: "application/json, text/javascript, */*; q=0.01",
      lang,
      rty_device_id: deviceId,
      rty_database: dbCookie.value,
      'Rty-Database': dbCookie.value || '',
      ...extraHeaders,
    },
  };

  return { url: getUrl(url, options?.isWeb), options: mergedOptions };
}
