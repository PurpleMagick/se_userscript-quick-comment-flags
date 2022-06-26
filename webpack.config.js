const fs = require("fs");
const webpack = require("webpack");

module.exports = {
	entry: "./src/index.ts",
	output: {
		filename: "so-quick-comment-flags.user.js",
		clean: true,
		module: true,
	},
	devtool: false,
	mode: "production",
	plugins: [
		new webpack.BannerPlugin({
			banner: fs.readFileSync("./dist/headers.js", "utf-8"),
			raw: true,
		}),
	],
	resolve: {
		extensions: [".webpack.js", ".web.js", ".ts", ".js"]
	},
	optimization: {
		minimize: false,
		usedExports: true,
		concatenateModules: true,
	},
	experiments: {
		outputModule: true
	},
	module: {
		rules: [
			{
				test: /\.ts$/, loader: "ts-loader"
			}
		]
	}
};
