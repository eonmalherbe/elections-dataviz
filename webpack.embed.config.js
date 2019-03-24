const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const merge = require('webpack-merge');
const { HashedModuleIdsPlugin } = require('webpack');

var common = {
  entry: './src/embed.js',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
            loader: 'file-loader',
            options: {
                name: '[name].[ext]',
                outputPath: 'fonts/'
            }
        }]
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
  output: {
    path: __dirname + '/build/embed',
    publicPath: '/',
    filename: 'embed.js'
  },
  // optimization: {
  //   noEmitOnErrors: true,
  //   runtimeChunk: 'single',
  //   splitChunks: {
  //     cacheGroups: {
  //       default: {
  //         chunks: 'async',
  //         minChunks: 2,
  //         priority: 10
  //       },
  //       common: {
  //         name: 'common',
  //         chunks: 'async',
  //         minChunks: 2,
  //         enforce: true,
  //         priority: 5
  //       },
  //       vendors: false,
  //       vendor: false
  //     }
  //   },
  //   minimizer: [
  //     new HashedModuleIdsPlugin(),
  //     new TerserPlugin({
  //       sourceMap: true,
  //       cache: true,
  //       parallel: true,
  //       terserOptions: {
  //         safari10: true,
  //         output: {
  //           ascii_only: true,
  //           comments: false,
  //           webkit: true,
  //         },
  //         compress: {
  //           pure_getters: true,
  //           passes: 3,
  //           inline: 3,
  //         }
  //       }
  //     })
  //   ]
  // },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
}

// module.exports = merge(common, {
//   mode: 'development',
//   devtool: 'inline-source-map',
//   devServer: {
//     contentBase: './build/embed',
//     hot: true
//   }
// });

module.exports = merge(common, {
  mode: 'production',
});