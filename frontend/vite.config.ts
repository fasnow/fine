import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import * as fs from "fs";
import * as path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), reactVirtualized()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname,'src'), // 路径别名
    },
    extensions: ['.js', '.json', '.ts','.tsx'] // 使用路径别名时想要省略的后缀名，可以自己 增减
  }
})

// https://github.com/bvaughn/react-virtualized/issues/1722
const WRONG_CODE = `import { bpfrpt_proptype_WindowScroller } from "../WindowScroller.js";`;
function reactVirtualized() {
  return {
    name: 'my:react-virtualized',
    configResolved() {
      const file = require
          .resolve('react-virtualized')
          .replace(
              path.join('dist', 'commonjs', 'index.js'),
              path.join('dist', 'es', 'WindowScroller', 'utils', 'onScroll.js')
          );
      const code = fs.readFileSync(file, 'utf-8');
      const modified = code.replace(WRONG_CODE, '');
      fs.writeFileSync(file, modified);
    },
  };
}