import type { ModuleOptions } from 'webpack';

export const rules: Required<ModuleOptions>['rules'] = [
  // Add support for native node modules
  {
    // We're specifying native_modules in the test because the asset relocator loader generates a
    // "fake" .node file which is really a cjs file.
    test: /native_modules[/\\].+\.node$/,
    use: 'node-loader',
  },
  {
    test: /[/\\]node_modules[/\\].+\.(m?js|node)$/,
    parser: { amd: false },
    use: {
      loader: '@vercel/webpack-asset-relocator-loader',
      options: {
        outputAssetBase: 'native_modules',
      },
    },
  },
  {
    test: /\.tsx?$/,
    exclude: /(node_modules|build)/,
    use: {
      loader: 'ts-loader',
      options: {
        transpileOnly: true,
        // caseSensitive: false,
      },
    },
  },
  //处理svg
  {
    test: /\.svg$/,
    use: [
      {
        loader: 'file-loader',
        options: {
          name: '[name].[ext]', // 输出文件的名称
          outputPath: 'images/', // 输出文件的路径
        },
      },
    ],
  },
];
