import { CheckOutlined, CopyOutlined } from "@ant-design/icons";
import { Button, ButtonProps, Tooltip } from "antd";
import { TooltipPlacement } from "antd/es/tooltip";
import React, { useState } from "react";
import copy from 'copy-to-clipboard';
interface CopyProps extends ButtonProps {
    onClick?: () => void
    title?: string
    placement: TooltipPlacement
    text: string
}

const Copy: React.FC<CopyProps> = ({ text, onClick, placement = "bottom", children, title, type, size, ...restProps }) => {
    const [copyed, setCopyed] = useState<boolean>(false)
    const [optTitle, setOptTitle] = useState<string>(title || "复制")
    const [open, setOpen] = useState<boolean>(false)
    return (
        <>
            {
                children ?
                    <Tooltip title={optTitle} placement={placement} destroyTooltipOnHide mouseLeaveDelay={0} mouseEnterDelay={0}
                    // open={open}
                    >
                        <Button {...restProps}
                            size={size || "small"}
                            type={type || "text"}
                            // icon={copyed ? <CheckOutlined /> : <CopyOutlined />}
                            onClick={() => {
                                copy(text)
                                // setCopyed(true)
                                setOptTitle("已复制")
                                setOpen(true)
                                if (onClick) {
                                    onClick()
                                }
                            }}
                            onMouseLeave={() => {
                                setCopyed(false);
                                // setOpen(false);
                                setOptTitle(title || "复制")
                            }}
                        >
                            {children}
                        </Button>
                    </Tooltip>
                    :
                    <Tooltip title={optTitle} placement={placement} destroyTooltipOnHide mouseLeaveDelay={0} mouseEnterDelay={0}>
                        <Button {...restProps}
                            size={size || "small"}
                            type={type || "link"}
                            icon={copyed ? <CheckOutlined /> : <CopyOutlined />}
                            onClick={() => {
                                copy(text)
                                setCopyed(true)
                                setOptTitle("已复制")
                                if (onClick) {
                                    onClick()
                                }
                            }}
                            onMouseLeave={() => { setCopyed(false); setOptTitle(title || "复制") }}
                        />
                    </Tooltip>
            }
        </>


    )
};

export default Copy