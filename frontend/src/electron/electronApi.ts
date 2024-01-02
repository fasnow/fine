import { DownloadLogItem, ExportDataReturnType } from "../type"

export const _isPackaged = ():Promise<boolean> => {
     return (window as any).electronAPI.isPackaged()
}

export const _getResourcesPath = ():Promise<string> => {
     return (window as any).electronAPI.getResourcesPath()
}
export const _getAppPath = () => {
     return (window as any).electronAPI.getAppPath()
}
export const _getExe = ():Promise<string> => {
     return (window as any).electronAPI.getExe()
}

export const _getPlatform = (): Promise<string> => {
     return (window as any).electronAPI.getPlatform()
}

export const _getAppDataPath = (): Promise<string> => {
     return (window as any).electronAPI.getAppDataPath()
}

export const _openDefaultBrowser = (domain: string) => {
     return (window as any).electronAPI.openDefaultBrowser(domain)
}
export const _getServerPort = (): Promise<number> => {
     return (window as any).electronAPI.getServerPort()
}
export const _startServer = (port: number): Promise<boolean> => {
     return (window as any).electronAPI.startServer(port)
}

export const _dragTitleBar = (x: number, y: number) => {
     return (window as any).electronAPI.dragTitleBar(x, y)
}
export const _closeApp = () => {
     return (window as any).electronAPI.closeApp()
}
export const _minimizeApp = () => {
     return (window as any).electronAPI.minimizeApp()
}
export const _maximizeApp = () => {
     return (window as any).electronAPI.maximizeApp()
}

export const _unmaximizeApp = () => {
     return (window as any).electronAPI.unmaximizeApp()
}
export const _isFullScreen = () => {
     return (window as any).electronAPI.isFullScreen()
}
export const _send = (channel: string, data: any) => {
     return (window as any).electronAPI.send(channel, data)
}
export const _on = (channel: string, listener: (event: any, ...args: any[]) => void) => {
     return (window as any).electronAPI.on(channel, listener)
}

export const _exportLocalDataToExcel = (data: any,filename:string):Promise<ExportDataReturnType>  => {
     return (window as any).electronAPI.exportLocalDataToExcel(data,filename)
}

export const _showFileInFolder = (filedir: string, filename: string): Promise<Error> => {
     return (window as any).electronAPI.showFileInFolder(filedir, filename)
}

export const _openFile = (filedir: string, filename: string):Promise<Error> => {
     return (window as any).electronAPI.openFile(filedir, filename)
}

export const _openFolder = () => {
     return (window as any).electronAPI.openFolder()
}

export const _getFilepath = (filedir: string, filename: string): Promise<{ exists: boolean, directory: string, fileName: string }> => {
     return (window as any).electronAPI.getFilepath(filedir, filename)
}

export const _removeFile = (filedir: string, filename: string): Promise<Error> => {
     return (window as any).electronAPI.removeFile(filedir, filename)
}

export const _exportDataToExcel = (stream: any, filepath: string): Promise<ExportDataReturnType> => {//返回是错误信息，如果有的话
     return (window as any).electronAPI.exportDataToExcel(stream, filepath)
}

export const _saveDownloadLogItem = (item: DownloadLogItem) => {
     return (window as any).electronAPI.saveDownloadLogItem(item)
}

export const _getDownloadLog = (): { items: DownloadLogItem[], error: any } => {
     return (window as any).electronAPI.getDownloadLog()
}

export const _clearDownloadLog = (): Promise<Error> => {
     return (window as any).electronAPI.clearDownloadLog()
}



