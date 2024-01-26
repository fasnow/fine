import { ConfigProvider, Tabs } from "antd"
import Icp from "./Icp"


const Domain: React.FC = () => {
    return <ConfigProvider
        theme={{
            components: {
                Tabs: {
                    horizontalMargin: "0 0 1px 0"
                }
            }
        }}
    >

        <Tabs
            style={{ height: "30px" }}
            size="small"
            hideAdd
            items={[
                { key: "icp", label: "ICP备案查询", children: <Icp />, closable: false },
                // { key: "ip138", label: "IP138", children: <IP138 />, closable: false },
            ]}

        />
    </ConfigProvider >
}

export default Domain