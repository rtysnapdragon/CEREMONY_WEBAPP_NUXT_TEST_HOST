import { ref } from "vue";
import axios from "axios";

export const useAuth = async (args) => {
  const { str, config } = helper();
  const userCatch = useUserData().value;
  const isOnline = useOnline();
  const locale = useCookie(str.langCode).value;
  const deviceId = getDeviceId();
  const dbCode = useCookie(str.dbCode).value;
  const isActionLogin = isNotEmpty(args?.username) || isNotEmpty(args?.password);
  const accessTokenCookie = useCookie('access_token').value
  try {
    if (!isOnline.value) {
      throw {
        response: {
          data: {
            Message: "No internet connection",
            StatusCode: 1001,
          },
        },
      };
    }

    const response = await axios({
      url: getUrl("/api/v1/auth/login"),
      headers: {
        "Content-Type": "application/json",
        rty_device_id: deviceId,
      },
      method: "post",
      data: {
        username: args?.username ?? "",
        password: args?.password ?? "",
      },
    });

    // Spring returns: { data: { accessToken, refreshToken, tokenType, userId, username, email, organizationId, roles, permissions } }
    const payload = response.data?.data ?? response.data;

    let result = {
      token_type: payload.tokenType ?? 'Bearer',
      access_token: payload.accessToken,
      refresh_token: payload.refreshToken,
      expires_in: 86400,
      userId: payload.userId,
      username: payload.username,
      email: payload.email,
      organizationId: payload.organizationId,
      roles: payload.roles ?? [],
      permissions: payload.permissions ?? [],
    };

    result.created_at = new Date();
    useUserData(result);
    // useAuthorizeIframe({
    //   action: "set_authorize_cookie",
    //   data: {
    //     cookie: {
    //       oc_lang: locale ?? "en",
    //       rty_database: dbCode || "",
    //       rty_device_id: deviceId,
    //       oc_access_token: result.access_token,
    //       oc_expire: result.expires,
    //     },
    //     sameSite: config.sameSite,
    //   },
    // });

    return { data: ref(result), error: ref(null) };
  } catch (e) {
    const data = e?.response?.data;
    if (data) {
      if (data.error == "invalid_grant" && !isActionLogin) {
        useCookie("rty_user_data").value = null;
        navigateTo("/auth/login");
      }
      return { error: ref(data), data: ref(null) };
    } else {
      return { error: ref(e), data: ref(null) };
    }
  }
};
