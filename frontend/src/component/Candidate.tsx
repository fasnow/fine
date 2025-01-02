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
    Empty,
    InputProps,
    Button,
    Space,
    InputRef,
    GetProp,
    SelectProps,
    Tag,
    List,
    ConfigProvider
} from "antd";
import { errorNotification } from "@/component/Notification";
import {SearchProps} from "antd/es/input";
import {SearchOutlined, CaretDownOutlined} from "@ant-design/icons";
import {SizeType} from "antd/es/config-provider/SizeContext";
import {prop} from "cheerio/lib/api/attributes";
import {is} from "cheerio/lib/api/traversing";

// 定义ItemType类型，更明确key的类型为string（可根据实际情况调整类型）
export type ItemType = {
    value: string|number;
    label: React.ReactNode;
    data:any
};

interface BasePanelType{
    fetchOnOpen?:((items: ItemType[]) =>boolean) | boolean,
    value?:string|number
    title?:string
    fetch?: ((value: string|number) => ItemType[] | Promise<ItemType[]>) | undefined;
    filter?: (value: string|number) => boolean;
    onSelectItem?: (item: ItemType) =>void;
}

const Panel =React.memo(React.forwardRef<any,BasePanelType>((props, ref) => {
    // 使用useState来管理当前选中项的key，初始值可以设为null，表示没有选中项
    const [selectedKey, setSelectedKey] = useState<string | number | null>(null);
    const [loading, setLoading] = useState(false);
    const [candidates, setCandidates] = useState<ItemType[]>([]);

    useEffect(()=>{
        props.value !== undefined && fetchItems(props.value)
    }, [props.value])

    useImperativeHandle(ref, () => ({
        fetch: (v:string|number) => fetchItems(v),
        fetchOnOpen:()=>{
            if (props.fetchOnOpen instanceof Function){
                return  props.fetchOnOpen(candidates)
            }
            return props.fetchOnOpen
        }
    }));

    const fetchItems=(v:string|number)=>{
        if (!props.fetch)return;
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

    const handleMouseOver = (key: string|number) => {
        setSelectedKey(key);
    };

    return (
        <>
            {
                props.title &&
                <Tag bordered={false} color="cyan">{props.title}</Tag>
            }
            {
                loading? (
                    <Spin spinning={true} style={{ display: "flex", justifyContent: 'center', alignItems: 'center'}} />
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
                            style={{maxHeight:200}}
                            renderItem={(item, index)=>{
                                const isSelected = item.value === selectedKey;
                                return <List.Item key={index} style={{overflow:'hidden'}}>
                                    <span
                                        onMouseOver={() => handleMouseOver(item.value)}
                                        onClick={(e) => {
                                            if (props.onSelectItem) {
                                                props.onSelectItem(item)
                                            }
                                        }}
                                        style={{
                                            cursor: 'pointer',
                                            backgroundColor: isSelected? '#f0f0f0' : 'transparent',
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
        </>
    );
}));

export interface CandidateProps{
    items?: BasePanelType[];
    size?: SizeType;
    style?: CSSProperties;
    addonBefore?: ReactNode;
    onSearch?: SearchProps['onSearch'];
    allowClear?: boolean;
    onPressEnter?: (value: string) => void;
    value?: string;
    onChange?: InputProps['onChange'];
    placeholder?: InputProps['placeholder']
}

const Candidate: React.FC<CandidateProps> = React.memo((props) => {
    const [localValue, setLocalValue] = useState<string | number>(props.value || "");
    const valueRef = useRef<string|number>("")
    const [isComposing, setIsComposing] = useState(false);
    const rootDivRef = useRef<HTMLDivElement>(null);
    const itemsDivRef = useRef<HTMLDivElement>(null);
    const inputDivRef = useRef<InputRef>(null);
    const [open, setOpen] = useState(false);
    const {items, onChange, onPressEnter,onSearch,...restProps} = props
    const refs = useRef<any[]>([])
    const index = useRef(0)
    const [value, setValue] = useState(localValue)

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
            if (itemsDiv?.contains(event.target as Node)){
                setOpen(false);
                return
            }
            //点击input后显示
            const inputDiv = inputDivRef.current;
            if (inputDiv?.input?.contains(event.target as Node)){
                setOpen(true)
                refs.current.forEach(ref=>{
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

    useEffect(()=>{
        setLocalValue(props.value || "")
    },[props.value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setLocalValue(newValue);
        if(!isComposing){
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

    const SharedProps:SearchProps = {
        ...restProps,
        onChange:handleChange,
        onCompositionStart:handleCompositionStart,
        onCompositionEnd:handleCompositionEnd,
        onPressEnter:(e)=>{
            if (onPressEnter){
                // setOpen(false)
                onPressEnter(value.toString())
            }
        },
        value: localValue
    }

    const panels = useMemo(()=>{
        return props.items?.map(item=>{
            const r = createRef()
            refs.current.push(r)
            return <Panel key={index.current++} ref={r} title={item.title} value={value} fetch={item.fetch}
                          onSelectItem={(t)=>{
                              setOpen(false)
                              setLocalValue(t.value || "")
                              setValue(t.value.toString() || "")
                              valueRef.current = t.value || ""
                              if (item.onSelectItem) {
                                  item.onSelectItem(t)
                              }
                          }}
                          filter={item.filter}
            />
        })
    },[value])

    return (
        <div ref={rootDivRef} style={{ position: "relative"}}>
            <Flex justify={'center'} align={'center'}>
                {
                    onSearch?<Space.Compact>
                        <Input
                            ref={inputDivRef}
                            {...SharedProps}
                        /><Button icon={<SearchOutlined/>} size={SharedProps.size} onClick={(e)=>{
                        console.log(value)
                            if (onSearch){
                            onSearch(value.toString())
                        }
                    }}/>
                    </Space.Compact>:<Input
                        ref={inputDivRef}
                        {...SharedProps}
                    />
                }
            </Flex>
            <div style={{
                position: 'absolute',
                width: '100%',
                backgroundColor: "#ffffff",
                zIndex: "1002",
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2), 0 8px 16px rgba(0, 0, 0, 0.1)',
                borderRadius: '3px',
                padding: '5px',
                overflowY: 'auto',
                display: open? 'block' : 'none'
            }}>
                {panels}
            </div>
        </div>
    );
});

export default Candidate;