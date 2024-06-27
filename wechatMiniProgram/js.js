const fs = require("fs-extra");
const { VM } = require('vm2');
const path = require("path");
const UglifyJS = require("uglify-es");
const { writeFile } = require("./lib.js");


function jsBeautify(code) {
    return UglifyJS.minify(code, { mangle: false, compress: false, output: { beautify: true, comments: true } }).code;
}

async function splitJs(filepath, output,workDir) {
    let isSubPkg = output != workDir;
    let code = (await fs.readFile(filepath,"utf-8"));
    let needDelList = {};
    let vm = new VM({
        sandbox: {
            require() {
            },
            define(name, func) {
                let code = func.toString();
                code = code.slice(code.indexOf("{") + 1, code.lastIndexOf("}") - 1).trim();
                let bcode = code;
                if (code.startsWith('"use strict";') || code.startsWith("'use strict';")) code = code.slice(13);
                else if ((code.startsWith('(function(){"use strict";') || code.startsWith("(function(){'use strict';")) && code.endsWith("})();")) code = code.slice(25, -5);
                let res = jsBeautify(code);
                if (typeof res == "undefined") {
                    console.log(`"fail to delete 'use strict' in ${name}`);
                    res = jsBeautify(bcode);
                }
                const t = path.resolve(output, name);
                // console.log(`saving to ${t}`);
                needDelList[t] = -8;
                writeFile(t, jsBeautify(res))
            },
            definePlugin() {
            },
            requirePlugin() {
            }
        }
    });
    if (isSubPkg) {
        code = code.slice(code.indexOf("define("));
    }
    vm.run(code);
    if (!needDelList[filepath]) {
        needDelList[filepath] = 8;
    }
    return needDelList;
}

module.exports = {
    splitJs: splitJs,
};
