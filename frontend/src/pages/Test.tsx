import {Button, Drawer, theme} from "antd";
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
    return (
        <div style={containerStyle}>
            Render in this
            <div
                style={{
                    marginTop: 16,
                }}
            >
                <Button type="primary" onClick={showDrawer}>
                    Open
                </Button>
            </div>
            <Drawer
                title={<Button size={"small"} onClick={()=>{setOpen(false)}}></Button>}
                placement="right"
                closable={false}
                onClose={onClose}
                open={open}
                getContainer={false}
                maskClosable={false}
                width={'100%'}
                forceRender
            >
                <p>Some contents...</p>
            </Drawer>
        </div>
    );
};

