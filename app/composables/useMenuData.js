import json from "./assets/json/menu_data.json";
import { useCookie } from "nuxt/app";
import devPermission from "./assets/json/dev_permission.json";
import techPermission from "./assets/json/tech_permission.json";

const { api, str, config } = useHelper();
console.log(" API ===> ", { api, str, config })

export default async () => {
  let result = [];

  try {
    let customerMenu = await getCustomMenu();
    let allMenu = [...(json ?? []), ...(customerMenu ?? [])];

    const { data, error } = await useHttp(api?.permissions, { method: "post" });

    if (error.value) throw error.value;

    const permissions = flattenPermissionData(data.value);

    const isTeacher = extractDataFromAccessToken()["o:t"] == "Teacher";

    // Add permission module teacher
    if (isTeacher) {
      permissions.unshift(techPermission);
    }

    // Add permission dev
    if (isDevelopment()) {
      permissions.unshift(devPermission);
    }

    // Remove if hide is global and db code is "_"
    // This is used to hide global menu items for specific databases
    // For example, if a menu item is only for a specific database and should not be shown globally
    const dbCode = useCookie(str.dbCode).value;

    allMenu = allMenu.map((item) => ({
      ...item,
      menu: (item.menu || []).filter(
        (menuItem) => !(menuItem.hideGlobal && dbCode === "_")
      ),
    }));

    console.log("All --->", allMenu);
    result = checkMenuWithPermission(permissions, allMenu);
    console.log("--->", result);
  } catch (e) {
    console.log("Get permission error:", e);
  }

  return result;
};

async function getCustomMenu() {
  try {
    const response = await fetch("/customer/customMenu.json");

    if (!response.ok) {
      throw new Error("Failed to fetch customerMenu.json");
    }
    const menuData = await response.json();
    return menuData;
  } catch (error) {
    return null;
  }
}

function checkMenuWithPermission(permissions, menuItems) {
  if (!Array.isArray(menuItems)) return [];

  return menuItems.flatMap((menuItem) => {
    const permissionResult = checkActionImmutable(permissions, menuItem);

    if (!permissionResult) return [];

    const hasMenu = Array.isArray(menuItem?.menu);
    const hasDetails = Array.isArray(menuItem?.details);

    if (hasMenu && hasDetails) {
      const filteredSubMenu = checkMenuWithPermission(
        permissions,
        menuItem.menu
      );
      const filteredDetails = checkMenuWithPermission(
        permissions,
        menuItem.details
      );

      if (filteredSubMenu.length || filteredDetails.length) {
        return [
          {
            ...menuItem,
            ...permissionResult,
            menu: filteredSubMenu,
            details: filteredDetails,
          },
        ];
      }
      return [];
    }

    // Handle items with only menu
    if (hasMenu) {
      const filteredSubMenu = checkMenuWithPermission(
        permissions,
        menuItem.menu
      );
      return filteredSubMenu.length
        ? [{ ...menuItem, ...permissionResult, menu: filteredSubMenu }]
        : [];
    }

    // Handle items with only details
    if (hasDetails) {
      const filteredDetails = checkMenuWithPermission(
        permissions,
        menuItem.details
      );
      return filteredDetails.length
        ? [{ ...menuItem, ...permissionResult, details: filteredDetails }]
        : [];
    }

    // Handle leaf items (no nested menu or details)
    return [{ ...menuItem, ...permissionResult }];
  });
}

function checkActionImmutable(permissions, menu) {
  if (!menu.permission) return {};

  let matchingPermission = permissions.find((p) => {
    const permName = (menu.permission ?? "").trim();

    return (
      p.Name.trim() === permName &&
      (!p.InDevelopment || (p.InDevelopment && isDevelopment()))
    );
  });

  if (!matchingPermission) return null;

  return { actions: matchingPermission.Actions };
}

// Flatten Permission Data
function flattenPermissionData(data, list = []) {
  data.forEach((e) => {
    const children = e.Children || [];
    list.push(...children);

    if (children.length) {
      flattenPermissionData(children, list);
    }
  });

  return list.filter(
    (e) => Array.isArray(e.Actions) && e.Actions.some((f) => f.Value === 1)
  );
}

function isDevelopment() {
  try {
    return config.isDevelopment || ISTESTING;
  } catch (e) {
    console.log("Error", e);
    return false;
  }
}

// 0 no permission 1 have 2 empty
