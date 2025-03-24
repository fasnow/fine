import copyToClipboard from "copy-to-clipboard";
import dayjs, {Dayjs} from "dayjs";
import {message} from "antd";
import {ColDef, GridApi} from "ag-grid-community";
import duration from 'dayjs/plugin/duration';

// 扩展 dayjs 以支持 duration 功能
dayjs.extend(duration);

export const formatTimeSpent = (seconds:number)=>{
    const dur = dayjs.duration(seconds, 'seconds');
    const hours = dur.hours();
    const minutes = dur.minutes();
    const remainingSeconds = dur.seconds();

    let formattedTime = '';

    if (hours > 0) {
        formattedTime += `${hours}h`;
    }
    if (minutes > 0) {
        formattedTime += `${minutes}m`;
    }
    if (remainingSeconds > 0 || (hours === 0 && minutes === 0)) {
        formattedTime += `${remainingSeconds}s`;
    }

    return formattedTime;
}

export const getSortedData = <T>(api:GridApi | undefined): T[]=>{
    if(!api)return []
    const sortedData: T[] = [];
    api.forEachNodeAfterFilterAndSort((node) => {
        sortedData.push(node.data);
    });
    return sortedData
}

export const getAllDisplayedColumnKeysNoIndex = (api:GridApi | undefined, columnDefs:ColDef[])=>{
    if (api) {
        const selectedCols = api.getAllDisplayedColumns()
        const fields: string[] = []
        selectedCols?.forEach(col => {
            const field = col.getColId()
            field !== 'index' && fields.push(field)
        })
        return fields
    }
    const fields: string[] = []
    columnDefs?.forEach(col => {
        const hide = col.hide === undefined ? false : col.hide
        if (!hide && col.field && col.field !== 'index') {
            fields.push(col.field)
        }
    })
    return fields
}

export const getAllDisplayedColumnKeys = (api:GridApi | undefined, columnDefs:ColDef[])=>{
    if (api) {
        const selectedCols = api.getAllDisplayedColumns()
        const fields: string[] = []
        selectedCols?.forEach(col => {
            const field = col.getColId()
            fields.push(field)
        })
        return fields
    }
    const fields: string[] = []
    columnDefs?.forEach(col => {
        const hide = col.hide === undefined ? false : col.hide
        if (!hide && col.field) {
            fields.push(col.field)
        }
    })
    return fields
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
                fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? (o as any)[k] : ('00' + (o as any)[k]).substr(('' + (o as any)[k]).length));
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

export const strSplit = (str: string, delimiter: string, limit: number): string[] => {
    let parts = str.split(delimiter);

    if (parts.length === limit) {
        return parts;
    } else if (parts.length < limit) {
        // 小于 `limit` 时，补充空字符串到指定长度
        while (parts.length < limit) {
            parts.push("");
        }
        return parts;
    } else {
        // 大于 `limit` 时，将多余部分合并到最后一个元素
        return [...parts.slice(0, limit - 1), parts.slice(limit - 1).join(delimiter)];
    }
};


export const copy = (value: any) => {
    if (!value) {
        copyToClipboard(value)
        return
    }
    const valueType = typeof value
    if (valueType === "string") {
        copyToClipboard(value)
    } else if (valueType === "number" || valueType === "boolean") {
        copyToClipboard(value.toString())
    } else if (value instanceof Array) {
        const values = value.map((item) => {
            if (!item) {
                return ""
            }
            const itemType = typeof item
            if (itemType === "string") {
                return item
            } else if (itemType === "number" || itemType === "boolean") {
                return item.toString()
            } else {
                return JSON.stringify(item)
            }
        })
        copyToClipboard(values.join("\n"))
    }
    else {
        copyToClipboard(JSON.stringify(value))
    }
    message.success("复制成功",0.8)
}

interface Preset {
    label: string;
    value: [Dayjs, Dayjs];
}

export const RangePresets: Preset[] = [
    { label: '最近7天', value: [dayjs().add(-7, 'd'), dayjs()] },
    { label: '最近15天', value: [dayjs().add(-14, 'd'), dayjs()] },
    { label: '最近一月', value: [dayjs().add(-1, 'month'), dayjs()] },
    { label: '最近三月', value: [dayjs().add(-3, 'month'), dayjs()] },
    { label: '最近六月', value: [dayjs().add(-6, 'month'), dayjs()] },
    { label: '最近一年', value: [dayjs().add(-1, 'year'), dayjs()] },
    { label: '最近两年', value: [dayjs().add(-2, 'year'), dayjs()] },
    { label: '最近三年', value: [dayjs().add(-3, 'year'), dayjs()] },
];

export const  truncateString = (str: string, maxLength: number): string => {
    if (str.length > maxLength) {
        return str.slice(0, maxLength) + '...';
    }
    return str;
}