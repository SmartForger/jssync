const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  entry: {
    main: "./main.js",
  },
  output: {
    filename: "[name].js", // this line is the only difference
    path: path.resolve(__dirname, "../public/chat/scripts"),
  },
  mode: "production",
  plugins: [new CleanWebpackPlugin()],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /[\\/]node_modules[\\/]/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
};
