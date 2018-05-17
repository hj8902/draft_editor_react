const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

// eslint
const eslint = JSON.parse(fs.readFileSync(path.resolve(__dirname, '.eslintrc')));
eslint.globals = Object.keys(eslint.globals);

// css
const PostCssFlexBugsFixes = require('postcss-flexbugs-fixes');
const AutoPrefixer = require('autoprefixer')({
    browsers: [
        '>1%',
        'last 4 versions',
        'Firefox ESR',
        'not ie < 9', // React doesn't support IE8 anyway
    ],
    flexbox: 'no-2009',
});

const PORT = 7777;
const dist = path.resolve(__dirname, './dist');
const index = path.resolve(__dirname, './src/index.js');

module.exports = {
    devtool: 'eval',
    devServer: {
        // for watching and bundling
        // if it is not set, cannot work
        contentBase: dist,
        port: PORT,
        // if it has hot|reload options, can reload partly.
        // if it is set here, don't set same settings in options of webpack-dev-server(compile fail)
        hot: true,
        inline: true,
        // no need cos now we don't use react-router
        // for react router
        // to prevent server requests with react router address
        historyApiFallback: true,
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    },
    entry: [
        // activate HMR for React
        // don't put it in production version.
        'react-hot-loader/patch',
        // bundle the client for webpack-dev-server
        // and connect to the provided endpoint
        `webpack-dev-server/client?http://localhost:${PORT}`,
        // bundle the client for hot reloading
        // only- means to only hot reload for successful updates
        // HMR doesn't relaod brouser
        'webpack/hot/only-dev-server',
        index,
    ],
    output: {
        filename: '[name].js',
        publicPath: '/',
        path: dist,
    },
    plugins: [
        // for HML enable
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NamedModulesPlugin(),
        new CleanWebpackPlugin(['dist']),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development'),
            'process.env.DEBUG': JSON.stringify('App:*'),
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, './src/index.html'),
            filename: 'index.html',
            inject: 'body',
            xhtml: true,
        }),
        new webpack.ProvidePlugin({
            _: 'lodash',
        }),
    ],
    externals: {
        'react/addons': true,
        'react/lib/ExecutionEnvironment': true,
        'react/lib/ReactContext': true,
        'react-addons-test-utils': 'react-dom',
    },
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
                test: /\.(js|jsx)$/,
                exclude: [/node_modules/],
                use: {
                    loader: 'react-hot-loader/webpack',
                },
            },
            {
                test: /\.(css|scss)$/,
                exclude: [/node_modules/],
                use: [
                    // keep the chainnger order for loaders
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1,
                            modules: true,
                            localIdentName: '[local]',
                        },
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: [
                                PostCssFlexBugsFixes,
                                AutoPrefixer,
                            ],
                        },
                    },
                    'sass-loader',
                ],
            },
            {
                enforce: 'pre',
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'eslint-loader',
                options: eslint,
            },
        ],
    },
};
