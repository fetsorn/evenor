const process = require('process');

module.exports = {
  packagerConfig: {
    icon: './public/icon',
    electronZipDir: process.env.electron_zip_dir,
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        icon: './public/icon.png',
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: [
        'darwin',
        'win32',
        'linux',
      ],
      icon: './public/icon',
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        icon: './public/icon.png',
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        icon: './public/icon.png',
      },
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-webpack',
      config: {
        devContentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; frame-src 'self' blob:; media-src 'self' blob:; img-src 'self' data: blob:; connect-src 'self' https://ondemand-service-d3ncqg2pmq-uc.a.run.app; object-src 'self' blob:;",
        mainConfig: './webpack.main.config.js',
        renderer: {
          config: './webpack.renderer.config.js',
          entryPoints: [
            {
              name: 'main_window',
              html: './src/renderer/index.html',
              js: './src/renderer/app.jsx',
            },
          ],
        },
      },
    },
  ],
};
