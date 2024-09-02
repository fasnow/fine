import {MenuItemType} from "antd/es/menu/interface";

export class MenuItem{
    private static i = 0;

    static OpenUrl:MenuItemType = {
        label: "浏览器打开",
        key: `${MenuItem.i++}`,
        icon: "",
    }
    static OpenDomain:MenuItemType = {
        label: "浏览器打开域名",
        key: `${MenuItem.i++}`,
        icon: "",
    }
    static QueryIP:MenuItemType = {
        label: "查询IP",
        key: `${MenuItem.i++}`,
        icon: "",
    }
    static QueryIpCidr:MenuItemType = {
        label: "查询C段",
        key: `${MenuItem.i++}`,
        icon: "",
    }
    static QueryTitle:MenuItemType = {
        label: "查询Title",
        key: `${MenuItem.i++}`,
        icon: "",
    }
    static CopyAll:MenuItemType = {
        label: "复制表格",
        key: `${MenuItem.i++}`,
        icon: "",
    }
    static CopyUrlCol:MenuItemType = {
        label: "复制URL列",
        key: `${MenuItem.i++}`,
        icon: "",
    }
    static CopyCell:MenuItemType = {
        label: "复制单元格",
        key: `${MenuItem.i++}`,
        icon: "",
    }
    static CopyRow:MenuItemType = {
        label: "复制行",
        key: `${MenuItem.i++}`,
        icon: "",
    }
    static CopyCol:MenuItemType = {
        label: "复制列",
        key: `${MenuItem.i++}`,
        icon: "",
    }

}