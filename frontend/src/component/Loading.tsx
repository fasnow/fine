import React from "react";
import { Spin } from "antd";

const Loading: React.FC = () => (
    <Spin spinning={true}
        style={{
            textAlign: 'center',
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
        }}
    />
)
export default Loading;