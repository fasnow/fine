import React, { useState, useRef, useEffect } from "react";
import { Flex, Spin, Input, Empty } from "antd";
import { Suggest } from "../../wailsjs/go/tianyancha/Bridge";
import { errorNotification } from "@/component/Notification";

// 定义ItemType类型，更明确key的类型为string（可根据实际情况调整类型）
export type ItemType = {
    key: any;
    label: React.ReactNode;
};

export interface CandidateProps {
    items?: ((value: string) => ItemType[] | Promise<ItemType[]>) | undefined;
    onSearch?: (value: string) => void;
    filter?: (value: string) => boolean;
    onClick?: (item: ItemType) => void;
}

const Candidate: React.FC<CandidateProps> = (props) => {
    // 使用useState来管理当前选中项的key，初始值可以设为null，表示没有选中项
    const [selectedKey, setSelectedKey] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<ItemType[]>([]);
    const [value, setValue] = useState("");
    const valueRef = useRef("")
    const lengthRef = useRef(0)
    const [isComposing, setIsComposing] = useState(false);
    const rootDivRef = useRef<HTMLDivElement>(null); // 创建ref来获取根div元素
    const itemsDivRef = useRef<HTMLDivElement>(null); // 创建ref来获取根div元素
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            const rootDiv = rootDivRef.current;
            if (rootDiv && !rootDiv.contains(event.target as Node)) {
                setOpen(false);
                return;
            }
            const itemsDiv = itemsDivRef.current;
            if (itemsDiv && itemsDiv.contains(event.target as Node)){
                setOpen(false);
                return
            }
            setOpen(true)
            if (lengthRef.current === 0){
                fetch(valueRef.current)
            }
        };

        document.addEventListener('click', handleClick);

        return () => {
            document.removeEventListener('click', handleClick);
        };
    }, []);

    const handleMouseOver = (key: string) => {
        setSelectedKey(key);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setValue(newValue);
        valueRef.current = newValue
        if (!isComposing) {
            fetch(newValue);
        }
    };

    const handleCompositionStart = () => {
        // 输入法开始
        setIsComposing(true);
    };

    const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
        const newValue = e.currentTarget.value;
        // 输入法完成选词
        setIsComposing(false);
        setValue(newValue);
        valueRef.current = newValue
        fetch(newValue);
    };

    const fetch = (value: string) => {
        setItems([]);
        lengthRef.current = 0
        if (props.filter) {
            if (!props.filter(value)) return;
        }
        if (props.items) {
            setLoading(true);
            const result = props.items(value);
            if (result instanceof Promise) {
                result.then((newItems) => {
                    setItems(newItems);
                    lengthRef.current = newItems.length
                }).finally(() => {
                    setLoading(false);
                });
            } else {
                setItems(result);
                lengthRef.current = result.length
                setLoading(false);
            }
        }
    };

    return (
        <div ref={rootDivRef} style={{ position: "relative" }}>
            <Input size={"small"}
                          style={{ width: "400px" }}
                          value={value}
                          onChange={handleChange}
                          onCompositionStart={handleCompositionStart}
                          onCompositionEnd={handleCompositionEnd}
                          placeholder="输入内容"
                          // onSearch={() => { setOpen(false)}}
            />
            <div style={{
                position: 'absolute',
                width: '100%',
                backgroundColor: "#ffffff",
                zIndex: "1002",
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2), 0 8px 16px rgba(0, 0, 0, 0.1)',
                borderRadius: '3px',
                padding: '5px',
                maxHeight: '200px',
                overflowY: 'auto',
                display: open? 'block' : 'none'
            }}>
                {
                    loading? (
                        <Spin spinning={true} style={{ display: "flex", justifyContent: 'center', alignItems: 'center', height: "100px" }} />
                    ) : (
                        <Flex vertical ref={itemsDivRef}>
                            {items.length > 0?
                                items.map(item => {
                                    const isSelected = item.key === selectedKey;
                                    return (
                                        <span
                                            key={item.key}
                                            onMouseOver={() => handleMouseOver(item.key)}
                                            onClick={(e) => {
                                                setOpen(false)
                                                if(props.onClick){
                                                    props.onClick(item)
                                                }
                                            }}
                                            style={{
                                                cursor: 'pointer',
                                                backgroundColor: isSelected? '#f0f0f0' : 'transparent',
                                                padding: '5px',
                                                borderRadius: '3px'
                                            }}
                                        >
                                            {item.label}
                                        </span>
                                    );
                                }) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            }
                        </Flex>
                    )
                }
            </div>
        </div>
    );
};

export default Candidate;