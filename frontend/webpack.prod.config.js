const commonConfig = require("./webpack.config");

delete commonConfig.devtool;

module.exports = {
  ...commonConfig,
  mode: "production",
};
