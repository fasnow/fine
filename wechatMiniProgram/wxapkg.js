let { Command } = require("commander");
let fs = require("fs-extra");
let { isEmpty, jsBeautify, getFileExtension, codeBeautify, writeFile, formatDate } = require("./lib");
let program = new Command();
const path = require("path");
const { type } = require("os");
const { doConfig } = require("./config");
const { splitJs } = require("./js");
const { doFrame } = require("./xml");
const { doWxss } = require("./xss");
program
  .version('1.0.0', '-v, --version')
  .description("微信小程序包解密与反编译")
  // .option("-d, --decrypt <value>", "指定只解密不反编译的文件")
  .option("-t, --target <value> ", "指定需要解密与反编译的文件夹")
  .option("-o, --output <value>", "指定输出文件（夹）")
  .option("-h, --help", "显示帮助信息");

// 解析命令行参数
program.parse(process.argv);

// 获取解析后的选项
let options = program.opts();

// 如果没有提供任何参数，则显示帮助信息
if (process.argv.length <= 2) {
  program.outputHelp();
  return
}

let output = options.output
let decrypt = options.decrypt
let target = options.target


if (!output) {
  output = process.cwd()
}


if (decrypt) {
  console.log(`${"-".repeat(50)}\n解密的文件...: ${decrypt}\n保存至文件夹..: ${output}\n${"-".repeat(50)}`);
  // TODO
} else if (target) {
  try {
    const stats = fs.statSync(target);
    if (!stats.isDirectory()) {
      console.log("目标须是__APP__.wxapkg所在的目录")
      return
    }
  } catch (err) {
    console.error('错误: ', err);
    return
  }
  let version = path.basename(target)
  let appid = path.basename(path.dirname(target))
  if (!isEmpty(version) && !isEmpty(appid)) {
    output = path.resolve(output, `${appid}_${version}`)
  } else {
    output = path.resolve(output, formatDate(new Date()))
  }
  console.log(`${"-".repeat(50)}\n反编译的文件夹...: ${target}\n保存至文件夹.....: ${output}\n${"-".repeat(50)}`);
} else {
  program.outputHelp();
  return;
}

if (decrypt) {
  // 只解密不反编译
} else if (target) {
  main(target, output);
}

async function main(target, output) {
  try {
    let files = await fs.readdir(target);
    files.sort();
    let specialFile = "__APP__.wxapkg";
    let index = files.indexOf(specialFile);
    if (index > -1) {
      files.splice(index, 1); // 从数组中移除
      files.unshift(specialFile); // 添加到数组的开头
    }
    console.log("extract file...")
    for (const filename of files) {
      const fullPath = path.resolve(target, filename);
      const stat = await fs.stat(fullPath);
      if (stat.isFile()) {
        const ext = path.extname(filename);
        if (!ext.endsWith("wxapkg")) {
          continue
        }
        if (filename === "__APP__.wxapkg") {
          let mainOutput = path.resolve(output, "__APP__")
          let fileBuf = await fs.readFile(fullPath);
          let [infoListLength, dataLength] = header(fileBuf, fullPath);
          let fileList = genList(fileBuf.subarray(14, infoListLength + 14), fullPath);
          for (let fileEntry of fileList) {
            let filePath = path.resolve(
              mainOutput,
              (fileEntry.name.startsWith("/") ? "." : "") + fileEntry.name
            );
            let fileData = fileBuf.subarray(fileEntry.off, fileEntry.off + fileEntry.size);
            let ext = getFileExtension(fileEntry.name)
            fileData = codeBeautify(ext, fileData)
            await fs.outputFile(filePath, fileData);
          }
        } else {
          let subPackageOutput = path.resolve(output, path.basename(filename, '.wxapkg'))
          let fileBuf = await fs.readFile(fullPath);
          let [infoListLength, dataLength] = header(fileBuf, fullPath);
          let fileList = genList(fileBuf.subarray(14, infoListLength + 14), fullPath);
          for (let fileEntry of fileList) {
            let filePath = path.resolve(
              subPackageOutput,
              (fileEntry.name.startsWith("/") ? "." : "") + fileEntry.name
            );
            let fileData = fileBuf.subarray(fileEntry.off, fileEntry.off + fileEntry.size);
            let ext = getFileExtension(fileEntry.name)
            fileData = codeBeautify(ext, fileData)
            await fs.outputFile(filePath, fileData);
          }
        }
      }
    }
    console.log("extract done")
    files = await fs.readdir(output);
    files.sort();
    specialFile = "__APP__";
    index = files.indexOf(specialFile);
    if (index > -1) {
      files.splice(index, 1); 
      files.unshift(specialFile); 
    }
    for (const filename of files) {
      const stat = await fs.stat(path.resolve(output, filename))
      if (!stat.isDirectory()) {
        continue
      }
      packDone(path.resolve(output, filename))
    }
  } catch (err) {
    console.error(`error reading directory: ${err}`);
  }
}

