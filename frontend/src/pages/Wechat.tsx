import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, ConfigProvider, Flex, List, Popconfirm, Popover, Space, Splitter, Tag, Tooltip, Tabs, Modal, Checkbox, Input, message, App } from "antd";
import { CloseOutlined, DeleteOutlined, FileTextOutlined, FileZipOutlined, FolderOpenOutlined, PlusOutlined } from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import "@/pages/Wechat.css";
import { EventsOn } from "../../wailsjs/runtime";
import { config, event, matcher, wechat } from "../../wailsjs/go/models";
import { errorNotification } from "@/component/Notification";
import {
    AddWechatRules,
    AutoDecompile,
    ClearApplet,
    ClearDecompiled,
    Decompile,
    DeleteWechatRules,
    EnableBeauty,
    GetMatchedString,
    GetWechatRules,
    SetAppletPath,
    UpdateWechatRule,
} from "../../wailsjs/go/wechat/Bridge";
import { DecompileIcon } from "@/component/Icon";
import { useDispatch, useSelector } from "react-redux";
import { appActions, RootState } from "@/store/store";
import { Join } from "../../wailsjs/go/osoperation/Path";
import { OpenFolder, } from "../../wailsjs/go/osoperation/Runtime";
import { copy } from "@/util/util";
import DirectorySelector from "@/component/DirectorySelector";
import InfoToFront = wechat.InfoToFront;
import VersionTaskStatus = wechat.VersionTaskStatus;
import { AgGridReact, CustomTooltipProps } from "ag-grid-react";
import { AGGridCommonOptionsNoCopy } from "./Props";
import { CellValueChangedEvent, ColDef, GetRowIdParams, ICellRendererParams, ValueFormatterParams } from "ag-grid-enterprise";
import { WithIndex } from "@/component/Interface";
import Label from "@/component/Label";
import { Editor } from "@monaco-editor/react";
import { MonacoEditorProps } from "@/config/monaco";

type PageDataType = WithIndex<matcher.Rule>

interface RuleModalProps {
    onRulesChange?: () => void;
}

