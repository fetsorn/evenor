module.exports = {
  presets: [
    ['@babel/preset-env', { modules: false, targets: { safari: '13' } }],
    '@babel/preset-react',
  ],
};
