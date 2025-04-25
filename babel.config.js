export default function (api) {
  api.cache(true);

  const presets = [];
  const plugins = [];

  return {
    presets,
    plugins,
  };
}