const RuleModal: React.FC<RuleModalProps> = ({ onRulesChange }) => {
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [data, setData] = useState<PageDataType[]>([]);
    const [selectedRule, setSelectedRule] = useState<matcher.Rule | null>(null);
    const [editOpen, setEditOpen] = useState<boolean>(false);
    const gridRef = useRef<AgGridReact>(null)
    const [colDefs] = useState<ColDef[]>([
        { field: "index", headerName: "序号", width: 80 },
        { field: "Name", headerName: "名称", flex: 1 },
        { field: "Enable", headerName: "启用", editable: true, width: 80 },
        {
            field: "Regexes", headerName: "正则", width: 80,
            valueFormatter: (params: ValueFormatterParams) => params.value?.length || 0,
            tooltipField: "Regexes",
            tooltipComponent: (params: CustomTooltipProps) => {
                if (params.value) {
                    return <pre style={{
                        padding: "10px",
                        borderRadius: '5px',
                        boxShadow: 'rgba(0,0,0, 0.3) 0px 5px 30px', // 添加边框阴影
                        backgroundColor: 'rgba(255, 255, 255,1)', /* 设置背景颜色和透明度 */
                        maxHeight: '400px',
                        maxWidth: '1000px',
                        overflow: 'auto',
                    }}>
                        <code>{params.value.join("\n")}</code>
                    </pre>
                }
            },
        },
        {
            field: "Action", headerName: "操作", width: 130,
            cellRenderer: (params: ICellRendererParams) => {
                return <Space.Compact>
                    <Button type="primary" size="small" onClick={() => {
                        setSelectedRule(params.data);
                        setEditOpen(true);
                    }}>编辑</Button>
                    <Button type="primary" size="small" onClick={() => {
                        remove(params.data.ID);
                    }} disabled={params.data.ID < 100}>删除</Button>
                </Space.Compact>
            },
        },
    ])

    const remove = (id: string) => {
        DeleteWechatRules(Number(id)).then(
            () => {
                GetWechatRules().then((r) => {
                    const t = r.map((item, index) => ({
                        ...item,
                        index: index + 1
                    }));
                    setData(t);
                })
                onRulesChange?.();
            }
        ).catch(
            err => errorNotification("错误", err)
        )
    }

    const handleSave = () => {
        if (!selectedRule) return;
        if (selectedRule.ID) {
            // 更新
            UpdateWechatRule(selectedRule).then(() => {
                GetWechatRules().then((r) => {
                    const t = r.map((item, index) => ({
                        ...item,
                        index: index + 1
                    }));
                    setData(t);
                    setEditOpen(false);
                    setSelectedRule(null);
                });
            }).catch(err => {
                errorNotification("错误", err);
            });
        } else {
            // 新增
            AddWechatRules(selectedRule).then((id) => {
                GetWechatRules().then((r) => {
                    const t = r.map((item, index) => ({
                        ...item,
                        index: index + 1
                    }));
                    setData(t);
                    setEditOpen(false);
                    setSelectedRule(null);
                });
                onRulesChange?.();
            }).catch((err) => {
                errorNotification("错误", err);
            });
        }
    };

    const onCellValueChanged = (event: CellValueChangedEvent) => {
        // 更新
        UpdateWechatRule(event.data).catch(err => {
            errorNotification("错误", err);
        });
    }

    const getRowId = useCallback(
        (params: GetRowIdParams) => String(params.data.ID),
        [],
    );

    return (
        <>
            <Button size={"small"} onClick={() => {
                setModalOpen(true);
            }}>
                信息提取规则
            </Button>
            <Modal
                closeIcon={false}
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                onOk={() => setModalOpen(false)}
                width={600}
                styles={{
                    body: {
                        height: 400,
                    },
                }}
                footer={null}
                afterOpenChange={(open) => {
                    if (open) {
                        GetWechatRules().then((r) => {
                            const t = r.map((item, index) => ({
                                ...item,
                                index: index + 1
                            }));
                            setData(t);
                        })
                    }
                }}
            >
                <Flex vertical gap={5} style={{ height: "100%", width: "100%" }}>
                    <span><Button
                        size="small"
                        type="primary"
                        onClick={() => {
                            setSelectedRule({
                                ID: 0,
                                Name: "",
                                Enable: true,
                                Regexes: []
                            });
                            setEditOpen(true);
                        }}
                    >
                        新增规则
                    </Button></span>
                    <div style={{ flex: 1, height: "100%" }}>
                        <AgGridReact
                            {...AGGridCommonOptionsNoCopy}
                            ref={gridRef}
                            rowData={data}
                            cellSelection={false}
                            columnDefs={colDefs}
                            popupParent={document.querySelector("body")}
                            onCellValueChanged={onCellValueChanged}
                            getRowId={getRowId}
                        />
                    </div>
                </Flex>
            </Modal>
            <Modal
                closeIcon={false}
                maskClosable={false}
                mask={false}
                open={editOpen}
                onCancel={() => {
                    setEditOpen(false);
                    setSelectedRule(null);
                }}
                onOk={handleSave}
                width={1000}
                styles={{
                    body: {
                        height: "400px",
                    },
                }}
                okText={selectedRule?.ID ? "保存" : "新增"}
                title={selectedRule?.ID ? "编辑规则" : "新增规则"}
            >
                <Flex vertical gap={5} style={{ height: "100%" }}>
                    <Label labelWidth={40} label="启用" value={<Checkbox checked={selectedRule?.Enable} onChange={(e) => {
                        setSelectedRule(prev => prev ? { ...prev, Enable: e.target.checked } : null);
                    }} />} />
                    <Label labelWidth={40} label="名称" value={<Input value={selectedRule?.Name} onChange={(e) => {
                        setSelectedRule(prev => prev ? { ...prev, Name: e.target.value } : null);
                    }} />} />
                    <Label labelWidth={40} label="正则" style={{ height: "100%" }} value={
                        <Flex vertical gap={5} style={{ height: "100%", width: "100%" }}>
                            <div style={{ height: "100%" }}>
                                <Editor
                                    {...MonacoEditorProps}
                                    value={selectedRule?.Regexes?.join("\n")} onChange={(v) => {
                                        setSelectedRule(prev => prev ? { ...prev, Regexes: v?.split("\n") || [] } : null);
                                    }}
                                />
                            </div>
                            <div style={{ color: "#ff4d4f", fontSize: "12px", fontWeight: "bold" }}>正则表达式必须用双引号包裹，每行一个</div>
                        </Flex>
                    } />
                </Flex>
            </Modal>
        </>
    )
}


interface TabData {
    key: string;
    label: string;
    value: string;
}


