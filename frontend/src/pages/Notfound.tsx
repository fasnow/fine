
import { SmileOutlined } from "@ant-design/icons";
import { Empty } from "antd";
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