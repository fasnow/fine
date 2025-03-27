import React, {
    useState,
    useRef,
    useEffect,
    CSSProperties,
    ReactNode,
    useImperativeHandle,
    createRef,
    useMemo
} from "react";
import {
    Flex,
    Spin,
    Input,
    InputProps,
    Button,
    Space,
    InputRef,
    Tag,
    List,
    ConfigProvider
} from "antd";
import { SearchProps } from "antd/es/input";
import { SearchOutlined } from "@ant-design/icons";
import { SizeType } from "antd/es/config-provider/SizeContext";

export interface ItemType<T> {
    value: string | number;
    label: React.ReactNode;
    data: T
}

interface BasePanelProps<T> {
    fetchOnOpen?: ((items: ItemType<T>[]) => boolean) | boolean,
    value?: string | number
    title?: string
    fetch?: ((value: string | number) => ItemType<T>[] | Promise<ItemType<T>[]>) | undefined;
    filter?: (value: string | number) => boolean;
    onSelectItem?: (item: ItemType<T>) => void;
}

const Panel = <T,>() => React.forwardRef<any, BasePanelProps<T>>((props, ref) => {
    const [selectedKey, setSelectedKey] = useState<string | number | null>(null);
    const [loading, setLoading] = useState(false);
    const [candidates, setCandidates] = useState<ItemType<T>[]>([]);

    useEffect(() => {
        props.value !== undefined && fetchItems(props.value)
    }, [props.value])

    useImperativeHandle(ref, () => ({
        fetch: (v: string | number) => fetchItems(v),
        fetchOnOpen: () => {
            if (props.fetchOnOpen instanceof Function) {
                return props.fetchOnOpen(candidates)
            }
            return props.fetchOnOpen
        }
    }));

    const fetchItems = (v: string | number) => {
        if (!props.fetch) return;
        if (props.filter) {
            if (!props.filter(v)) return;
        }
        setCandidates([]);
        setLoading(true);
        const result = props.fetch(v);
        if (result instanceof Promise) {
            result.then((newItems) => {
                setCandidates(newItems);
            }).finally(() => {
                setLoading(false);
            });
        } else {
            setCandidates(result);
            setLoading(false);
        }
    }

    const handleMouseOver = (key: string | number) => {
        setSelectedKey(key);
    };

    return (
        <div onMouseLeave={() => setSelectedKey(null)}>
            {
                props.title &&
                <Tag bordered={false} color="cyan">{props.title}</Tag>
            }
            {
                loading ? (
                    <Spin spinning={true}
                        style={{ display: "flex", justifyContent: 'center', alignItems: 'center' }} />
                ) : (
                    <ConfigProvider
                        theme={{
                            components: {
                                List: {
                                    itemPaddingSM: '0px'
                                },
                            },
                        }}
                    >
                        <List
                            dataSource={candidates}
                            size={"small"}
                            split={false}
                            style={{ maxHeight: 200 }}
                            renderItem={(item, index) => {
                                const isSelected = item.value === selectedKey;
                                return <List.Item key={index} style={{ overflow: 'hidden' }}>
                                    <span
                                        onMouseOver={() => handleMouseOver(item.value)}
                                        onClick={(e) => {
                                            if (props.onSelectItem) {
                                                props.onSelectItem(item)
                                            }
                                        }}
                                        style={{
                                            cursor: 'pointer',
                                            backgroundColor: isSelected ? '#f0f0f0' : 'transparent',
                                            padding: '5px',
                                            borderRadius: '3px',
                                            overflow: "hidden",
                                            whiteSpace: "nowrap",
                                            textOverflow: 'ellipsis',
                                            width: "100%",
                                        }}
                                    >
                                        {item.label}
                                    </span>
                                </List.Item>
                            }}
                        />
                    </ConfigProvider>
                )
            }
        </div>
    );
})

export interface CandidateProps<T> {
    items?: BasePanelProps<T>[];
    size?: SizeType;
    style?: CSSProperties;
    addonBefore?: ReactNode;
    onSearch?: SearchProps['onSearch'];
    allowClear?: boolean;
    onPressEnter?: (value: string) => void;
    value?: string;
    onChange?: InputProps['onChange'];
    placeholder?: InputProps['placeholder'];
    backFillDataOnSelectItem?: boolean
}

