const webpack = require('webpack');
const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const PORT = 7777;
const dist = path.resolve(__dirname, './dist');
const index = path.resolve(__dirname, './src/index.js');

module.exports = {
    devtool: 'cheap-module-source-map',
    entry: {
        app: index,
    },
    output: {
        // for entry
        filename: '[name].[hash].js',
        // for each page
        chunkFilename: '[name].[chunkhash].chunk.js',
        path: dist,
    },
    plugins: [
        // before build, delete dist folder
        new CleanWebpackPlugin(['dist']),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true,
        }),
        // Assign the module and chunk ids by occurrence count.
        // Ids that are used often get lower (shorter) ids.
        // This make ids predictable, reduces total file size and is recommended
        new webpack.optimize.OccurrenceOrderPlugin(),
        // to seperate my own codes and thrid party codes
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: module => module.context && module.context.indexOf('node_modules') !== -1,
            fileName: '[name].[chunkhash]',
        }),
        // create entry point and inject js/css
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, './src/index.html'),
            filename: 'index.html',
            inject: 'body',
            minify: {
                collapseWhitespace: true,
                keepClosingSlash: true,
                removeComments: true,
            },
            xhtml: true,
        }),
        // uglify
        // unused : tree shaking
        // warning: no log in terminal
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            compressor: {
                unused: true,
                warnings: false,
            },
        }),
    ],
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: [/node_modules/],
                use: {
                    loader: 'babel-loader',
                },
            },
            {
                test: /\.(css|scss)$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader',
                ],
            },
            {
                enforce: 'pre',
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'eslint-loader',
            },
        ],
    },
};
