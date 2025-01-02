import React, { useEffect, useRef, useState } from "react";
import {Tabs, TabsProps} from "antd";
import { Tab } from "rc-tabs/lib/interface"
import {TargetKey} from "@/pages/Constants";
import TabLabel from "@/component/TabLabel";

interface TianYanChaProps extends TabsProps{
    defaultTabContent: React.ReactNode;
}

const TabsV2: React.FC<TianYanChaProps> = (props) => {
    const [activeKey, setActiveKey] = useState<string>();
    const [items, setItems] = useState<Tab[]>([]);
    const newTabIndex = useRef<number>(0);

    // 初始化时添加默认的 Tab
    useEffect(() => {
        addTab(props.defaultTabContent);
    }, []);

    // Tab 切换
    const onTabChange = (newActiveKey: string) => {
        setActiveKey(newActiveKey);
    };

    // 添加 Tab，动态传入内容
    const addTab = (content: React.ReactNode) => {
        const newActiveKey = `${++newTabIndex.current}`;
        setItems([
            ...items,
            {
                label: <TabLabel label={newActiveKey} />,
                key: newActiveKey,
                children: content,
            },
        ]);
        setActiveKey(newActiveKey);
    };

    // 删除 Tab
    const removeTab = (targetKey: TargetKey) => {
        const targetIndex = items.findIndex((pane) => pane.key === targetKey);
        const newPanes = items.filter((pane) => pane.key !== targetKey);

        // 如果删除当前激活的 Tab，则激活下一个 Tab
        if (newPanes.length && targetKey === activeKey) {
            const { key } =
                newPanes[
                    targetIndex === newPanes.length ? targetIndex - 1 : targetIndex
                    ];
            setActiveKey(key);
        }

        setItems(newPanes);
    };

    // 处理 Tab 的新增和删除
    const onEditTab = (
        targetKey: React.MouseEvent | React.KeyboardEvent | string,
        action: "add" | "remove"
    ) => {
        if (action === "add") {
            addTab(props.defaultTabContent);
        } else {
            removeTab(targetKey);
        }
    };

    return <Tabs
        style={{height: '100%', width: '100%'}}
        size="small"
        type="editable-card"
        onChange={onTabChange}
        activeKey={activeKey}
        onEdit={onEditTab}
        items={items}
        tabBarExtraContent={props.tabBarExtraContent}
    />
};

export default TabsV2;
