const path = require("path");
const crypto = require("crypto");
const { VM } = require('vm2');
const { changeFileExtension, writeFile, toDir, getAllFileByExt, getUniquePath } = require("./lib.js");
let fs = require("fs-extra");


// ???
function getWorkerPath(name) {
    let code = fs.readFileSync(name, { encoding: 'utf8' });
    let commPath = false;
    let vm = new VM({
        sandbox: {
            require() {
            },
            define(name) {
                name = path.dirname(name) + '/';
                if (commPath === false) commPath = name;
                commPath = wu.commonDir(commPath, name);
            }
        }
    });
    vm.run(code.slice(code.indexOf("define(")));
    if (commPath.length > 0) {
        commPath = commPath.slice(0, -1);
    }
    console.log(`worker path: ${commPath}`);
    return commPath;
}

async function doConfig(filepath) {
    let dir = path.dirname(filepath);
    let fileBuf
    let conf
    let pages
    try {
        fileBuf = await fs.readFile(filepath);
        conf = JSON.parse(fileBuf.toString("utf-8"));
        pages = conf.pages
    } catch (err) {
        console.error("Error reading file:", err);
        return
    }


    // Place the entry path at the first position
    pages.splice(pages.indexOf(changeFileExtension(conf.entryPagePath)), 1);
    pages.unshift(changeFileExtension(conf.entryPagePath));

    let app = {
        pages: pages,
        window: conf.global && conf.global.window,
        tabBar: conf.tabBar,
        networkTimeout: conf.networkTimeout,
        subPackages: []
    };
    if (conf.subPackages) {
        let subPackages = [];
        let pages = app.pages;
        for (let subPackage of conf.subPackages) {
            let root = subPackage.root;
            let lastChar = root.substr(root.length - 1, 1);
            if (lastChar !== '/') {
                root = root + '/';
            }
            let firstChar = root.substr(0, 1);
            if (firstChar === '/') {
                root = root.substring(1);
            }
            let newPages = [];
            if (subPackage.pages) {
                for (let page of subPackage.pages) {
                    let items = page.replace(root, '');
                    newPages.push(items);
                    let subIndex = pages.indexOf(root + items);
                    if (subIndex !== -1) {
                        pages.splice(subIndex, 1);
                    }
                }
                subPackage.pages = newPages;
            }
            subPackage.root = root;
            subPackages.push(subPackage);
        }
        app.subPackages = subPackages;
        app.pages = pages;
        console.log(`${"=".repeat(10)}\n这个小程序采用了分包，子包个数为: ${app.subPackages.length}\n${"=".repeat(10)}`);
    }
    if (conf.navigateToMiniProgramAppIdList) {
        app.navigateToMiniProgramAppIdList = conf.navigateToMiniProgramAppIdList;
    }
    if (fs.existsSync(path.resolve(filepath, "workers.js"))) {
        app.workers = getWorkerPath(path.resolve(filepath, "workers.js"));
    }
    if (conf.extAppid) {
        writeFile(path.resolve(dir, 'ext.json'), JSON.stringify({
            extEnable: true,
            extAppid: conf.extAppid,
            ext: conf.ext
        }, null, 4));
    }
    if (conf.debug) {
        app.debug = conf.debug;
    }
    let cur = path.resolve("./file");
    for (let page in conf.page) {
        for (let name in conf.page[page].window?.usingComponents) {
            let componentPath = conf.page[page].window.usingComponents[name] + ".html";
            let file = componentPath.startsWith('/') ? componentPath.slice(1) : toDir(path.resolve(path.dirname(page), componentPath), cur);
            if (!conf.page[file]) {
                conf.page[file] = {};
            }
            if (!conf.page[file].window) {
                conf.page[file].window = {};
            }
            conf.page[file].window.component = true;
        }
    }
    if (fs.existsSync(path.resolve(dir, "app-service.js"))) {
        let matches = fs.readFileSync(path.resolve(dir, "app-service.js"), { encoding: 'utf8' }).match(/\_\_wxAppCode\_\_\['[^\.]+\.json[^;]+\;/g);
        if (matches) {
            let attachInfo = {};
            (new VM({
                sandbox: {
                    __wxAppCode__: attachInfo
                }
            })).run(matches.join(""));
            for (let name in attachInfo) {
                conf.page[changeFileExtension(name, "html")] = { window: attachInfo[name] };
            }
        }
    }
    let delWeight = 8;
    for (let key in conf.page) {
        let fileName = path.resolve(dir, changeFileExtension(key, "json"));
        writeFile(fileName, JSON.stringify(conf.page[key].window, null, 4));
        if (filepath == fileName) {
            delWeight = 0;
        }
    }
    for (let subPackage of app.subPackages) {
        if (!subPackage.pages){
            break
        }
        for (let item of subPackage?.pages) {
            let a = subPackage.root + item + '.xx';
            //添加默认的 wxs, wxml, wxss
            let jsName = changeFileExtension(a, "js");
            let fileNameOfWxs = path.resolve(dir, jsName);
            writeFile(fileNameOfWxs, "// " + jsName + "\nPage({data: {}})");
            let wxmlName = changeFileExtension(a, "wxml");
            let fileNameOfWxml = path.resolve(dir, wxmlName);
            writeFile(fileNameOfWxml, "<!--" + wxmlName + "--><text>" + wxmlName + "</text>");
            let cssName = changeFileExtension(a, "wxss");
            let fileNameOfWxss = path.resolve(dir, cssName);
            writeFile(fileNameOfWxss, "/* " + cssName + " */");
        }
    }

    if (app.tabBar?.list) {
        let files = await getAllFileByExt(dir, "")
        let rdir = path.resolve(dir);
        let digests = [];
        const promises = files.map(async (filepath) => {
            fs.readFile(filepath).then(
                (data) => {
                    digests.push([crypto.createHash("MD5").update(data).digest(), filepath])
                }
            )
        })
        await Promise.all(promises); // 等待所有异步操作完成
        for (let e of app.tabBar?.list) {
            e.pagePath = changeFileExtension(e.pagePath);
            if (e.iconData) {
                let hash = crypto.createHash("MD5").update(e.iconData, 'base64').digest();
                for (let [buf, name] of digests) {
                    if (hash.equals(buf)) {
                        delete e.iconData;
                        e.iconPath = getUniquePath(name, rdir).replace(/\\/g, '/');
                        break;
                    }
                }
            }
            if (e.selectedIconData) {
                let hash = crypto.createHash("MD5").update(e.selectedIconData, 'base64').digest();
                for (let [buf, name] of digests) if (hash.equals(buf)) {
                    delete e.selectedIconData;
                    e.selectedIconPath = getUniquePath(name, rdir).replace(/\\/g, '/');
                    break;
                }
            }
        }
        writeFile(path.resolve(dir, 'app.json'), JSON.stringify(app, null, 4));
        return { [filepath]: delWeight };
    } 
    writeFile(path.resolve(dir, 'app.json'), JSON.stringify(app, null, 4));
    return { [filepath]: delWeight };
}

module.exports = { doConfig: doConfig };
if (require.main === module) {
    wu.commandExecute(doConfig, "Split and make up weapp app-config.json file.\n\n<files...>\n\n<files...> app-config.json files to split and make up.");
}
