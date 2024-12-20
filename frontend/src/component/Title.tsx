import {ConfigProvider, Tooltip} from "antd";
import React from "react";


type Props = {
    text:string;
    children: React.ReactNode;
}

export const Title:React.FC<Props>=(props)=>{
    return (
        <ConfigProvider
            theme={{
                components: {
                    Tooltip: {
                        borderRadius: 0,
                        colorBgSpotlight: "rgba(255, 255, 255)",
                        colorTextLightSolid: "rgba(0, 0, 0)",
                        fontSize: 12,
                        boxShadowSecondary: "0 0 0px 1px rgba(0, 0, 0,0.5)",
                        controlHeight: 14,
                        paddingSM: 2,
                    },
                },
            }}
        >
            <Tooltip placement="bottom" arrow={false} title={props.text}>
                {props.children}
            </Tooltip>
        </ConfigProvider>
    );
}