import { Empty } from "antd";
import React from "react";
const NotFound: React.FC = () => (
    <Empty style={{
        textAlign: 'center',
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
    }}
    description={"404"}
    />
)
export default NotFound;