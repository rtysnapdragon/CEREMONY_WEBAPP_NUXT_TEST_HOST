import mergeObjDeep from "./mergeObjDeep";

async function importHelperModule(path) {
  try {
    return await import(path)
  } catch (error) {
    return { default: {} };  // ✅ important
  }
}

export default async (layers) => {
  const hApp = await importHelperModule("../helpers/apis.js");
  const sApp = await importHelperModule("../helpers/str.js");
  const helper = {
    api: {},
    str: {},
  };
  for (let e of layers) {
    const h = await importHelperModule(`../${e}/helpers/apis.js`);
    const s = await importHelperModule(`../${e}/helpers/str.js`);

    helper.api = mergeObjDeep(h?.default ?? {}, helper.api);
    helper.str = mergeObjDeep(s?.default ?? {}, helper.str);
  }

  helper.api = mergeObjDeep(hApp?.default ?? {}, helper.api);
  helper.str = mergeObjDeep(sApp?.default ?? {}, helper.str);

  return helper;
};
