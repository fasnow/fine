
import useSelection from "antd/es/table/hooks/useSelection";
import { errorNotification, successNotification } from "../component/Notification";
import req from "../http/request";
import { DownloadLogItem } from "../type";
import { RootState } from "../store/store";
import { useSelector } from "react-redux";
import { _getAppDataPath, _openFile, _openFolder, _getDownloadLog, _exportLocalDataToExcel, _exportDataToExcel } from "../electron/electronApi";

export function getTextWidthUsingCanvas(text: string | string[], font?: string): number {
    let tmpText = ""
    if (typeof text === "string") {
        tmpText = text
    } else {
        if (text.length === 0) {
            return 0; // 或者其他默认值
        }

        tmpText = text[0];
        for (let i = 1; i < text.length; i++) {
            if (text[i].length > tmpText.length) {
                tmpText = text[i];
            }
        }
    }
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = font || ''; // 设置字体，可选
    const metrics = context.measureText(tmpText);
    return metrics.width;
}


export const dataFormat = (date: string, fmt: string): string => {
    if (date && fmt) {
        const _date = new Date(date);
        const o = {
            'M+': _date.getMonth() + 1, //月份
            'd+': _date.getDate(), //日
            'h+': _date.getHours(), //小时
            'm+': _date.getMinutes(), //分
            's+': _date.getSeconds(), //秒
            'q+': Math.floor((_date.getMonth() + 3) / 3), //季度
            S: _date.getMilliseconds(), //毫秒
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (_date.getFullYear() + '').substr(4 - RegExp.$1.length));
        }
        for (const k in o) {
            if (new RegExp('(' + k + ')').test(fmt)) {
                fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? (o as any)[k] : ('00' + (o as any)[k]).substr(('' + (o as any)[k]).length));
            }
        }
        return fmt;
    } else {
        return '';
    }
};


export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const isBase64 = (str: string) => {
    const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
    return base64regex.test(str);
}



async function addToDownloadLog(filename: string) {
    const dir = await _getAppDataPath()
    // downloadItems.value.push({
    //     file:filename,
    //     dir:dir,
    // })

}

export class DownloadLog {
    private items: DownloadLogItem[] = []
    async getItems() {
        const result = await _getDownloadLog();
        console.log("result", result)
        if (result.error) {
            errorNotification("下载记录", result.error);
            return;
        }
        this.items = result.items
        return this.items
    }

    remove(filename: string, dir: string) {
        const tmp: DownloadLogItem[] = []
        this.items.map((item: DownloadLogItem) => {
            if (item.dir != dir || item.filename != filename) {
                tmp.push(item)
            }
        })
        this.items = tmp
    }
}

export const downloadLog = new (DownloadLog)

export const getCurrentTimestamp = (): string => {
    const now = new Date();
    const year = now.getFullYear().toString().padStart(4, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;
}

export const localeCompare=(a:any,b:any)=>{
    if (isNaN(a) || isNaN(b)) {
        // 如果值不是数字，将其转换为字符串进行比较
        return String(a).localeCompare(String(b));
      } else {
        // 如果值是数字，将其转换为数字进行比较
        return a - b;
      }
}