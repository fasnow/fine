import React from "react";
import type { MenuProps } from "antd";
import { ConfigProvider, Menu } from "antd";
import { useNavigate } from "react-router-dom";

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[],
    type?: "group"
): MenuItem {
    return {
        key,
        icon,
        children,
        label,
        type,
    } as MenuItem;
}

const items: MenuItem[] = [
    getItem("设置", "/setting", null),
    // getItem("编解码", "/encode", null),
    getItem("批量HTTP", "/http", null),

    getItem("备案查询", "/icp", null),
    getItem("IP138", "/ip138", null),
    // getItem("天眼查", "/tianyancha", null),
    getItem("资产测绘", "sub2", null, [
        // getItem("聚合搜索", "/aggregate"),
        getItem("Fofa", "/fofa"),
        getItem("Hunter", "/hunter"),
        getItem("Quake", "/quake"),
        getItem("0.zone", "/0.zone"),
        // getItem("Zoomeye", "/zoomeye"),
        // getItem("Shodan", "15"),
        // getItem("Test", "/test"),
    ]),
];

const MainMenu: React.FC = () => {
    const navigate = useNavigate()
    const onClick = (e: any) => {
        // console.log(e)
        navigate(e.key, { replace: true })
        // warningNotification("测试标题","测试内容")
    }

    return (
        <ConfigProvider
            theme={{
                components: {
                    Menu: {
                        itemBg: "rgba(70, 118, 195,1)",
                        itemColor: "#ffffff",
                        itemSelectedColor: "#fa8c16",
                        itemHoverColor: "#ffffff",
                        itemHoverBg: "rgba(0, 0, 0, 0.2)",
                        subMenuItemBg: "rgb(70, 118, 195,1)",
                        activeBarBorderWidth: 0
                    },
                }
            }}
        >
            <Menu
                // defaultSelectedKeys={["/setting"]}
                // defaultOpenKeys={["/setting"]}
                mode="inline"
                // theme="dark"
                // inlineCollapsed={collapsed}
                items={items}
                onClick={onClick}
            // style={{width:200}}
            />
        </ConfigProvider>
    );
};

export default MainMenu;
