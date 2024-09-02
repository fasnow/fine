import { SearchOutlined } from '@ant-design/icons';
import { Button, Divider, Input, List as AntdList, Space, Spin, Tabs, Modal, Empty } from 'antd';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import Copy from '../component/Copy';
import { List, WindowScroller } from "react-virtualized"
import TextArea from 'antd/es/input/TextArea';
import { sleep } from '@/util/util';
import {GetCurrentDomain, GetCurrentIP, GetHistoryIP} from "../../wailsjs/go/ip138/Bridge";

type TargetKey = React.MouseEvent | React.KeyboardEvent | string;
type TabType = {
    label: string,
    key: string,
    children: ReactNode,
    closable?: boolean
}
type Domain2IPSItem = { domain: string, current?: { ip: string, locationOrDate: string }[], history?: { ip: string, locationOrDate: string }[], msg?: string }
type IP2DomainsItem = { ip: string, current?: { domain: string, date: string }[], msg?: string }
type ModeType = "ip2domains" | "domain2ips" | ""
const rowHeight = 175
const IP138Content: React.FC = () => {
    const [input, setInput] = useState<string>("")
    const [multipleTarget, setMultipleTarget] = useState<string[]>([])
    const [targets, setTargets] = useState<string>()
    const [ips, setIps] = useState<Domain2IPSItem[]>()
    const [domains, setDomains] = useState<IP2DomainsItem[]>()
    const [loading, setLoading] = useState<boolean>(false)
    const [mode, setMode] = useState<ModeType>("")
    const [wornning, setWarnnig] = useState<string>("")
    const running = useRef<boolean>(false)
    const interval = useRef<number>(1000)

    function isIPAddress(input: string): boolean {
        // IPv4 正则表达式
        const ipv4Pattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){2}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

        // IPv6 正则表达式
        const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:){1,7}:$|^[0-9a-fA-F]{1,4}(:[0-9a-fA-F]{1,4}){1,7}$|^::$/;

        return ipv4Pattern.test(input) || ipv6Pattern.test(input);
    }

    const checkCount = (targets: string[]) => {
        let targetList: string[] = []
        let domainCount = 0
        let ipCount = 0
        for (let i = 0; i < targets.length; i++) {
            const target = targets[i].trim()
            if (!target) continue
            targetList.push(target)

        }
        targetList = Array.from(new Set(targetList))
        for (let i = 0; i < targetList.length; i++) {
            const target = targetList[i]
            if (isIPAddress(target)) {
                ipCount++
            } else {
                domainCount++
            }
        }
        return { targetList: targetList, ipCount: ipCount, domainCount: domainCount }
    }
    const preQuery = async () => {
        if(input.trim().indexOf("，")!=-1){
            setWarnnig("输入包含中文逗号")
            return
        }
        const tmpTargetList = input.trim().split(",")
        const { targetList, ipCount, domainCount } = checkCount(tmpTargetList)
        if (ipCount == 0 && domainCount == 0) return
        let tmpMode: ModeType = ""
        if (domainCount > 0 && ipCount > 0) {
            setWarnnig("IP和域名不能同时设置")
            return
        } else {
            tmpMode = domainCount > 0 ? "domain2ips" : "ip2domains"
            setMode(tmpMode)
            setWarnnig("")
        }
        query(tmpMode, targetList)
    }
    const query = async (mode: ModeType, targetList: string[]) => {
        setIps([])
        setDomains([])
        setLoading(true)
        running.current = true
        for (let i = 0; i < targetList.length; i++) {
            if (!running.current) {
                break
            }
            if (i != 0) {
                await sleep(interval.current)
            }
            const target = targetList[i]
            if (mode == "ip2domains") {
                GetCurrentDomain(target).then(
                    async result => {
                        setDomains((pre) => [...(pre||[]), ...[{ip: target, current: result ? result: []}]])
                        await sleep(interval.current)
                    }
                ).catch(
                    async err => {
                        setDomains((pre) => [...(pre||[]), ...[{ip: target, msg: err, current: []}]])
                        await sleep(interval.current)
                    }
                )
            } else if (mode == "domain2ips") {
                const result = await GetCurrentIP(target).then(
                    result=>{
                        if (result.message) {
                            setIps((pre) => [...(pre||[]), ...[{ domain: target, msg: result.message, current: [] }]])
                            return
                        }
                        GetHistoryIP(target).then(
                            result2=>{
                                setIps((pre) => [...(pre||[]), ...[{ domain: target, current: [...result.items, ...result2] }]])
                            }
                        ).catch(
                            err=>{
                                setIps((pre) => [...(pre||[]), ...[{ domain: target, current: result.items }]])
                                return;
                            }
                        )}
                ).catch(
                    err=>{
                        setIps((pre) => [...(pre||[]), ...[{ domain: target, msg: err, current: [] }]])
                    }
                )
            }
        }
        running.current = false
        setLoading(false)
    }

    const MultipleTargetModal: React.FC = () => {
        const [open, setOpen] = useState<boolean>(false)
        const [warning, setWarnnig] = useState<string>("")
        const [input, setInput] = useState<string>("")
        return <>
            <Button type='link' size='small' onClick={() => setOpen(true)}>目标过多?</Button>
            <Modal
                width={400}
                cancelButtonProps={{ size: "small" }}
                okButtonProps={{ size: "small" }}
                cancelText={"取消"} okText={"执行"}
                destroyOnClose mask={false}
                open={open}
                onCancel={() => setOpen(false)}
                onOk={() => {
                    const tmpTargetList = input.trim().split("\n")
                    const { targetList, ipCount, domainCount } = checkCount(tmpTargetList)
                    if (!targetList || targetList.length == 0) {
                        setWarnnig("无效目标")
                        return
                    }
                    if (ipCount > 0 && domainCount > 0) {
                        setWarnnig("域名和IP不能同时设置")
                        return
                    }
                    let tmpMode: ModeType
                    if (ipCount > 0) {
                        tmpMode = "ip2domains"
                        setMode("ip2domains")
                    } else {
                        tmpMode = "domain2ips"
                        setMode("domain2ips")
                    }
                    setOpen(false)
                    setMultipleTarget(targetList)
                    query(tmpMode, targetList)

                }}

            >
                <div style={{ display: 'flex', flexDirection: "column" }}>
                    <TextArea size='small' placeholder='每行一个目标,数量过多会被封的~' autoSize={{ maxRows: 10, minRows: 10 }} value={input} defaultValue={multipleTarget.join("\n")} onChange={(value) => setInput(value.target.value)} />
                    {
                        warning && <span style={{ color: "red" }}>{warning}</span>
                    }
                </div>
            </Modal>
        </>
    }

    // useEffect(() => {
    //     setMode("domain2ips")
    //     // setLoading(true)
    //     setIps([

    //         { domain: "baidu.com", current: [], msg: "" },
    //         { domain: "baidu.com", current: [{ ip: "127.0.0.1", locationOrDate: "2023-01-01" }] },
    //         { domain: "baidu.com", current: [{ ip: "127.0.0.1", locationOrDate: "2023-01-01" }] },
    //         { domain: "baidu.com", current: [{ ip: "127.0.0.1", locationOrDate: "2023-01-01" }] },
    //         { domain: "baidu.com", current: [{ ip: "127.0.0.1", locationOrDate: "2023-01-01" }] },
    //     ])
    //     // setIps(Array.from({ length: 1000 }, () => ({ domain: "baidu.com", current: [{ ip: "127.0.0.1", locationOrDate: "2023-01-01" }] })))
    //     // setMode("ip2domains")
    //     // setDomains([
    //     //     { ip: "127.0.0.1", current: [{ domain: "baidu.com", date: "2023-01-01" }] },
    //     //     { ip: "127.0.0.1", current: [{ domain: "baidu.com", date: "2023-01-01" }] },
    //     //     { ip: "127.0.0.1", current: [{ domain: "baidu.com", date: "2023-01-01" }] },
    //     //     { ip: "127.0.0.1", current: [{ domain: "baidu.com", date: "2023-01-01" }] },
    //     //     { ip: "127.0.0.1", current: [{ domain: "baidu.com", date: "2023-01-01" }] },
    //     // ])
    // }, [])
    return (

        <div >
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: "5px" }}>
                <Input
                    placeholder='域名或IP,不能同时设置,多个目标以英文逗号分隔,目标过多请右侧设置'
                    style={{ width: "600px" }}
                    size="small"
                    allowClear
                    suffix={<Space.Compact block>
                        <Button type='text' size="small" icon={<SearchOutlined />} onClick={preQuery} />
                        {/* <Tooltip title='帮助信息'>
                            <Button type='text' size="small" icon={<QuestionOutlined />} />
                        </Tooltip> */}
                    </Space.Compact>}
                    value={input}
                    onPressEnter={preQuery}
                    onChange={(e) => setInput(e.target.value)}
                />
                <MultipleTargetModal />
            </div>
            <div
                style={{ display: 'flex', justifyContent: "center",
                    // width: '100%',
                    color: "red", height: "30px", margin: "3px" }}
            >
                {
                    wornning && <span style={{ display: 'flex', justifyContent: "center", width: '100%', color: "red" }}>{wornning}</span>
                }
                {
                    loading && <Button type="link" size='small' icon={<Spin size='small' spinning={true} />} onClick={() => running.current = false}>点击终止</Button>
                }

            </div>
            <div style={{ display: 'flex', alignItems: "center", flexDirection: "column", justifyContent: "center", width: '100%' }}>
                {
                    mode == "domain2ips" && <div style={{ width: "500px" }}>
                        <WindowScroller>
                            {({ height }) => (
                                <List
                                    height={height - 160}
                                    width={500}
                                    rowCount={ips?ips.length:0}
                                    rowHeight={rowHeight}
                                    rowRenderer={
                                        ({ index, key, style }: any) => {
                                            const item = ips?.[index]
                                            return (
                                                <div key={key} style={{
                                                    ...style, height: rowHeight - 10, display: 'flex', flexDirection: "column", border: "solid 1px #f0f0f0", borderRadius: "5px", padding: "5px",
                                                }}>
                                                    <span style={{ fontWeight: 'bold' }}>{item?.domain}</span>
                                                    <Divider style={{ margin: "3px 0 3px 0" }} />
                                                    {
                                                        item?.msg ? <div style={{ height: "100%", color: "red", display: "flex", alignItems: "center", justifyContent: "center" }}>{item.msg}</div> :
                                                            <AntdList
                                                                style={{ overflowY: "auto" }}
                                                                dataSource={item?.current}
                                                                split={false}
                                                                size='small'
                                                                locale={{
                                                                    emptyText: <div style={{ height: "60px" }}><Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /></div>
                                                                }}
                                                                renderItem={(item, i) => (
                                                                    <AntdList.Item>
                                                                        <span style={{ width: "100%" }}>
                                                                            <span style={{ float: 'left' }}><Copy title={'点击复制'} placement={"bottom"} text={item.ip} >{item.ip}</Copy>
                                                                            </span> <span style={{ float: 'right' }}>{item.locationOrDate}</span>
                                                                        </span>
                                                                    </AntdList.Item>
                                                                )}
                                                            >
                                                            </AntdList>
                                                    }
                                                </div>
                                            );
                                        }
                                    }
                                />
                            )}
                        </WindowScroller>
                    </div>
                }
                {
                    mode == "ip2domains" && <div>
                        <WindowScroller>
                            {({ height }) => (
                                <List
                                    // className={styles.List}
                                    height={height - 160}
                                    width={500}
                                    rowCount={domains?.length || 0}
                                    rowHeight={rowHeight}
                                    rowRenderer={
                                        ({ index, key, style }: any) => {
                                            const item = domains?.[index]||{
                                                ip:""
                                            }
                                            return (
                                                <div key={key} style={style}>
                                                    <div style={{
                                                        height: rowHeight - 10, display: 'flex', flexDirection: "column", border: "solid 1px #f0f0f0", borderRadius: "5px", padding: "5px",
                                                    }}>
                                                        <span style={{ fontWeight: 'bold' }}>{item.ip}</span>
                                                        <Divider style={{ margin: "3px 0 3px 0" }} />
                                                        <AntdList
                                                            style={{ overflowY: "auto" }}
                                                            size='small'
                                                            dataSource={item.current}
                                                            split={false}
                                                            locale={{
                                                                emptyText: <div style={{ height: "60px" }}><Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /></div>
                                                            }}
                                                            renderItem={(item, index) => (
                                                                <AntdList.Item>
                                                                    <span style={{ width: "100%" }}>
                                                                        <span style={{ float: 'left' }}><Copy title={'点击复制'} placement={"bottom"} text={item.domain}>{item.domain}</Copy></span>
                                                                        <span style={{ float: 'right' }}>{item.date}</span>
                                                                    </span>
                                                                </AntdList.Item>
                                                            )}
                                                        >
                                                        </AntdList>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    }
                                />
                            )}
                        </WindowScroller>
                    </div>
                }
                {
                    mode == "" && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                }
            </div >
        </div>
    )
}

