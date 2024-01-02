import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { DownloadLogItem, ExportDataReturnType } from "../type";
import { promisify } from 'util';
import fs from 'fs';
import net from 'net';
import path from 'path';
import { ChildProcessWithoutNullStreams, exec } from 'child_process';
import { getCurrentTimestamp } from '../utils/utils';
import { spawn } from 'child_process';
import yaml from 'js-yaml';
import xlsx1 from 'node-xlsx';

let mainWindow: BrowserWindow
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
const execAsync = promisify(exec);
const cli = path.join(process.resourcesPath, process.platform === "win32" ? "../bin/fine-cmd.exe" : "../bin/fine-cmd")
// const cli = path.join(__dirname, "../../bin/fine-cmd.exe")
process.env.IS_BETA = "pro"

let APP_PATH: string;
let DATA_PATH: string
let DOWALOAD_LOG_FILE: string
let HOME_PATH: string
let ARCH: NodeJS.Platform
var server: ChildProcessWithoutNullStreams

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    x: 100,
    y: 100,
    webPreferences: {
      // devTools:false,
      webSecurity: true,
      nodeIntegration: true,
      contextIsolation: true,
      // enableRemoteModule: true,
      // preload: path.join(__dirname, '../renderer/main_window/preload.js'),
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
    // frame: false, // 隐藏原生标题栏
    titleBarStyle: 'hidden', // 隐藏原生标题栏的按钮和文字
    show: false,
  })
  ARCH = process.platform
  switch (ARCH) {
    case "win32":
      HOME_PATH = "./"
      APP_PATH = process.cwd()//仅对windows
      DATA_PATH = path.join(process.cwd(), "data");
      DOWALOAD_LOG_FILE = path.join(DATA_PATH, "download.log");
      break
    case "darwin":
      HOME_PATH = app.isPackaged ? app.getPath('home') : "/Users/fasnow/"
      DATA_PATH = path.join(HOME_PATH, "fine/data");
      DOWALOAD_LOG_FILE = path.join(DATA_PATH, "download.log");
      break
    default:
  }

  checkDataPath()
  if (!app.isPackaged) {
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
    // 解决 Windows 无法正常打开开发者工具的问题 ↓
    // mainWindow.webContents.setDevToolsWebContents(new BrowserWindow().webContents)
    // 打开开发者工具
    mainWindow.webContents.openDevTools({ mode: 'bottom' });
  }
  else {
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
    // mainWindow.webContents.openDevTools({ mode: 'bottom' }); 
  }
  mainWindow.on('ready-to-show', function () {
    mainWindow.show() // 初始化后再显示
    // mainWindow.setIcon("../public/assets/image/paimon.ico")
  })
}

async function getPPidDir() {
  if (process.platform === 'win32') {
    if (!app.isPackaged) {
      return "D:"
    }
    //单文件版需要ppid 安装版和免安装版不需要ppid
    const { stderr, stdout } = await execAsync("powershell \"Get-Process -Id " + process.ppid + " | Select-Object -Property Path")
    var path = stdout.split("\r\n")[3]
    if (path.toLowerCase() == "C:\\WINDOWS\\Explorer.EXE".toLowerCase()) {
      const { stderr, stdout } = await execAsync("powershell \"Get-Process -Id " + process.pid + " | Select-Object -Property Path")
      path = stdout.split("\r\n")[3]
    }
    return path.substr(0, path.lastIndexOf("\\"))
  } else if (process.platform === 'darwin') {

  } else {
    return ""
  }
}

async function findAvailablePort(port: number) {
  const server = net.createServer().listen({ host: '127.0.0.1', port: port });
  return new Promise<number>((resolve, reject) => {
    // 如果监听成功，表示端口没有被其他服务占用，端口可用，取消监听，返回端口给调用者。
    server.on("listening", () => {
      server.close();
      resolve(port);
    });
    // 如果监听出错，端口+1，继续监听，直到监听成功。
    server.on("error", async (err: { code: string; }) => {
      if (err.code === 'EADDRINUSE') {
        resolve(await findAvailablePort(port + 1));
      } else {
        reject(err);
      }
    });
  });
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
  // macos command+q
  app.on('before-quit', () => {
    if (process.platform == 'darwin') {
      if (server) {
        server.kill('SIGTERM'); // 或者使用 childProcess.kill('SIGKILL') 等信号
      }
    }
  });
  app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
      app.quit()
    } else {
      //程序会保留到程序坞，但是需要把开启的http服务关闭，不然下次会开启一个新的http服务
      if (server) {
        server.kill('SIGTERM'); // 或者使用 childProcess.kill('SIGKILL') 等信号
      }
    }
  });


})

ipcMain.handle('closeApp', () => {
  mainWindow.close()
})

ipcMain.handle('minimizeApp', () => {
  mainWindow.minimize()
})

ipcMain.handle('maximizeApp', () => {
  mainWindow.maximize();
})

ipcMain.handle('unmaximizeApp', () => {

  mainWindow.unmaximize();

})

