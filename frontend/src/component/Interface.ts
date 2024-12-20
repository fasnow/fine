import {MenuItemType} from "antd/es/menu/interface";

export class MenuItems {
    private static i = 0;

    static OpenUrl:MenuItemType = {
        label: "浏览器打开",
        key: `${MenuItems.i++}`,
        icon: "",
    }
    static OpenDomain:MenuItemType = {
        label: "浏览器打开域名",
        key: `${MenuItems.i++}`,
        icon: "",
    }
    static QueryIP:MenuItemType = {
        label: "查询IP",
        key: `${MenuItems.i++}`,
        icon: "",
    }
    static QueryIpCidr:MenuItemType = {
        label: "查询C段",
        key: `${MenuItems.i++}`,
        icon: "",
    }
    static QueryTitle:MenuItemType = {
        label: "查询Title",
        key: `${MenuItems.i++}`,
        icon: "",
    }
    static CopyAll:MenuItemType = {
        label: "复制表格",
        key: `${MenuItems.i++}`,
        icon: "",
    }
    static CopyUrlCol:MenuItemType = {
        label: "复制URL列",
        key: `${MenuItems.i++}`,
        icon: "",
    }
    static CopyCell:MenuItemType = {
        label: "复制单元格",
        key: `${MenuItems.i++}`,
        icon: "",
    }
    static CopyRow:MenuItemType = {
        label: "复制行",
        key: `${MenuItems.i++}`,
        icon: "",
    }
    static CopyCol:MenuItemType = {
        label: "复制列",
        key: `${MenuItems.i++}`,
        icon: "",
    }
    static HolderPenetrate:MenuItemType = {
        label: "股权穿透图",
        key: `${MenuItems.i++}`,
        icon: "",
    }
}

export type WithIndex<T> = T & { index: number };