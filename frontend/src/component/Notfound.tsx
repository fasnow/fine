import {Empty} from "antd";
import React from "react";

const NotFound: React.FC = () => (
    <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        style={{
        textAlign: 'center',
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
    }}
           description={"暂无数据"}
    />
)
export default NotFound;