const Candidate = React.memo(<T,>(props: CandidateProps<T>) => {
    const [localValue, setLocalValue] = useState<string | number>(props.value || "");
    const valueRef = useRef<string | number>("")
    const [isComposing, setIsComposing] = useState(false);
    const rootDivRef = useRef<HTMLDivElement>(null);
    const itemsDivRef = useRef<HTMLDivElement>(null);
    const inputDivRef = useRef<InputRef>(null);
    const [open, setOpen] = useState(false);
    const { items, onChange, onPressEnter, onSearch, backFillDataOnSelectItem, ...restProps } = props
    const refs = useRef<any[]>([])
    const index = useRef(0)
    const [value, setValue] = useState(localValue)
    const f = useRef(backFillDataOnSelectItem === undefined ? true : backFillDataOnSelectItem)
    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            const rootDiv = rootDivRef.current;
            //失去焦点隐藏
            if (!rootDiv?.contains(event.target as Node)) {
                setOpen(false);
                return;
            }
            //点击item后隐藏
            const itemsDiv = itemsDivRef.current;
            if (itemsDiv?.contains(event.target as Node)) {
                setOpen(false);
                return
            }
            //点击input后显示
            const inputDiv = inputDivRef.current;
            if (inputDiv?.input?.contains(event.target as Node)) {
                setOpen(true)
                refs.current.forEach(ref => {
                    // if (ref.current && ref.current.fetchOnOpen()){
                    //     ref.current.fetch(valueRef.current)
                    // }
                })
                return;
            }
            //其他情况隐藏
            setOpen(false)
        };

        document.addEventListener('click', handleClick);

        return () => {
            document.removeEventListener('click', handleClick);
        };
    }, []);

    useEffect(() => {
        setLocalValue(props.value || "")
    }, [props.value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setLocalValue(newValue);
        if (!isComposing) {
            setValue(newValue)
        }
    };

    const handleCompositionStart = () => {
        // 输入法开始
        setIsComposing(true);
    };

    const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
        const newValue = e.currentTarget.value;
        setIsComposing(false);
        setLocalValue(newValue);
        setValue(newValue)
    };

    const SharedProps: SearchProps = {
        ...restProps,
        onChange: handleChange,
        onCompositionStart: handleCompositionStart,
        onCompositionEnd: handleCompositionEnd,
        onPressEnter: (e) => {
            if (onPressEnter) {
                // setOpen(false)
                onPressEnter(value.toString())
            }
        },
        value: localValue
    }

    const panels = useMemo(() => {
        return props.items?.map(item => {
            const r = createRef()
            refs.current.push(r)
            const A = Panel<T>()
            return <A key={index.current++} ref={r} title={item.title} value={value} fetch={item.fetch}
                onSelectItem={(t: ItemType<T>) => {
                    setOpen(false)
                    if (f.current) {
                        setLocalValue(t.value || "")
                        setValue(t.value.toString() || "")
                    }
                    valueRef.current = t.value || ""
                    if (item.onSelectItem) {
                        item.onSelectItem(t)
                    }
                }}
                filter={item.filter}
            />
        })
    }, [value])

    return (
        <div ref={rootDivRef} style={{ position: "relative" }}>
            <Flex justify={'center'} align={'center'}>
                {
                    onSearch ? <Space.Compact>
                        <Input
                            ref={inputDivRef}
                            {...SharedProps}
                        /><Button icon={<SearchOutlined />} size={SharedProps.size} onClick={(e) => {
                            if (onSearch) {
                                onSearch(value.toString())
                            }
                        }} />
                    </Space.Compact> : <Input
                        ref={inputDivRef}
                        {...SharedProps}
                    />
                }
            </Flex>
            <div style={{
                position: 'absolute',
                width: '100%',
                backgroundColor: "#ffffff",
                zIndex: "9999",
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2), 0 8px 16px rgba(0, 0, 0, 0.1)',
                borderRadius: '3px',
                padding: '5px',
                overflowY: 'auto',
                overflowX: 'hidden',
                display: open ? 'block' : 'none',
                boxSizing: 'border-box'
            }}>
                {panels}
            </div>
        </div>
    );
}) as <T>(props: CandidateProps<T>) => JSX.Element;

export default Candidate;