function header(fileBuf, filename) {
  let firstMark = fileBuf.readUInt8(0);
  let unknownInfo = fileBuf.readUInt32BE(1);
  let infoListLength = fileBuf.readUInt32BE(5);
  let dataLength = fileBuf.readUInt32BE(9);
  let lastMark = fileBuf.readUInt8(13);
  console.log(`Header info: 
    filename......: ${path.basename(filename)}
    firstMark.....: 0x${firstMark.toString(16)}
    unknownInfo...: ${unknownInfo}
    infoListLength: ${infoListLength}
    dataLength....: ${dataLength}
    lastMark......: 0x${lastMark.toString(16)}`);
  if (firstMark != 0xbe || lastMark != 0xed)
    throw Error("Magic number is not correct!");
  return [infoListLength, dataLength];
}

function genList(file_buf, filename) {
  let fileCount = file_buf.readUInt32BE(0);
  console.log(`File list info:
    filename...: ${path.basename(filename)}
    fileCount..: ${fileCount}`);
  let fileInfo = [], off = 4;
  for (let i = 0; i < fileCount; i++, off += 4) {
    let info = {};
    let nameLen = file_buf.readUInt32BE(off);
    info.name = file_buf.toString("utf8", off += 4, off + nameLen);
    info.off = file_buf.readUInt32BE(off += nameLen);
    info.size = file_buf.readUInt32BE(off += 4);
    fileInfo.push(info);
  }
  return fileInfo;
}

let needDelete = {};

function addDeleteFile(deletable) {
  for (let key in deletable) {
    if (!needDelete[key]) {
      needDelete[key] = 0;
    }
    needDelete[key] += deletable[key];//all file have score bigger than 8 will be delete.
  }
}

function deleteFile() {
  for (let name in needDelete) {
    if (needDelete[name] >= 8) {
      fs.remove(name)
    }
  }
}