ipcMain.handle('isPackaged', async (event: any): Promise<boolean> => {
  return app.isPackaged
})

ipcMain.handle('getResourcesPath', async (event: any): Promise<string> => {
  return process.resourcesPath
})

ipcMain.handle('getPlatform', (event: any): string => {
  return process.platform
})

ipcMain.handle('getAppPath', (event: any): string => {
  return APP_PATH
})

ipcMain.handle('getAppDataPath', (event: any): string => {
  return DATA_PATH
})


ipcMain.handle('openDefaultBrowser', (event: any, domain: string) => {
  //必须带协议
  shell.openExternal(domain)
})

ipcMain.handle('getServerPort', async (event: any): Promise<number> => {
  let port: number = 9321
  await findAvailablePort(port)
    .then((aport: number) => {
      port = aport;
      return
    })
    .catch(err => {
      console.error(err.message)
      port = -1
      return
    }
    );
  return port
})

ipcMain.handle('startServer', async (event: any, port: number) => {
  const bind = '127.0.0.1:' + port
  const dataPath = process.platform=="win32"?"./":path.join(HOME_PATH,"fine")
  server = spawn(cli, ['server', '--bind', bind,"--data-path",dataPath], { stdio: 'pipe' });
  // 将 Promise 返回给渲染进程
  return new Promise((resolve, reject) => {
    const checkPort = () => {
      const client = net.connect(port, '127.0.0.1');
      client.once('error', () => {
        console.log('端口未打开，稍后再次检查');
        // 端口未打开，稍后再次检查
        setTimeout(checkPort, 1000);
      });
      client.once('connect', () => {
        console.log('Server started successfully');
        // 端口已打开，通知渲染进程
        resolve('Server started successfully');
      });
    };

    server.stdout.on('data', (data: any) => {
      checkPort()
      console.log(`${data}`);
    });
    server.stderr.on('data', (data: any) => {
      console.error(`error: ${data}`);
      fs.writeFileSync(path.join(DATA_PATH,"log.text"), data.toString());
      reject(data);
    });
  });
})

ipcMain.handle('exportLocalDataToExcel', async (event: any, data: any[], filename: string): Promise<ExportDataReturnType> => {
  let result: ExportDataReturnType = {
    error: undefined,
    filename: filename,
    dir: DATA_PATH
  }

  // 检查 data 目录是否存在，如果不存在则创建
  if (!fs.existsSync(DATA_PATH)) {
    fs.mkdirSync(DATA_PATH, { recursive: true });
  }
  let filePath = path.join(DATA_PATH, filename);
  if (fs.existsSync(filePath)) {
    // 生成新的文件名
    const timestamp = getCurrentTimestamp();
    // 使用正则表达式来匹配时间戳部分（2023-08-08-08-00-00）
    const regex = /\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}/;
    // 使用 replace 函数替换匹配到的时间戳
    filename = filename.replace(regex, timestamp);
    filePath = path.join(DATA_PATH, filename)
    result.filename = filename
  }
  // 将字符串转换为二进制数据
  const headers = Object.keys(data[0])
  data.forEach(item => {
    for (let i = 0; i < headers.length; i++) {
      if (item[headers[i]] == undefined) { continue }
      if (typeof item[headers[i]] === "string") {
        // excel单元格不能超过32767字符
        if (item[headers[i]].length > 32767) {
          item[headers[i]] = item[headers[i]].substring(0, 32767);
        }
        item[headers[i]] = item[headers[i]] == "" ? "-" : item[headers[i]]
      } else if (!Buffer.isBuffer(item[headers[i]]) && typeof item[headers[i]] !== "string") {
        // 如果值时对象则需要将对象转为字符串
        item[headers[i]] = JSON.stringify(item[headers[i]])
        //???没备注时间长了看不懂了
        i--
      }
    }
  });
  let tableData = [Object.keys(data[0])]
  for (let i = 0; i < data.length; i++) {
    tableData.push(Object.values(data[i]))
  }
  const buffer = xlsx1.build([{ name: 'Sheet1', data: tableData, options: null }]);
  // fs.writeFileSync(newFilePath, buffer);
  // 写入文件
  try {
    fs.writeFileSync(filePath, buffer);
    saveDownloadLogItem({
      filename: result.filename,
      dir: DATA_PATH
    })
    return result
  } catch (err) {
    result.error = new Error(`权限不足，文件保存失败: ` + err)
    result.dir = ""
    result.filename = ""
    return result
  }
})


ipcMain.handle('openFile', async (event: any, filedir: string, filename: string): Promise<Error> => {
  try {
    const filepath = path.resolve(filedir, filename)
    if (!fs.existsSync(filepath)) {
      return new Error("文件不存在")
    }
    shell.openPath(filepath)
  } catch (error) {
    console.log(error)
    return error
  }
})

//打开文件并选中文件
ipcMain.handle('showFileInFolder', async (event: any, filedir: string, filename: string): Promise<Error> => {
  try {
    shell.showItemInFolder(path.resolve(filedir, filename));// 使用 shell.showItemInFolder 打开文件夹并选择文件
  } catch (error) {
    return error;
  }
});

