const fs = require("fs");
const path = require("path");
const webpack = require("webpack");

module.exports = {
	entry: "./src/index.ts",
	output: {
		filename: "so-quick-comment-flags.user.js",
		clean: true,
		module: true,
	},
	devtool: false,
	watchOptions: {
		poll: 1000,
	},
	mode: "none",
	plugins: [
		new webpack.BannerPlugin({
			banner: fs.readFileSync(path.join("temp", "headers.js"), "utf-8"),
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
	devServer: {
		hot: false,
		liveReload: false,
		webSocketServer: false,
		static: {
			directory: path.join(__dirname, "dist"),
		},
		compress: false,
		port: 8080,
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				loader: "ts-loader"
			}
		]
	}
};
