import { v4 as uuidv4 } from 'uuid';

export const useDeviceId = (): string => {
  // SSR-safe: useCookie works on both server and client
  const cookie = useCookie('rty_device_id', {
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'lax',
  });

  if (!cookie.value) {
    cookie.value = uuidv4();
  }

  return cookie.value!;
}

// Function to set cookies
function setCookie(name: string, value: string, options: any = {}) {
  let cookieString = `${name}=${value};`;

  if (options.expires) {
    // If expires is a number, calculate the expiration date
    if (typeof options.expires === 'number') {
      const expiresDate = new Date();
      expiresDate.setDate(expiresDate.getDate() + options.expires); // Expiry in days
      cookieString += `expires=${expiresDate.toUTCString()};`;
    } else if (options.expires instanceof Date) {
      // If expires is a Date object, format it to UTC string
      cookieString += `expires=${options.expires.toUTCString()};`;
    }
  }
  if (options.path) cookieString += `path=${options.path};`;
  if (options.secure) cookieString += 'secure;';
  if (options.sameSite) cookieString += `SameSite=${options.sameSite};`;

  document.cookie = cookieString;
}

// Function to get cookies by name
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// // composables/useDeviceId.ts
// import { v4 as uuidv4 } from 'uuid'

// export const useDeviceId = () => {
//   const DEVICE_KEY = 'rty_device_id'
  
//   // Check if the deviceId is available in cookies
//   let deviceId = getCookie(DEVICE_KEY);

// // const DEVICE_KEY = `rty_device_id_${username}`;
// //   let deviceId: string | null = localStorage?.getItem(DEVICE_KEY)

//   if (!deviceId) {
//     deviceId = uuidv4()
//     // localStorage.setItem(DEVICE_KEY, deviceId)
//     setCookie(DEVICE_KEY, deviceId, { path: '/', secure: true, sameSite: 'Strict', expires: 365 });
//   }

//   return deviceId
// }

// function setCookie(name, value, options = {}) {
//     let cookieString = `${name}=${value};`;
  
//     if (options.expires) {
//       // If expires is a number, calculate the expiration date
//       if (typeof options.expires === 'number') {
//         const expiresDate = new Date();
//         expiresDate.setDate(expiresDate.getDate() + options.expires); // Expiry in days
//         cookieString += `expires=${expiresDate.toUTCString()};`;
//       } else if (options.expires instanceof Date) {
//         // If expires is a Date object, format it to UTC string
//         cookieString += `expires=${options.expires.toUTCString()};`;
//       }
//     }
//     if (options.path) cookieString += `path=${options.path};`;
//     if (options.secure) cookieString += 'secure;';
//     if (options.sameSite) cookieString += `SameSite=${options.sameSite};`;
  
//     document.cookie = cookieString;
//   }
  
// npm install uuid

// const getDeviceId = (username) => {
//     const key = `rty_device_id_${username}`;
//     let deviceId = localStorage?.getItem(key);
//     if (!deviceId) {
//       deviceId = crypto.randomUUID(); // or use uuidv4
//       localStorage.setItem(key, deviceId);
//     }
//     return deviceId;
//   };
  
// Option 2: Tie to user (if needed per-user tracking)
// You can namespace the key by username:

// ts
// Copy
// Edit
// const DEVICE_KEY = `rty_device_id_${username}`;