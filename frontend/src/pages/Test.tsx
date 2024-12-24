import {Button, Drawer, Pagination, Table, Tabs, theme} from "antd";
import {CSSProperties, useState} from "react";

export const Test = () => {
    const { token } = theme.useToken();
    const [open, setOpen] = useState(false);
    const showDrawer = () => {
        setOpen(true);
    };
    const onClose = () => {
        setOpen(false);
    };
    const containerStyle:CSSProperties = {
        position: 'relative',
        height: 200,
        padding: 48,
        overflow: 'hidden',
        background: token.colorFillAlter,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadiusLG,
    };
    const dataSource = [
        {
            key: "1",
            name: "胡彦斌",
            age: 32,
            address: "西湖区湖底公园1号",
        },
        {
            key: "2",
            name: "胡彦祖",
            age: 42,
            address: "西湖区湖底公园1号",
        },
    ];

    const columns = [
        {
            title: "姓名",
            dataIndex: "name",
            key: "name",
            with: 200,
        },
        {
            title: "年龄",
            dataIndex: "age",
            key: "age",
            with: 200,
        },
        {
            title: "住址",
            dataIndex: "address",
            key: "address",
            with: 200,
        },
    ];
    return (
        <Tabs
            type={"editable-card"}

        items={[1,2].map((i)=>{
            return {
                key:`${i}`,
                label:`${i}`,
                children: <Table
                    size={'small'}
                    pagination={false}
                    virtual
                    columns={columns}
                    scroll={{x:800,y:400}}
                    footer={()=><Pagination
                    showSizeChanger
                />}
                />
            }
        })}
        />
    );
};

