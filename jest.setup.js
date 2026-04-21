// expo/src/winter/runtime.native.ts installs lazy getters that require() winter modules.
// In Jest these cross-registry requires fail, so we override them with native/stub values.
const defineGlobal = (name, value) => {
  try {
    Object.defineProperty(global, name, {
      value,
      writable: true,
      configurable: true,
      enumerable: true,
    });
  } catch (_) {}
};

defineGlobal('__ExpoImportMetaRegistry', { url: null });
defineGlobal('structuredClone', global.structuredClone ?? ((v) => JSON.parse(JSON.stringify(v))));
defineGlobal('URL', global.URL);
defineGlobal('URLSearchParams', global.URLSearchParams);
defineGlobal('TextDecoder', global.TextDecoder);
defineGlobal('TextDecoderStream', global.TextDecoderStream);
defineGlobal('TextEncoderStream', global.TextEncoderStream);