//打开下载文件夹
ipcMain.handle('openFolder', async (event: any) => {
  if (!fs.existsSync(DATA_PATH)) {
    await fs.mkdirSync(DATA_PATH, { recursive: true });
  }
  shell.openPath(DATA_PATH)
})

ipcMain.handle('getFilepath', async (event: any, filedir: string, filename: string)
  : Promise<{ exists: boolean, directory: string, fileName: string }> => {
  let filePath = path.join(filedir, filename)
  let directory: string
  let fileName: string
  if (fs.existsSync(filePath)) {
    directory = path.dirname(filePath);
    fileName = path.basename(filePath);
    return {
      exists: true,
      directory,
      fileName
    };
  }
  return {
    exists: false,
    directory,
    fileName
  };
})

ipcMain.handle('removeFile', async (event: any, filedir: string, filename: string): Promise<Error> => {
  try {
    await promisify(fs.unlink)(path.join(filedir, filename));
  } catch (error) {
    return error;
  }
})

ipcMain.handle('clearDownloadLog', async (event: any): Promise<Error> => {
  try {
    if (!fs.existsSync(DOWALOAD_LOG_FILE)) {
      return
    }
    await promisify(fs.unlink)(DOWALOAD_LOG_FILE);
  } catch (error) {
    return error;
  }
})

//保存服务端返回的数据
ipcMain.handle('exportDataToExcel', async (event: any, fileData: any, filename: string): Promise<ExportDataReturnType> => {
  let result: ExportDataReturnType = {
    error: undefined,
    filename: '',
    dir: ''
  }
  try {
    // 检查 data 目录是否存在，如果不存在则创建
    if (!fs.existsSync(DATA_PATH)) {
      fs.mkdirSync(DATA_PATH, { recursive: true });
    }

    const filePath = path.join(DATA_PATH, filename);// 拼接文件保存的完整路径
    fs.writeFileSync(filePath, Buffer.from(fileData));// 将文件数据写入到目标文件
    result.dir = DATA_PATH
    result.filename = filename
    saveDownloadLogItem({
      filename: filename,
      dir: DATA_PATH
    })
  } catch (error) {
    result.error = error;
  }
  return result
})

ipcMain.handle('saveDownloadLogItem', async (event: any, item: DownloadLogItem) => {
  return saveDownloadLogItem(item)
})

ipcMain.handle('getDownloadLog', async (event: any): Promise<{ items: DownloadLogItem[], error: any }> => {
  return getDownloadLog()
})

function saveDownloadLogItem(item: DownloadLogItem): Promise<Error> {
  try {
    // 检查目录是否存在，如果不存在则创建目录
    if (!fs.existsSync(DATA_PATH)) {
      fs.mkdirSync(DATA_PATH, { recursive: true });
    }

    // 如果 YAML 文件不存在，则创建空的文件
    if (!fs.existsSync(DOWALOAD_LOG_FILE)) {
      fs.writeFileSync(DOWALOAD_LOG_FILE, '', 'utf8');
    }
    const result = getDownloadLog()
    if (result.error) {
      return
    }
    result.items.unshift(item);

    // 将更新后的数据转换为 YAML 格式
    const newYamlData = yaml.dump(result.items);

    // 写入更新后的 YAML 数据到文件
    fs.writeFileSync(DOWALOAD_LOG_FILE, newYamlData, 'utf8');
  } catch (error) {
    return error
  }
}

function getDownloadLog(): { items: DownloadLogItem[], error: any } {
  let parsedData: DownloadLogItem[] = [];
  let error
  try {
    // DOWALOAD_LOG_FILE = "/Users/fasnow/fine/cache/download.log"
    // 检查目录是否存在，如果不存在则创建目录
    if (!fs.existsSync(DATA_PATH)) {
      fs.mkdirSync(DATA_PATH, { recursive: true });
    }

    // 如果 YAML 文件不存在，则创建空的文件
    if (!fs.existsSync(DOWALOAD_LOG_FILE)) {
      fs.writeFileSync(DOWALOAD_LOG_FILE, '', 'utf8');
      return { error, items: parsedData }
    }

    // 读取 YAML 文件内容
    const existingData = fs.readFileSync(DOWALOAD_LOG_FILE, 'utf8');
    // 解析现有的 YAML 数据
    if (existingData) {
      parsedData = yaml.load(existingData) as DownloadLogItem[];
    }
    return { error, items: parsedData }
  } catch (error) {
    return { error: error, items: parsedData }
  }
}

function checkDataPath(): Error {
  try {
    if (!fs.existsSync(DATA_PATH)) {
      fs.mkdirSync(DATA_PATH, { recursive: true });
    }
    if (!fs.existsSync(DOWALOAD_LOG_FILE)) {
      fs.writeFileSync(DOWALOAD_LOG_FILE, '', 'utf8');
    }
  } catch (error) {
    return error
  }
}