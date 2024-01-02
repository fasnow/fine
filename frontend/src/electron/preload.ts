import { contextBridge, ipcRenderer } from 'electron'
import { DownloadLogItem, ExportDataReturnType } from '../type';
contextBridge.exposeInMainWorld('electronAPI', {
    send: (channel: string, data: any) => {
        ipcRenderer.send(channel, data);
    },
    on: (channel: string, listener: (event: any, ...args: any[]) => void) => {
        ipcRenderer.on(channel, listener);
    },

    getExe: () =>
        ipcRenderer.invoke('getExe'),
    isPackaged: () =>
        ipcRenderer.invoke('isPackaged'),
    getResourcesPath: () =>
        ipcRenderer.invoke('getResourcesPath'),
    getPlatform: () =>
        ipcRenderer.invoke('getPlatform'),
    getAppPath: () =>
        ipcRenderer.invoke('getAppPath'),
    getAppDataPath: () =>
        ipcRenderer.invoke('getAppDataPath'),
    openDefaultBrowser: (domain: string) =>
        ipcRenderer.invoke('openDefaultBrowser', domain),
    getServerPort: () =>
        ipcRenderer.invoke('getServerPort'),
    startServer: (port: number): Promise<boolean> =>
        ipcRenderer.invoke('startServer', port),
    dragTitleBar: (x: number, y: number) =>
        ipcRenderer.invoke('dragTitleBar', x, y),
    closeApp: () =>
        ipcRenderer.invoke('closeApp'),
    minimizeApp: () =>
        ipcRenderer.invoke('minimizeApp'),
    maximizeApp: () =>
        ipcRenderer.invoke('maximizeApp'),
    unmaximizeApp: () =>
        ipcRenderer.invoke('unmaximizeApp'),
    exportLocalDataToExcel: (data: any, filename: string): Promise<ExportDataReturnType> =>
        ipcRenderer.invoke('exportLocalDataToExcel', data, filename),
    exportDataToExcel: (stream: any, filepath: string) =>
        ipcRenderer.invoke('exportDataToExcel', stream, filepath),
    openFile: (filedir: string, filename: string) =>
        ipcRenderer.invoke('openFile', filedir, filename),
    openFolder: () =>
        ipcRenderer.invoke('openFolder'),
    showFileInFolder: (filedir: string, filename: string) =>
        ipcRenderer.invoke('showFileInFolder', filedir, filename),
    getFilepath: (filedir: string, filename: string) =>
        ipcRenderer.invoke('getFilepath', filedir, filename),
    removeFile: (filedir: string, filename: string) =>
        ipcRenderer.invoke('removeFile', filedir, filename),
    saveDownloadLogItem: (item: DownloadLogItem) =>
        ipcRenderer.invoke('saveDownloadLogItem', item),
    getDownloadLog: () =>
        ipcRenderer.invoke('getDownloadLog'),
    clearDownloadLog: () =>
        ipcRenderer.invoke('clearDownloadLog'),

})
