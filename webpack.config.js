
const webpack = require( 'webpack' ),
    plugins = [

      // public reqire( xxx )
      new webpack.ProvidePlugin({
        React    : 'react',
        ReactDOM : 'react-dom'
      }),

      // chunk files
      new webpack.optimize.CommonsChunkPlugin({
        names     : [ 'vendors', 'common' ],
        minChunks : Infinity
      }),

      // defined environment variable
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify( 'production' ) // or development
      }),
    ],

    // conditions environment
    isProduction = function () {
      return process.env.NODE_ENV === 'production';
    },

    // only when environment variable is 'production' call
    deploy = ( function () {
      var CopyWebpackPlugin  = require( 'copy-webpack-plugin'  ),
          CleanWebpackPlugin = require( 'clean-webpack-plugin' );

      // environment verify
      if ( isProduction() ) {

        // delete publish folder
        plugins.push(
          new CleanWebpackPlugin([ 'publish' ], {
            verbose: true,
            dry    : false,
          })
        );

        // copy files
        plugins.push(
          new CopyWebpackPlugin([
            { from : "src/manifest.json" , to :'../' },
            { context: 'src/assets/images/', from : "*" , to :'../assets/images' }
          ])
        );

        // call uglifyjs plugin
        plugins.push(
          new webpack.optimize.UglifyJsPlugin({
            compress: {
              sequences: true,
              dead_code: true,
              conditionals: true,
              booleans: true,
              unused: true,
              if_return: true,
              join_vars: true,
              drop_console: true
            },
            mangle: {
              except: [ '$', 'exports', 'require' ]
            },
            output: {
              comments: false
            }
          })
        );

      }
    })(),

    // webpack config
    config = {
      entry: {
        vendors : [
          './node_modules/react/dist/react.min.js',
          './node_modules/react-dom/dist/react-dom.min.js',

          './src/vender/mousetrap.min.js',

          './src/vender/notify/notify.js'
        ],
        common : [
          './src/vender/jquery-2.1.1.min.js',
        ],
        contentscripts : './src/contentscripts.js',
        background     : './src/background.js',
      },

      output: {
        path     :  isProduction() ? './publish/bundle' : './src/bundle',
        filename : '[name].js'
      },

      devServer: {
        inline: true,
        port  : 7777
      },

      plugins: plugins,

      module: {
        loaders: [{
            test: /\.js[x]?$/,
            exclude: /node_modules/,
            loader: 'babel',
            query: {
              presets: [ 'es2015', 'react' ]
            }
        },
        { test: /\.css$/,       loader: 'style!css'      },
        { test: /\.(png|jpg)$/, loader: 'url?limit=8192' },
        {
          test  : require.resolve( './src/vender/jquery-2.1.1.min.js' ),
          loader: 'expose?jQuery!expose?$'
        },
        {
          test  : require.resolve( './src/vender/mousetrap.min.js' ),
          loader: 'expose?Mousetrap'
        }
        ]
      },

      resolve: {
        alias : {
          jquery     : __dirname + '/src/vender/jquery-2.1.1.min',
          mousetrap  : __dirname + '/src/vender/mousetrap.min',

          notify     : __dirname + '/src/vender/notify/notify.js',

          storage    : __dirname + '/src/service/storage.js',

          focus      : __dirname + '/src/focus/focus.js',
          controlbar : __dirname + '/src/focus/controlbar.js',
          foucsetting: __dirname + '/src/focus/setting.js',

          dialog     : __dirname + '/src/option/dialog.jsx',
          focusopt   : __dirname + '/src/option/focus.jsx',

        }
      }

};

module.exports = config;