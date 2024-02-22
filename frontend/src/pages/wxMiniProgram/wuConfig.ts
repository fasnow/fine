import path from "path-browserify";
import {Abs, Dir, Exist, Join, WriteBase64edBytesToFile} from "../../../wailsjs/go/runtime/Path";
import {ReadFileAsBase64} from "../../../wailsjs/go/runtime/Runtime";
import {Base64} from "js-base64";
import {changeExtension, getCommonDirectory, toDir} from "@/pages/wxMiniProgram/wuLib";
import { VM } from 'vm2';

export async function getWorkerPath(name: string) {
    const code = Base64.encode(await ReadFileAsBase64(name))
    const dir = await Dir(name)
    let commonPath = '';
    // 创建虚拟机并执行代码
    const vm = new VM({
        sandbox: {
            require() { },
            define(name: string) {
                // 获取定义的文件所在目录，并更新公共路径
                const dirname = path.dirname(name) + '/';
                commonPath = commonPath ? getCommonDirectory(commonPath, dirname) : dirname;
            }
        }
    });
    vm.run(code.slice(code.indexOf("define(")));
    if (commonPath.length > 0) commonPath = commonPath.slice(0, -1);
    console.log("Worker path: \"" + commonPath + "\"");
    return commonPath;
}


export function getApakgInfo(buf: Uint8Array): [number, number] {
    console.log("\nHeader info:");
    let view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    let firstMark = view.getUint8(0);
    console.log("  firstMark: 0x%s", firstMark.toString(16));
    let unknownInfo = view.getUint32(1, false); // 第二个参数表示使用大端字节顺序
    console.log("  unknownInfo: ", unknownInfo);
    let infoListLength = view.getUint32(5, false); // 第二个参数表示使用大端字节顺序
    console.log("  infoListLength: ", infoListLength);
    let dataLength = view.getUint32(9, false); // 第二个参数表示使用大端字节顺序
    console.log("  dataLength: ", dataLength);
    let lastMark = view.getUint8(13);
    console.log("  lastMark: 0x%s", lastMark.toString(16));
    if (firstMark !== 0xbe || lastMark !== 0xed) throw Error("Magic number is not correct!");
    return [infoListLength, dataLength];
}

