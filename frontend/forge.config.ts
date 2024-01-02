import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';

import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';
import fs from 'fs';
import { plugins } from './webpack.plugins';
const path = require('path')
const { utils: { fromBuildIdentifier } } = require('@electron-forge/core');
const config: ForgeConfig = {
  buildIdentifier: process.env.IS_BETA ? 'beta' : 'prod',
  publishers: undefined,
  packagerConfig: {
    asar: true,
    // extraResource: [path.join(__dirname,"../backend/fine-cmd"+process.platform==="win32"?".exe":"")],
    afterCopy: [
      async (
        buildPath: string,
        electronVersion: string,
        platform: string,
        arch: string,
        callback: (err?: Error | null) => void,
      ) => {
        const cmd = platform === "win32" ? "fine-cmd.exe" : "fine-cmd";
        const sourceDir = path.join(__dirname, "../backend/")
        const sourceFile = path.join(sourceDir, cmd)
        const targetDir = path.join(buildPath, "../../bin");
        fs.mkdir(targetDir, { recursive: true }, (err) => {
          if (err) throw err;
        });
        fs.copyFile(sourceFile, path.join(targetDir, cmd), (err) => {
          if (err) throw err;
        });
        callback();
      }
    ],
    appBundleId: fromBuildIdentifier({ beta: 'org.fasnow.beta.fine', pro: 'org.fasnow.fine' }),
    icon: process.platform === "win32" ? "src/public/assets/image/paimon.ico" : process.platform === "darwin" ? "src/public/assets/image/paimon.icns" : "",
    appCopyright: "Copyright (C) 2023 Fasnow.All rights reserved.",
    win32metadata: {
      FileDescription: "Fine",
    }
  },
  rebuildConfig: {},
  makers: [
    // new MakerSquirrel(),
    // new MakerRpm({}),
    // new MakerDeb({}),
    new MakerZIP({}, ['darwin', "win32"]),
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      mainConfig,
      // packageSourceMaps:false,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: './src/electron/index.html',
            js: './src/electron/renderer.ts',
            name: 'main_window',
            preload: {
              js: './src/electron/preload.ts',
            },
          },
        ],
      },
    }),
  ],
  hooks: {
    postMake: async (forgeConfig, makeResults) => {
      // if (process.platform === "win32") {
        const zipFilePath = makeResults[0].artifacts[0];
        const targetFile = path.join(__dirname,`out/${forgeConfig.buildIdentifier}/make/zip/fine.zip`);
        await require('fs').promises.rename(zipFilePath,targetFile); // 重命名生成的 zip 文件
        makeResults[0].artifacts[0] = targetFile
      // }
      return makeResults;
    },
  },
};

export default config;
