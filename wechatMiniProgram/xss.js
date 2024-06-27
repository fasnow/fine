const path = require("path");
const fs = require("fs-extra");
const { VM } = require('vm2');
const cssbeautify = require('cssbeautify');
const csstree = require('css-tree');
const cheerio = require('cheerio');
const { getAllFileByExt, writeFile, changeFileExtension, getUniquePath, toDir } = require("./lib");



async function doWxss(output, workDir) {
    let saveDir = output;

    function GwxCfg() {
    }

    GwxCfg.prototype = {
        $gwx() {
        }
    };
    for (let i = 0; i < 300; i++) GwxCfg.prototype["$gwx" + i] = GwxCfg.prototype.$gwx;
    let runList = {}, pureData = {}, result = {}, actualPure = {}, importCnt = {}, frameName = "", onlyTest = true,
        blockCss = [];//custom block css file which won't be imported by others.(no extension name)
    function cssRebuild(data) {//need to bind this as {cssFile:__name__} before call
		let cssFile;

        function statistic(data) {
            function addStat(id) {
                if (!importCnt[id]) importCnt[id] = 1, statistic(pureData[id]);
				else ++importCnt[id];
			}

            if (typeof data === "number") return addStat(data);
           if(data) for (let content of data) if (typeof content === "object" && content[0] == 2) addStat(content[1]);
        }

        function makeup(data) {
            var isPure = typeof data === "number";
            if (onlyTest) {
				statistic(data);
                if (!isPure) {
                    if (data.length == 1 && data[0][0] == 2) data = data[0][1];
					else return "";
				}
                if (!actualPure[data] && !blockCss.includes(changeFileExtension(toDir(cssFile, frameName), ""))) {
                    console.log("regard " + cssFile + " as pure import file.");
                    actualPure[data] = cssFile;
				}
				return "";
			}
            let res = [], attach = "";
            if (isPure && actualPure[data] != cssFile) {
                if (actualPure[data]) return '@import "' + changeFileExtension(toDir(actualPure[data], cssFile), ".wxss") + '";\n';
                else {
                    res.push("/*! Import by _C[" + data + "], whose real path we cannot found. */");
                    attach = "/*! Import end */";
				}
			}
            let exactData = isPure ? pureData[data] : data;
            for (let content of exactData)
                if (typeof content === "object") {
                    switch (content[0]) {
                        case 0://rpx
                            res.push(content[1] + "rpx");
                            break;
                        case 1://add suffix, ignore it for restoring correct!
                            break;
                        case 2://import
                            res.push(makeup(content[1]));
                            break;
					}
                } else res.push(content);
            return res.join("") + attach;
        }

        return () => {
            cssFile = this.cssFile;
            if (!result[cssFile]) result[cssFile] = "";
            result[cssFile] += makeup(data);
		};
	}

    function runVM(name, code) {
        let wxAppCode = {}, handle = {cssFile: name};
        let vm = new VM({
            sandbox: Object.assign(new GwxCfg(), {
                __wxAppCode__: wxAppCode,
                setCssToHead: cssRebuild.bind(handle),
                $gwx(path, global) {

                }
            })
        });

        // console.log('do css runVm: ' + name);
		vm.run(code);
        for (let name in wxAppCode) {
            handle.cssFile = path.resolve(saveDir, name);
            if (name.endsWith(".wxss")) {
                wxAppCode[name]();
            }
        }
    }

    function preRun(workDir, frameFile, mainCode, files) {
        runList[path.resolve(workDir, "./app.wxss")] = mainCode;

        for (let name of files) {
            if (name != frameFile) {
               fs.readFile(name,"utf-8").then(
                code=>{
                    code = code.replace(/display:-webkit-box;display:-webkit-flex;/gm, '');
                    code = code.slice(0, code.indexOf("\n"));
                    if (code.indexOf("setCssToHead(") > -1) {
                        let lastName = name;
                        let dirSplit = name.split(output + '/');
                        if (dirSplit.length > 1) {
                            lastName = path.resolve(saveDir, dirSplit[1]);
                        }
                        runList[lastName] = code.slice(code.indexOf("setCssToHead("));
                    }
                }
               )
            }
        }
    }

    function runOnce() {
        for (let name in runList) runVM(name, runList[name]);
    }

    function transformCss(style) {
        let ast = csstree.parse(style);
        csstree.walk(ast, function (node) {
            if (node.type == "Comment") {//Change the comment because the limit of css-tree
                node.type = "Raw";
                node.value = "\n/*" + node.value + "*/\n";
			}
            if (node.type == "TypeSelector") {
                if (node.name.startsWith("wx-")) node.name = node.name.slice(3);
                else if (node.name == "body") node.name = "page";
			}
            if (node.children) {
                const removeType = ["webkit", "moz", "ms", "o"];
                let list = {};
                node.children.forEach((son, item) => {
                    if (son.type == "Declaration") {
                        if (list[son.property]) {
                            let a = item, b = list[son.property], x = son, y = b.data, ans = null;
                            if (x.value.type == 'Raw' && x.value.value.startsWith("progid:DXImageTransform")) {
								node.children.remove(a);
                                ans = b;
                            } else if (y.value.type == 'Raw' && y.value.value.startsWith("progid:DXImageTransform")) {
								node.children.remove(b);
                                ans = a;
                            } else {
                                let xValue = x.value.children && x.value.children.head && x.value.children.head.data.name,
                                    yValue = y.value.children && y.value.children.head && y.value.children.head.data.name;
                                if (xValue && yValue) for (let type of removeType) if (xValue == `-${type}-${yValue}`) {
									node.children.remove(a);
                                    ans = b;
									break;
                                } else if (yValue == `-${type}-${xValue}`) {
									node.children.remove(b);
                                    ans = a;
									break;
                                } else {
                                    let mValue = `-${type}-`;
                                    if (xValue.startsWith(mValue)) xValue = xValue.slice(mValue.length);
                                    if (yValue.startsWith(mValue)) yValue = yValue.slice(mValue.length);
								}
                                if (ans === null) ans = b;
							}
                            list[son.property] = ans;
                        } else list[son.property] = item;
					}
				});
                for (let name in list) if (!name.startsWith('-'))
                    for (let type of removeType) {
                        let fullName = `-${type}-${name}`;
                        if (list[fullName]) {
							node.children.remove(list[fullName]);
							delete list[fullName];
						}
					}
			}
		});
        return cssbeautify(csstree.generate(ast), {indent: '    ', autosemicolon: true});
    }


    let files = await getAllFileByExt(workDir, "html")
    let frameFile = "";
    if (fs.existsSync(path.resolve(workDir, "page-frame.html"))) {
        frameFile = path.resolve(workDir, "page-frame.html");
    } else if (fs.existsSync(path.resolve(workDir, "app-wxss.js"))) {
        frameFile = path.resolve(workDir, "app-wxss.js");
    } else if (fs.existsSync(path.resolve(workDir, "page-frame.js"))) {
        frameFile = path.resolve(workDir, "page-frame.js");
    } else {
        throw Error("page-frame-like file is not found in the package by auto.");
    }

    let code = await fs.readFile(frameFile, "utf-8")
    code = code.replace(/display:-webkit-box;display:-webkit-flex;/gm, '');
    let scriptCode = code;
    if (frameFile.endsWith(".html")) {
        try {
            const $ = cheerio.load(code);
            scriptCode = [].join.apply($('html').find('script').map(function (item) {
                return $(this).html();
            }, "\n"));
        } catch (e) {
            //ignore
        }
    }

    let window = {
        screen: {
            width: 720,
            height: 1028,
            orientation: {
                type: 'vertical'
            }
        }
    };
    let navigator = {
        userAgent: "iPhone"
    };

    scriptCode = scriptCode.slice(scriptCode.lastIndexOf('window.__wcc_version__'));
    let mainCode = 'window= ' + JSON.stringify(window) +
        ';\nnavigator=' + JSON.stringify(navigator) +
        ';\nvar __mainPageFrameReady__ = window.__mainPageFrameReady__ || function(){};var __WXML_GLOBAL__={entrys:{},defines:{},modules:{},ops:[],wxs_nf_init:undefined,total_ops:0};var __vd_version_info__=__vd_version_info__||{}' +
        ";\n" + scriptCode;

    mainCode = mainCode.replace('var setCssToHead = function', 'var setCssToHead2 = function');

    code = code.slice(code.lastIndexOf('var setCssToHead = function(file, _xcInvalid'));
    code = code.replace('__COMMON_STYLESHEETS__', '[]');
    if (code.indexOf('_C =') === -1) {
        code = code.slice(code.lastIndexOf('\nvar _C= ') + 1);
    } else {
        code = code.slice(code.lastIndexOf(' var _C = ') + 1);
    }
    code = code.slice(0, code.indexOf('\n'));

    let vm = new VM({ sandbox: {} });
    pureData = vm.run(code + "\n_C");

    console.log("guess wxss(first turn)...");
    preRun(workDir, frameFile, mainCode, files);
    frameName = frameFile;
    onlyTest = true;
    runOnce();
    onlyTest = false;
    console.log("import count info: %j", importCnt);
    for (let id in pureData) if (!actualPure[id]) {
        if (!importCnt[id]) importCnt[id] = 0;
        if (importCnt[id] <= 1) {
            console.log("can't find pure import for _C[" + id + "] which is only imported " + importCnt[id] + " times. Let importing become copying.");
        } else {
            let newFile = path.resolve(saveDir, "__wuBaseWxss__/" + id + ".wxss");
            console.log("can't find pure import for _C[" + id + "], force to save it in (" + newFile + ").");
            id = Number.parseInt(id);
            actualPure[id] = newFile;
            cssRebuild.call({ cssFile: newFile }, id)();
        }
    }
    console.log("guess wxss(first turn) done.\ngenerate wxss(second turn)...");
    runOnce();
    console.log("generate wxss(second turn) done.\nsave wxss...");

    console.log('save to: ' + saveDir);
    for (let name in result) {
        let pathFile = path.resolve(saveDir, changeFileExtension(name, "wxss"));
        writeFile(pathFile, transformCss(result[name]));
    }
    let delFiles = {};
    for (let name of files) {
        delFiles[name] = 8;
    }
    delFiles[frameFile] = 4;
    return delFiles
}

module.exports = { doWxss };