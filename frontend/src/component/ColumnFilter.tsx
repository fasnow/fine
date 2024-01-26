import React, { PropsWithChildren, useEffect, useState } from "react";
import { Checkbox, Button, Divider, Popover, ConfigProvider, Tag } from "antd";
import { CheckboxOptionType, CheckboxValueType } from "antd/es/checkbox/Group";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import ScrollBar from "./ScrollBar";
import { SettingOutlined } from "@ant-design/icons";

export type DataSourceItemType = { label: string, value: string, comment?: string }

interface ColumnsFilterProps {
    dataSource: DataSourceItemType[];
    checkedSource: string[]
    onChange: (checkedItems: CheckboxValueType[]) => void;
    icon?: React.ReactNode
    minWidth?: string | number
}

const ColumnsFilter: React.FC<ColumnsFilterProps> = (props: PropsWithChildren<ColumnsFilterProps>) => {
    const [open, setOpen] = useState<boolean>(false)
    const CheckboxGroup = Checkbox.Group;
    //复制一份
    const rawItems = props.dataSource.map(item => ({ ...item }));
    //格式化成checkboxgroup选项
    const items: Array<CheckboxOptionType> = rawItems.map(item => {
        const tmp: CheckboxOptionType = { value: item.value, label: item.label }
        if (item.comment) {
            tmp.label = <span style={{ minWidth: props.minWidth ? props.minWidth : "200px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>{item.label}</span>
                <Tag bordered={false} style={{ marginLeft: "5px", lineHeight: "18px" }} color="red">{item.comment}</Tag>
            </span>
        }
        return tmp
    });
    //用于重置选中值
    const defaultCheckedValues = props.dataSource.map((item) => {
        if (props.checkedSource?.includes(item.value)) {
            return item.value
        }
    });
    const [checkedValues, setCheckedValues] = useState<CheckboxValueType[]>(() => {//初始化选中值
        const tmp: string[] = []
        if (props.checkedSource) {
            for (let i = 0; i < rawItems.length; i++) {
                const value = rawItems[i].value
                if (props.checkedSource.includes(value)) {
                    tmp.push(value)
                }
            }
        }
        return tmp
    });
    const [indeterminate, setIndeterminate] = useState(true);
    const [checkAll, setCheckAll] = useState(false);

    useEffect(() => {
        setIndeterminate(!!checkedValues.length && checkedValues.length < items.length);
        setCheckAll(checkedValues.length === items.length)
        // if()
    }, [])

    const onChanged = (list: CheckboxValueType[]) => {
        setCheckedValues(list);
        setIndeterminate(!!list.length && list.length < items.length);
        setCheckAll(list.length === items.length);
        props.onChange(list)
    };

    const onCheckAllChange = (e: CheckboxChangeEvent) => {
        setCheckedValues(e.target.checked ? items.map(item => item.value) : []);
        setIndeterminate(false);
        setCheckAll(e.target.checked);
        props.onChange(e.target.checked ? items.map(item => item.value) : [])
    };

    const onReset = () => {
        // @ts-ignore
        setCheckedValues(defaultCheckedValues);
        // @ts-ignore
        props.onChange(defaultCheckedValues)
    };


    return (
        <>
            <Popover
                open={open}
                onOpenChange={() => setOpen(!open)}
                trigger="click" placement={"bottom"}
                title={
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", }}>
                        <Checkbox
                            indeterminate={indeterminate}
                            onChange={onCheckAllChange}
                            checked={checkAll}
                        >
                            列展示
                        </Checkbox>
                        <Button type="text" size="small" onClick={onReset}>重置</Button>
                    </div>
                }
                content={(
                    <ConfigProvider theme={{
                        components: {
                            Divider: {
                                marginLG: 0
                            }
                        }
                    }}>
                        <div>
                            <Divider />
                            <ScrollBar maxHeight={"300px"}>
                                <CheckboxGroup
                                    style={{ display: "grid" }}
                                    options={items}
                                    value={checkedValues}
                                    onChange={(checkedValue: CheckboxValueType[]) => onChanged(checkedValue)}
                                />
                            </ScrollBar>
                        </div>
                    </ConfigProvider>
                )}
            >
                <Button type="text" size="small" icon={props.icon ? props.icon : <SettingOutlined />} />


            </Popover>
        </>
    );
};

export default ColumnsFilter;
