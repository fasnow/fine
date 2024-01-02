
import { SmileOutlined } from "@ant-design/icons";
const NotFound: React.FC = () => (
    <div style={{
        textAlign: 'center',
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
    }}>
        <SmileOutlined style={{ fontSize: 20 }} />
        <p>敬请期待</p>
    </div>
)
export default NotFound;