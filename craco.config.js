const path = require("path")

module.exports = {
  webpack: {
    alias: {
      "@components": path.resolve(__dirname, "./src/components"),
      "@constants": path.resolve(__dirname, "./src/constants"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@utils": path.resolve(__dirname, "./src/utils"),
    }
  }
}