export const MiniProgram: React.FC = () => {
    const [data, setData] = useState<InfoToFront[]>([]);
    const [select, setSelect] = useState<{
        appid: string;
        version: string;
        nickname: string;
    }>();
    const [matchedResult, setMatchedResult] = useState<string>("");
    const appIdRef = useRef<string>("");
    const versionRef = useRef<string>("");
    const dispatch = useDispatch();
    const cfg = useSelector(
        (state: RootState) => state.app.global.config || new config.Config()
    );
    const event = useSelector((state: RootState) => state.app.global.event);
    const status = useSelector((state: RootState) => state.app.global.status);
    const [tabs, setTabs] = useState<TabData[]>([]);

    useEffect(() => {
        GetWechatRules().then((r) => {
            const tabs = r.map((item) => ({
                key: String(item.ID),
                label: `${item.Name} (0)`,
                value: "",
            }))
            setTabs(tabs);
        });


        EventsOn(event.DecompileWxMiniAPP, (eventDetail: event.EventDetail) => {
            console.log(eventDetail);
            if (
                eventDetail.Status === status.Running ||
                eventDetail.Status === status.Stopped
            ) {
                const index = data.findIndex(
                    (item: InfoToFront) => item.AppID === eventDetail.Data.AppID
                );
                if (index !== -1) {
                    const index2 = data[index].Versions.findIndex(
                        (item: VersionTaskStatus) =>
                            item.Number === eventDetail.Data.Version
                    );
                    if (index2 !== -1) {
                        data[index].Versions[index2].Message = eventDetail.Message;
                    }
                }
                if (eventDetail.Status === status.Stopped) {
                    if (
                        eventDetail.Data.Appid !== appIdRef.current ||
                        eventDetail.Data.Version !== versionRef.current
                    ) {
                        return;
                    }
                    GetMatchedString(
                        eventDetail.Data.AppID,
                        eventDetail.Data.Version
                    ).then((r) => {
                        setMatchedResult(r?.join("\n"));
                    });
                }
            } else if (eventDetail.Status === status.Error) {
                const index = data.findIndex(
                    (item: InfoToFront) => item.AppID === eventDetail.Data.AppID
                );
                if (index !== -1) {
                    const index2 = data[index].Versions.findIndex(
                        (item: VersionTaskStatus) =>
                            item.Number === eventDetail.Data.Version
                    );
                    if (index2 !== -1) {
                        data[index].Versions[index2].Message = eventDetail.Error;
                    }
                }
            }
        });

        EventsOn(
            event.DecompileWxMiniAPPTicker,
            (eventDetail: event.EventDetail) => {
                setData(eventDetail.Data);
            }
        );
        EventsOn(
            event.DecompileWxMiniAPPInfoTicker,
            (eventDetail: event.EventDetail) => {
                const info = eventDetail.Data;
                setData((prevState) => {
                    prevState.forEach((item) => {
                        if (item.AppID === info.AppID) {
                            item.Info = info;
                        }
                    });
                    return prevState;
                });
            }
        );
    }, []);


    // 更新某个 textarea 的内容
    const updateTabContent = (key: string, newContent: string) => {
        setTabs((prevTabs) =>
            prevTabs.map((tab) =>
                tab.key === key ? { ...tab, content: newContent } : tab
            )
        );
    };

    const onSelect = (dir: string) => {
        if (dir) {
            SetAppletPath(dir)
                .then(() => {
                    const tt = {
                        ...cfg,
                        Wechat: { ...cfg.Wechat, Applet: dir },
                    } as config.Config;
                    dispatch(appActions.setConfig(tt));
                })
                .catch((e) => {
                    errorNotification("错误", e);
                });
        }
    };

    const getMatchedString = (appid: string, version: string) => {
        if (!appid || !version) {
            return;
        }
        GetMatchedString(
            appid,
            version
        ).then((r) => {
            const newTabs = [...tabs];
            // 先清空所有tab的value
            newTabs.forEach(tab => {
                tab.value = '';
                tab.label = `${tab.label.split('(')[0]}(0)`;
            });

            // 按ID分组合并Matches
            const groupedResults = r?.reduce((acc, result) => {
                const id = String(result.Rule?.ID);
                if (!acc[id]) {
                    acc[id] = [];
                }
                acc[id].push(...result.Matches);
                return acc;
            }, {} as Record<string, string[]>);

            // 设置合并后的结果
            Object.entries(groupedResults || {}).forEach(([id, matches]) => {
                const tabIndex = newTabs.findIndex(tab => tab.key === id);
                if (tabIndex !== -1) {
                    // 去重
                    const uniqueMatches = [...new Set(matches)];
                    newTabs[tabIndex].value = uniqueMatches.join('\n');
                    newTabs[tabIndex].label = `${newTabs[tabIndex].label.split('(')[0]}(${uniqueMatches.length})`;
                }
            });
            setTabs(newTabs);
        })
    }

    return (
        <Flex
            vertical
            style={{
                padding: "5px",
                height: "100%",
                boxSizing: "border-box",
            }}
            gap={10}
        >
            <Flex vertical gap={5} align={"center"} justify={"center"}>
                <DirectorySelector
                    label={"微信Applet路径"}
                    inputWidth={600}
                    value={cfg.Wechat.Applet}
                    onSelect={onSelect}
                />
                <Flex gap={15}>
                    <Space.Compact style={{ justifyContent: "center" }}>
                        <Popconfirm
                            placement="bottom"
                            title={"删除"}
                            description={
                                <>
                                    确认删除Applet目录下的所有文件吗?
                                    <br />
                                    (会同时删除反编译后的所有文件)
                                </>
                            }
                            okText="Yes"
                            cancelText="No"
                            onConfirm={() => {
                                ClearApplet()
                                    .then(() => {
                                        // setTreeData([])
                                    })
                                    .catch((err) => errorNotification("错误", err));
                            }}
                        >
                            <Button size={"small"}>清空Applet目录</Button>
                        </Popconfirm>
                        <Popconfirm
                            placement="bottom"
                            title={"删除"}
                            description={"确认删除所有反编译后的文件吗?"}
                            okText="Yes"
                            cancelText="No"
                            onConfirm={() => {
                                ClearDecompiled()
                                    .catch((err) => errorNotification("错误", err))
                                    .then(() => {
                                        // setTreeData([])
                                    });
                            }}
                        >
                            <Button size={"small"}>清空反编译后的文件</Button>
                        </Popconfirm>
                        <RuleModal onRulesChange={() => {
                            GetWechatRules().then((r) => {
                                setTabs(prevTabs => {
                                    const newTabs = r.map(item => {
                                        // 查找已存在的tab
                                        const existingTab = prevTabs.find(t => t.key === String(item.ID));
                                        return {
                                            key: String(item.ID),
                                            label: `${item.Name} (${existingTab?.label?.split('(')[1]?.split(')')[0] || '0'})`,
                                            value: existingTab?.value || "",
                                        };
                                    });
                                    return newTabs;
                                });
                            });
                        }} />
                    </Space.Compact>
                    <Tooltip title="启用与否都会自动获取最新小程序列表,启用则会自动执行反编译否则需要手动点击对应版本的反编译按钮" placement="bottom">
                        <Checkbox
                            onChange={(e) => {
                                AutoDecompile(e.target.checked);
                            }}
                        >
                            <span>自动反编译</span>
                        </Checkbox>
                    </Tooltip>
                    <Tooltip title="启用会导致耗时、CPU和内存飙升" placement="bottom">
                        <Checkbox
                            onChange={(e) => {
                                EnableBeauty(e.target.checked);
                            }}
                        >
                            <span>文件内容美化</span>
                        </Checkbox>
                    </Tooltip>
                </Flex>
                建议先执行清空Applet目录以避免无法回溯是哪个小程序
            </Flex>
            <Splitter style={{ overflow: "hidden" }}>
                <Splitter.Panel min={"15%"} defaultSize={"35%"}>
                    <ConfigProvider
                        theme={{
                            components: {
                                List: {
                                    titleMarginBottom: 5,
                                    metaMarginBottom: 0,
                                },
                            },
                        }}
                    >
                        <List
                            style={{ overflowY: "auto" }}
                            itemLayout="vertical"
                            dataSource={data}
                            renderItem={(item) => {
                                return (
                                    <List.Item key={item.AppID}>
                                        <Flex vertical gap={5}>
                                            <Flex gap={5}>
                                                <Tag color={"cyan"} bordered={false}>
                                                    <span style={{ fontWeight: "bold" }}>
                                                        {item.AppID}
                                                    </span>
                                                </Tag>
                                                <Tag color={"orange"} bordered={false}>
                                                    <span style={{ fontWeight: "bold" }}>
                                                        {item.UpdateDate}
                                                    </span>
                                                </Tag>
                                            </Flex>
                                            <Flex vertical gap={5}>
                                                <Flex>
                                                    {item.Info?.Nickname && (
                                                        <>
                                                            {" "}
                                                            <Flex>
                                                                <Tag
                                                                    title={item.Info.Nickname}
                                                                    bordered={false}
                                                                    color="red"
                                                                    style={{
                                                                        whiteSpace: "nowrap",
                                                                        textOverflow: "ellipsis",
                                                                        overflow: "hidden",
                                                                    }}
                                                                >
                                                                    {item.Info.Nickname}
                                                                </Tag>
                                                            </Flex>
                                                        </>
                                                    )}
                                                    {item.Info?.Username && (
                                                        <>
                                                            <Tag bordered={false} color="cyan">
                                                                {item.Info.Username}
                                                            </Tag>
                                                        </>
                                                    )}
                                                </Flex>
                                                {item.Versions?.map((i) => {
                                                    return (
                                                        <Flex
                                                            gap={5}
                                                            key={`${item.AppID}-${i.Number}`}
                                                            align={"center"}
                                                        >
                                                            <Tag
                                                                bordered={false}
                                                                color={
                                                                    i.DecompileStatus === status.Stopped
                                                                        ? "#096dd9"
                                                                        : "#595959"
                                                                }
                                                            >
                                                                <FileZipOutlined />
                                                                {i.Number}
                                                            </Tag>
                                                            <Space.Compact size={"small"}>
                                                                <Tooltip title={"反编译"}>
                                                                    <Button
                                                                        disabled={
                                                                            i.DecompileStatus === status.Running ||
                                                                            i.MatchStatus === status.Running
                                                                        }
                                                                        icon={
                                                                            <DecompileIcon
                                                                                spin={
                                                                                    i.DecompileStatus === status.Running
                                                                                }
                                                                                style={{ fontSize: "12px" }}
                                                                            />
                                                                        }
                                                                        onClick={() => {
                                                                            if (select?.appid === item.AppID && select?.version === i.Number) {
                                                                                const newTabs = [...tabs];
                                                                                newTabs.forEach(tab => {
                                                                                    tab.value = '';
                                                                                    tab.label = `${tab.label.split('(')[0]}(0)`;
                                                                                });
                                                                                setTabs(newTabs);
                                                                            }
                                                                            Decompile(
                                                                                new wechat.InfoToFront({
                                                                                    AppID: item.AppID,
                                                                                    Versions: item.Versions,
                                                                                })
                                                                            );
                                                                        }}
                                                                    />
                                                                </Tooltip>
                                                                <Tooltip title={"打开数据文件夹"}>
                                                                    <Button
                                                                        disabled={
                                                                            i.DecompileStatus !== status.Stopped
                                                                        }
                                                                        icon={<FolderOpenOutlined />}
                                                                        onClick={async () => {
                                                                            OpenFolder(
                                                                                await Join([
                                                                                    cfg.WechatDataDir,
                                                                                    item.AppID,
                                                                                    i.Number,
                                                                                ])
                                                                            );
                                                                        }}
                                                                    />
                                                                </Tooltip>
                                                                <Tooltip title={"敏感信息"}>
                                                                    <Button
                                                                        disabled={i.MatchStatus !== status.Stopped}
                                                                        icon={<FileTextOutlined />}
                                                                        onClick={async () => {
                                                                            setSelect({
                                                                                appid: item.AppID,
                                                                                version: i.Number,
                                                                                nickname: item.Info?.Nickname || "",
                                                                            });
                                                                            getMatchedString(item.AppID, i.Number);
                                                                        }}
                                                                    />
                                                                </Tooltip>
                                                            </Space.Compact>
                                                            {i.Message && (
                                                                <span
                                                                    style={{ color: "#8c8c8c", fontSize: "12px" }}
                                                                >
                                                                    {i.Message}
                                                                </span>
                                                            )}
                                                        </Flex>
                                                    );
                                                })}
                                                <span style={{ color: "gray", fontSize: "12px" }}>
                                                    {item.Info?.Description}
                                                </span>
                                            </Flex>
                                        </Flex>
                                    </List.Item>
                                );
                            }}
                        />
                    </ConfigProvider>
                </Splitter.Panel>
                <Splitter.Panel min={"15%"}>
                    <Flex vertical gap={5} style={{ height: "100%", marginLeft: '10px', overflow: "hidden" }}>
                        <Flex>
                            {select?.appid && (
                                <Flex>
                                    <Tag bordered={false} color={"orange"}>
                                        {select?.appid} {select?.version}
                                    </Tag>
                                </Flex>
                            )}
                            {select?.nickname && (
                                <Flex>
                                    <Tag bordered={false} color={"orange"}>
                                        {select.nickname}
                                    </Tag>
                                </Flex>
                            )}
                        </Flex>
                        <Tabs style={{ height: "100%" }}
                            items={tabs.map((tab) => ({
                                key: tab.key,
                                label: tab.label,
                                children: <div style={{ height: "100%", position: "relative", padding: "10px", boxSizing: "border-box", overflow: "hidden" }}>
                                    <Editor
                                        {...MonacoEditorProps}
                                        value={tab.value}
                                        onChange={(v) => updateTabContent(tab.key, v || "")}
                                    />
                                </div>
                                ,
                            }))}
                        />
                    </Flex>
                </Splitter.Panel>
            </Splitter>
        </Flex >
    );
};

export default MiniProgram;