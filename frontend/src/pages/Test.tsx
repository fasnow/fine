import React, { ForwardedRef, ReactNode, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Button, Tabs, Tag } from 'antd';

type TargetKey = React.MouseEvent | React.KeyboardEvent | string;

type ChildComponentProps = {
    input?: string | number
    onAdd: (passive: boolean) => void
}

const TabContent = React.forwardRef((props: ChildComponentProps, ref: ForwardedRef<any>) => {
    // 在子组件中使用 ref
    useImperativeHandle(ref, () => ({
        // 暴露给父组件的方法或属性
        doSomething: (): string => {
            // 这里可以执行一些操作
            return "123"
        },
        value
    }));

    const [value, setValue] = useState<number>(Math.random())

    return (
        <div>
            <Tag>my value: {value}</Tag><Button onClick={() => props.onAdd(true)}>click</Button><Tag>your value: {props.input}</Tag>
        </div>
    );
});

const Test: React.FC = () => {
    const [activeKey, setActiveKey] = useState<string>();
    const index = useRef<number>(0)
    const tabRefs = useRef([])
    const [value, setValue] = useState();
    const [items, setItems] = useState<{ label: string, key: string, children: React.ReactNode }[]>([
        // {
        //     label: "1",
        //     key: `${index.current++}`,
        //     children: <TabContent onAdd={function (r): void {
        //         // add(r.value)
        //     }} ref={(r) => tabRefs.current.push(r)} />
        // }

    ]);

    useEffect(() => {
        add(false)
    }, [])

    const onChange = (newActiveKey: string) => {
        setActiveKey(newActiveKey);
    };

    const add = (passive: boolean) => {
        const newActiveKey = `${index.current++}`;
        const newPanes = [...items];
        let children: ReactNode
        let item: {
            label: string;
            key: string;
            children: React.ReactNode;
        }
        if (passive) {
            for (let i = 0; i < items.length; i++) {
                if (items[i].key == activeKey) {
                    item = items[i]
                }
            }
            const ref = tabRefs.current[parseInt(item.key)]

            children = <TabContent input={ref.value} onAdd={function (r): void {
                add(r)
            }} ref={(r) => tabRefs.current.push(r)}
            />
        } else {
            children = <TabContent onAdd={function (r): void {
                add(r)
            }} ref={(r) => tabRefs.current.push(r)}
            />
        }
        newPanes.push({
            label: 'New Tab',
            children: children,
            key: newActiveKey
        });
        setItems(newPanes);
        setActiveKey(newActiveKey);
    };

    const remove = (targetKey: TargetKey) => {
        let newActiveKey = activeKey;
        let lastIndex = -1;
        items.forEach((item, i) => {
            if (item.key === targetKey) {
                lastIndex = i - 1;
            }
        });
        const newPanes = items.filter((item) => item.key !== targetKey);
        if (newPanes.length && newActiveKey === targetKey) {
            if (lastIndex >= 0) {
                newActiveKey = newPanes[lastIndex].key;
            } else {
                newActiveKey = newPanes[0].key;
            }
        }
        setItems(newPanes);
        setActiveKey(newActiveKey);
    };

    const onEdit = (
        targetKey: React.MouseEvent | React.KeyboardEvent | string,
        action: 'add' | 'remove',
    ) => {
        if (action === 'add') {
            add(false);
        } else {
            remove(targetKey);
        }
    };

    return (
        <Tabs
            type="editable-card"
            onChange={onChange}
            // activeKey={activeKey}
            onEdit={onEdit}
            items={items}
        />
    );
};

export default Test;