function dealThreeThings(output, workDir) {
  console.log("split app-service.js and make up configs & wxss & wxml & wxs...");
  //deal config
  let appConfigFile = path.resolve(workDir, "app-config.json")
  if (fs.existsSync(appConfigFile)) {
    console.log(`split app-config.json: ${appConfigFile}`);
    doConfig(appConfigFile).then(
      (deletable) => {
        addDeleteFile(deletable)
        // deleteFile()
        console.log(`split app-config.json done: ${appConfigFile}`);
      }
    );
  }

  //deal js
  let appServiceJsFile = path.resolve(workDir, "app-service.js")
  if (fs.existsSync(appServiceJsFile)) {
    console.log(`split app-service.js: ${appServiceJsFile}`);
    splitJs(appServiceJsFile, output, workDir).then(
      (deletable) => {
        addDeleteFile(deletable)
        // deleteFile()
        console.log(`split app-service.js done: ${appServiceJsFile}`);
      }
    );
  }
  let workersFile = path.resolve(workDir, "workers.js")
  if (fs.existsSync(workersFile)) {
    console.log(`split workers.js: ${workersFile}`);
    splitJs(workersFile, output, workDir).then(
      (deletable) => {
        addDeleteFile(deletable)
        // deleteFile()
        console.log(`split workers.js done: ${workersFile}`);
      }
    );
  }

  //deal html
  let pageFrameFile = path.resolve(workDir, "page-frame.js")
  if (output != workDir) {
    if (fs.existsSync(pageFrameFile)) {
      console.log(`split page-frame.js: ${pageFrameFile}`);
      doFrame(pageFrameFile, output).then(
        (deletable) => {
          addDeleteFile(deletable)
          // deleteFile()
          console.log(`split page-frame.js done: ${pageFrameFile}`);
        }
      );
    }
    doWxss(output, workDir).then(
      (deletable) => {
        addDeleteFile(deletable)
        // deleteFile()
      }
    )
  } else {
    let pageFrameFil2 = path.resolve(workDir, "page-frame.html")
    let appWxssFile = path.resolve(workDir, "app-wxss.js")
    if (fs.existsSync(pageFrameFil2)) {
      console.log(`split page-frame.html: ${pageFrameFil2}`);
      doFrame(pageFrameFil2, output).then(
        (deletable) => {
          addDeleteFile(deletable)
          // deleteFile()
          console.log(`split page-frame.html done: ${pageFrameFil2}`);
        }
      );
    } else if (fs.existsSync(appWxssFile)) {
      console.log(`split app-wxss.js: ${appWxssFile}`);
      doFrame(appWxssFile, output).then(
        (deletable) => {
          addDeleteFile(deletable)
          // deleteFile()
          if (!needDelete[pageFrameFile]) {
            needDelete[pageFrameFile] = 8;
          }
          console.log(`split app-wxss.js done: ${appWxssFile}`);
        }
      );

    } else {
      throw Error("page-frame-like file is not found in the package by auto");
    }

    //Force it run at last, becuase lots of error occured in this part
    console.log('deal css...')
    doWxss(output, workDir).then(
      (deletable) => {
        addDeleteFile(deletable)
        // deleteFile()
        console.log('deal css done');
      }
    )
  }
}

async function packDone(output) {

  //This will be the only func running this time, so async is needless.
  if (fs.existsSync(path.resolve(output, "app-service.js"))) {
    //weapp
    dealThreeThings(output, output);
  } else if (fs.existsSync(path.resolve(output, "game.js"))) {
    //wegame
    console.log("split game.js and rewrite game.json...");
    let gameCfg = path.resolve(output, "app-config.json");
    console.log(`split app-config.json: ${gameCfg}`);
    fs.readFile(gameCfg).then(
      async cfgPlain => {
        let cfg = JSON.parse(cfgPlain);
        if (cfg.subContext) {
          console.log("found subContext, splitting it...")
          delete cfg.subContext;
          let contextPath = path.resolve(output, "subContext.js");
          await splitJs(path.resolve(output, "game.js"), workDir)
          deleteFile(contextPath)
        }
        console.log(`split and rewrite done: ${path.resolve(output, "game.json")}`);
        writeFile(path.resolve(output, "game.json"), JSON.stringify(cfg, null, 4));
        // deleteFile(gameCfg);
      }
    )
    console.log(`split game.js: ${path.resolve(output, "game.js")}`);
    splitJs(path.resolve(output, "game.js"), workDir).then(
      () => {
        console.log("split and rewrite done.");
      }
    )
  } else {//分包
    let isSubPkg = false;
    let findDir = async function (output, workDir) {
      let stat = await fs.stat(workDir)
      if (!stat.isDirectory()) {
        return
      }
      let files = fs.readdirSync(workDir);
      for (const file of files) {
        let tmpWorkDir = path.join(workDir, file);
        let stat = await fs.stat(tmpWorkDir)
        if (!stat.isDirectory()) {
          continue
        }
        if (fs.existsSync(path.resolve(tmpWorkDir, "app-service.js"))) {
          console.log("sub package word dir: " + tmpWorkDir);
          // mainDir = path.resolve(output, mainDir);
          // console.log("real mainDir: " + mainDir);
          dealThreeThings(output, tmpWorkDir);
          isSubPkg = true;
          return true;
        } else {
          await findDir(output, tmpWorkDir);
        }
      }
    }
    await findDir(output, output);
    if (!isSubPkg) {
      throw new Error("检测到此包是分包后的子包, 请通过 -s 参数指定存放路径后重试, 如 node wuWxapkg.js -s=/xxx/xxx ./testpkg/test-pkg-sub.wxapkg");
    }
  }
}
