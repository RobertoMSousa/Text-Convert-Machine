const webpack = require('webpack');
const path = require('path');
module.exports = {
	entry: './client/src/all.ts',
	output: {
		path: path.join(__dirname, './public/js'),
		filename: 'bundle.js'
	},
	resolve: {
		extensions: ['', '.ts', '.js'],
		modulesDirectories: [
			'./public/components'
		]
	},
	module: {
		loaders: [
			{
				test: /\.ts$/,
				loader: 'babel-loader?presets[]=es2015!ts-loader',
				exclude: /node_modules/
			},
			{
				test: /\.styl$/,
				loader: 'style-loader!css-loader!stylus-loader'
			},
			{
				test: /\.pug$/,
				loader: 'pug-loader'
			}
		]
	},
	plugins: [
		new webpack.ResolverPlugin(
			new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin('./bower.json', ['main'])
		)
	]
};