export  function doConfig(configFilename: string) {
    Abs(configFilename).then(
        async configFilename => {
            let absOutputDir=""
            let config:any={}
            try {
                absOutputDir = await Dir(configFilename)
                config = JSON.parse(Base64.decode(await ReadFileAsBase64(configFilename)));
            }catch (e) {

            }
            const pages = config.pages;
            pages.splice(pages.indexOf(changeExtension(pages.entryPagePath)), 1);
            pages.unshift(changeExtension(pages.entryPagePath));
            const app:any = {pages: pages, window: config.global && config.global.window, tabBar: config.tabBar, networkTimeout: config.networkTimeout};
            if (config.subPackages) {
                let subPackages = [];
                let pages = app.pages;
                for (let subPackage of config.subPackages) {
                    let root = subPackage.root;
                    let lastChar = root.substring(root.length - 1);
                    if (lastChar !== '/') {
                        root = root + '/';
                    }
                    let firstChar = root.substring(0, 1);
                    if (firstChar === '/') {
                        root = root.substring(1);
                    }
                    let newPages = [];
                    for (let page of subPackage.pages) {
                        let items = page.replace(root, '');
                        newPages.push(items);
                        let subIndex = pages.indexOf(root + items);
                        if (subIndex !== -1) {
                            pages.splice(subIndex, 1);
                        }
                    }
                    subPackage.root = root;
                    subPackage.pages = newPages;
                    subPackages.push(subPackage);
                }
                app.subPackages = subPackages;
                app.pages = pages;
                console.log("=======================================================\n这个小程序采用了分包\n子包个数为: ", app.subPackages.length, "\n=======================================================");
            }
            if (config.navigateToMiniProgramAppIdList) {
                app.navigateToMiniProgramAppIdList = config.navigateToMiniProgramAppIdList;
            }
            if (await Exist(await Join([absOutputDir, "workers.js"]))){
                app.workers = getWorkerPath(await Join([absOutputDir, "workers.js"]));
            }
            if (config.extAppid){
                WriteBase64edBytesToFile(await Join([absOutputDir, "ext.json"]),Base64.encode(JSON.stringify({
                    extEnable: true,
                    extAppid: config.extAppid,
                    ext: config.ext
                }, null, 4)))
            }
            if (typeof config.debug != "undefined") {
                app.debug = config.debug;
            }
            let cur =await Abs("./file")
            for (let a in config.page) {
                if (config.page[a].window.usingComponents)
                    for (let name in config.page[a].window.usingComponents) {
                        let componentPath = config.page[a].window.usingComponents[name] + ".html";
                        let file = componentPath.startsWith('/') ? componentPath.slice(1) : toDir(path.resolve(path.dirname(a), componentPath), cur);
                        if (!config.page[file]) config.page[file] = {};
                        if (!config.page[file].window) config.page[file].window = {};
                        config.page[file].window.component = true;
                    }
            }
            const appServiceJsFilepath = await Join([absOutputDir, "app-service.js"])
            if (await Exist(appServiceJsFilepath)) {
                const matches = (Base64.decode(await ReadFileAsBase64(appServiceJsFilepath))).match(/\_\_wxAppCode\_\_\['[^\.]+\.json[^;]+\;/g);
                if (matches) {
                    let attachInfo:any = {};
                    (new VM({
                        sandbox: {
                            __wxAppCode__: attachInfo
                        }
                    })).run(matches.join(""));
                    for (let name in attachInfo) {
                        config.page[changeExtension(name, ".html")] = {window: attachInfo[name]};
                    }
                }
            }
            let delWeight = 8;
            for (let a in config.page) {
                let fileName = path.resolve(absOutputDir, changeExtension(a, ".json"));
                WriteBase64edBytesToFile(fileName,Base64.encode(JSON.stringify(config.page[a].window, null, 4)))
                if (configFilename == fileName) delWeight = 0;
            }
            if (app.subPackages) {
                for (let subPackage of app.subPackages) {
                    if (subPackage.pages) {
                        for (let item of subPackage.pages) {
                            let a = subPackage.root + item + '.xx';
                            //添加默认的 wxs, wxml, wxss
                            let jsName = changeExtension(a, ".js");
                            let fileNameOfWxs = await Abs(await Join([absOutputDir, jsName]))
                            WriteBase64edBytesToFile(fileNameOfWxs,Base64.encode("// " + jsName + "\nPage({data: {}})"))
                            let wxmlName = changeExtension(a, ".wxml");
                            let fileNameOfWxml = await Abs(await Join([absOutputDir, wxmlName]))
                            WriteBase64edBytesToFile(fileNameOfWxml,Base64.encode("<!--" + wxmlName + "--><text>" + wxmlName + "</text>"))
                            let cssName = changeExtension(a, ".wxss");
                            let fileNameOfWxss = await Abs(await Join([absOutputDir, cssName]))
                            WriteBase64edBytesToFile(fileNameOfWxss,Base64.encode( "/* " + cssName + " */"))
                        }
                    }
                }
            }


            // if (app.tabBar && app.tabBar.list) wu.scanDirByExt(absOutputDir, "", li => {//search all files
            //     let digests = [], digestsEvent = new wu.CntEvent, rdir = path.resolve(absOutputDir);
            //
            //     function fixDir(dir) {
            //         return dir.startsWith(rdir) ? dir.slice(rdir.length + 1) : dir;
            //     }
            //
            //     digestsEvent.add(() => {
            //         for (let e of app.tabBar.list) {
            //             config.pagePath = wu.changeExt(config.pagePath);
            //             if (config.iconData) {
            //                 let hash = crypto.createHash("MD5").update(config.iconData, 'base64').digest();
            //                 for (let [buf, name] of digests) if (hash.equals(buf)) {
            //                     delete config.iconData;
            //                     config.iconPath = fixDir(name).replace(/\\/g, '/');
            //                     break;
            //                 }
            //             }
            //             if (config.selectedIconData) {
            //                 let hash = crypto.createHash("MD5").update(config.selectedIconData, 'base64').digest();
            //                 for (let [buf, name] of digests) if (hash.equals(buf)) {
            //                     delete config.selectedIconData;
            //                     config.selectedIconPath = fixDir(name).replace(/\\/g, '/');
            //                     break;
            //                 }
            //             }
            //         }
            //         wu.save(path.resolve(absOutputDir, 'app.json'), JSON.stringify(app, null, 4));
            //         cb({[configFile]: delWeight});
            //     });
            //     for (let name of li) {
            //         digestsEvent.encount();
            //         wu.get(name, data => {
            //             digests.push([crypto.createHash("MD5").update(data).digest(), name]);
            //             digestsEvent.decount();
            //         }, {});
            //     }
            // }); else {
            //     wu.save(path.resolve(absOutputDir, 'app.json'), JSON.stringify(app, null, 4));
            //     cb({[configFile]: delWeight});
            // }
        }
    )

    return path.resolve(configFilename)
}