const IP138: React.FC = () => {
    const [items, setItems] = useState<TabType[]>([]);
    const [activeKey, setActiveKey] = useState<string>(items[0]?.label);
    const newTabIndex = useRef(1);

    useEffect(() => {
        const newActiveKey = `${newTabIndex.current++}`;
        setItems([
            {
                label: newActiveKey,
                key: newActiveKey,
                children: <IP138Content />,
            }
        ],)
    }, [])

    const onChange = (key: string) => {
        setActiveKey(key);
    };

    const add = () => {
        const newActiveKey = `${newTabIndex.current++}`;
        setItems([...items, {
            label: newActiveKey,
            key: newActiveKey,
            children: <IP138Content />,
        }]);
        setActiveKey(newActiveKey);
    };

    const remove = (targetKey: TargetKey) => {
        const targetIndex = items.findIndex((pane) => pane.key === targetKey);
        const newPanes = items.filter((pane) => pane.key !== targetKey);
        if (newPanes.length && targetKey === activeKey) {
            const { key } = newPanes[targetIndex === newPanes.length ? targetIndex - 1 : targetIndex];
            setActiveKey(key);
        }
        setItems(newPanes);
    };

    const onEdit = (targetKey: TargetKey, action: 'add' | 'remove') => {
        if (action === 'add') {
            add();
        } else {
            remove(targetKey);
        }
    };

    return (
        <div>
            <Tabs
                size="small"
                onChange={onChange}
                activeKey={activeKey}
                type="editable-card"
                // tabBarExtraContent={}
                onEdit={onEdit}
                items={items}
            />
        </div>
    );
}

// const IP138: React.FC = () => {
//     return (
//         <div>
//            123123123
//         </div>
//     );
// }

export default IP138