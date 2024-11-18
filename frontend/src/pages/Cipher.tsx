import {
    Button,
    Col, ConfigProvider,
    Flex, Input, List, Row,
    Select,
    Space,
    Splitter,
    Tree,
    TreeDataNode
} from "antd";
import {CssConfig} from "@/pages/Config";
import React, {CSSProperties, useEffect, useRef, useState} from "react";
import './Cipher.css'
import locale from "antd/locale/zh_CN";
import TextArea from "antd/es/input/TextArea";
import CryptoJS from "crypto-js"
import {isBase64} from "@/util/util";
import { SM2, SM3, SM4 } from 'gm-crypto';
import {Buffer} from "buffer";

namespace DataType{
    export const Base64 = "Base64"
    export const UTF_8 = "UTF-8"
    export const Hex = "Hex"
}

type ItemProps = {key:number;tab:any;tabContent:any;tabContentRef:any}

export const Cipher=()=>{
    const [items, setItems] = useState<any[]>([]);
    const [selectedItem, setSelectedItem] = useState<ItemProps>({
        key:-1,tab:<></>,tabContent:<></>,tabContentRef:null
    });
    const selectedItemRef = useRef<ItemProps>() //避免selectedItem更新不及时

    const i = useRef(0);

    const removeCryptor = (key: any) => {
        setItems((prevState) => prevState.filter(item => item.key !== key));
    };
    const getInput = () => {
        if (selectedItemRef && selectedItemRef.current) {
            return selectedItemRef.current.tabContentRef.current.getInput()
        }
        return ""
    };
    const setOutput = (data:string) => {
        if (selectedItemRef && selectedItemRef.current) {
            return selectedItemRef.current.tabContentRef.current.setOutput(data)
        }
        return ""
    };

    const addCryptor = (key: any) => {
        const tabContentRef = React.createRef();
        const index = i.current;
        let t
        let item:ItemProps
        if (key === "0-0") {
             t = <AES
                title={index+1+"-AES加解密"}
                input={getInput}
                onExitBtnClick={() => removeCryptor(index)}
                onResult={setOutput}
            />;
        }else if(key === "0-1"){
            t = <SM2V
                title={index+1+"-SM2加解密"}
                input={getInput}
                onExitBtnClick={() => removeCryptor(index)}
                onResult={setOutput}
            />;
        }else if(key === "0-2"){
            t = <DES
                title={index+1+"-DES加解密"}
                input={getInput}
                onExitBtnClick={() => removeCryptor(index)}
                onResult={setOutput}
            />;
        }
        item = {
            key:index,
            tab:t,
            tabContent:<DataView ref={tabContentRef} key={index}/>,
            tabContentRef:tabContentRef,
        }
        setItems(prevState => [...prevState, item]);
        setSelectedItem(item);
        i.current++;
    };

    const getItems = () => {
        return items; // 返回整个 item 对象，包括 key 和 children
    };
    const treeData: TreeDataNode[] = [
        {
            title: '加解密',
            key: '0',
            children: [
                {
                    key: '0-0',
                    title: <Button size={"small"} type={"text"} onClick={()=>addCryptor('0-0')}>AES</Button>,
                },
                {
                    key: '0-1',
                    title: <Button size={"small"} type={"text"} onClick={()=>addCryptor('0-1')}>SM2</Button>,
                },
                {
                    key: '0-2',
                    title: <Button size={"small"} type={"text"} onClick={()=>addCryptor('0-2')}>DES</Button>,
                },
            ],
        },
    ];

    return <ConfigProvider
        locale={locale}
        theme={{
            components: {
                Tree:{nodeSelectedBg:"#ffffff"}
            },
        }}
    >
        <Splitter style={{height:`calc(100vh - ${CssConfig.title.height} - ${CssConfig.tab.height})`}}>
            <Splitter.Panel defaultSize={'15%'}>
                <Tree
                    style={{height:"100%"}}
                    defaultExpandAll
                    treeData={treeData}
                />
            </Splitter.Panel>
            <Splitter>
                <Splitter>
                    <Splitter.Panel>
                        <List
                            size={"small"}
                            dataSource={getItems()}
                            renderItem={(item:ItemProps) => (
                                <List.Item
                                    // 父组件先获取事件设置选中项，更新selectedItem，不然会先执行加解密但是获得的selectedItem不是最新
                                    onClickCapture={(event) => {
                                        let target = event.target as HTMLElement;
                                        if (target.tagName === 'SPAN' ) {
                                            target = target.closest('button') as HTMLElement;
                                            if(target && target.id === 'close') {
                                                if(item.key===selectedItem.key){
                                                    setSelectedItem({key:-1,tab:null,tabContent:null,tabContentRef:null})
                                                    selectedItemRef.current = undefined
                                                }
                                                return;
                                            }
                                        }
                                        setSelectedItem(item)
                                        selectedItemRef.current = item
                                    }}
                                    style={{
                                        backgroundColor: selectedItem?.key === item.key ? '#f0f0f0' : 'transparent',
                                        boxShadow: selectedItem.key === item.key ? '0 4px 8px rgba(0, 0, 0, 0.1)' : 'none',
                                    }}
                                >
                                    {item.tab}
                                </List.Item>
                            )}
                        />
                    </Splitter.Panel>
                    <Splitter.Panel>
                        {
                            items.map((item) => (
                                <div style={{display:selectedItem.key===item.key?"block":"none",height:'100%'}} key={item.key}>
                                    {item.tabContent}
                                </div>

                            ))
                        }
                    </Splitter.Panel>

                </Splitter>
            </Splitter>
        </Splitter>
    </ConfigProvider>
}

const DataView=React.forwardRef((props, ref)=>{
    const [input,setInput] = useState("")
    const [output,setOutput] = useState("")
    React.useImperativeHandle(ref, () => ({
        setInput: (value:string) => setInput(value),
        setOutput: (value:string) => setOutput(value),
        getInput: () => input,
        getOutput: () => output,
    }));

    return <Splitter layout={"vertical"}><Splitter.Panel>
                <TextArea
                    value={input}
                    onChange={e=>setInput(e.target.value)}
                    style={{height:"100%"}}
                    placeholder={"输入"}/>
            </Splitter.Panel>
            <Splitter.Panel>
                <TextArea
                    value={output}
                    onChange={e=>setOutput(e.target.value)}
                    style={{height:"100%"}}
                    placeholder={"输出"}/>
            </Splitter.Panel>
        </Splitter>
})


const ColCssProps:CSSProperties={
    display:"inline-block",textAlign:"right",paddingRight:"5px"
}
const RowCssProps:CSSProperties={
    height:"26px"
}
type Props = {
    title?: string;
    input?: ()=>string;
    onExitBtnClick?:()=>void;
    onResult?:(result:any)=>void
}

export const AES:React.FC<Props>=(props:Props)=>{
    const [key,setKey] = useState("")
    const [iv,setIV] = useState("")
    const [mode,setMode] = useState(CryptoJS.mode.CBC)
    const [padding,setPadding] = useState(CryptoJS.pad.Pkcs7)
    const [inputDataType,setInputDataType] = useState(DataType.Base64)
    const [outputDataType,setOutputDataType] = useState(DataType.UTF_8)

    const encrypt=()=>{
        try {
            if(!props.input) return
            const plaintext = props.input()
            if(plaintext===""){
                return
            }
            let words
            if(inputDataType===DataType.Hex){
                words = CryptoJS.enc.Hex.parse(plaintext)
            }else if(inputDataType===DataType.Base64){
                if(!isBase64(plaintext)){
                    if(props.onResult){
                        return props.onResult("非法base64字符串")
                    }
                }
                words = CryptoJS.enc.Base64.parse(plaintext)
            }else if(inputDataType===DataType.UTF_8){
                words = CryptoJS.enc.Utf8.parse(plaintext)
            }
            if(!words){
                if(props.onResult){
                    return props.onResult("输入编码错误")
                }
                return
            }
            const k = CryptoJS.enc.Utf8.parse(key)
            const i = CryptoJS.enc.Utf8.parse(iv)
            const data = CryptoJS.AES.encrypt(words,k,{
                iv:i,
                mode:mode,
                padding:padding
            })
            let result
            if(outputDataType===DataType.Hex){
                result = CryptoJS.enc.Hex.stringify(data.ciphertext)
            }else if(outputDataType===DataType.Base64 || outputDataType===DataType.UTF_8){
                result = CryptoJS.enc.Base64.stringify(data.ciphertext)
            }
            if(props.onResult){
                if(result===""){
                    return props.onResult("加密失败")
                }else {
                    return props.onResult(result)
                }
            }
        }catch (e) {
            return props.onResult && props.onResult(e)
        }

    }

    const decrypt=()=>{
        try {
            if(!props.input) return
            const ciphertext = props.input()
            if(ciphertext===""){
                return
            }
            let words
            if(inputDataType===DataType.Hex){
                words = CryptoJS.enc.Hex.parse(ciphertext)
            }else if(inputDataType===DataType.Base64){
                if(!isBase64(ciphertext)){
                    if(props.onResult){
                        return props.onResult("非法base64字符串")
                    }
                }
                words = CryptoJS.enc.Base64.parse(ciphertext)
            }else if(inputDataType===DataType.UTF_8){
                words = CryptoJS.enc.Utf8.parse(ciphertext)
            }
            if(!words){
                if(props.onResult){
                    return props.onResult("输入编码错误")
                }
                return
            }
            const k = CryptoJS.enc.Utf8.parse(key)
            const i = CryptoJS.enc.Utf8.parse(iv)
            const data = CryptoJS.AES.decrypt(CryptoJS.enc.Base64.stringify(words),k,{
                iv:i,
                mode:mode,
                padding:padding
            })
            let result
            if(outputDataType===DataType.Hex){
                result = CryptoJS.enc.Hex.stringify(data)
            }else if(outputDataType===DataType.Base64){
                result = CryptoJS.enc.Base64.stringify(data)
            }else if(outputDataType===DataType.UTF_8){
                result = CryptoJS.enc.Utf8.stringify(data)
            }
            if(props.onResult){
                if(result===""){
                    return props.onResult("解密失败")
                }else {
                    return props.onResult(result)
                }
            }
        }catch (e) {
            return props.onResult && props.onResult(e)
        }
    }

    const handleModeChange=(value:string)=>{
        switch (value){
            case "CBC":
                setMode(CryptoJS.mode.CBC)
                break
            case "CFB":
                setMode(CryptoJS.mode.CFB)
                break
            case "CTR":
                setMode(CryptoJS.mode.CTR)
                break
            case "ECB":
                setMode(CryptoJS.mode.ECB)
                break
            case "OFB":
                setMode(CryptoJS.mode.OFB)
                break
            case "CTRGladman":
                setMode(CryptoJS.mode.CTRGladman)
                break
        }
    }

    const handlePaddingChange=(value:string)=>{
        switch (value){
            case "Pkcs7":
                setPadding(CryptoJS.pad.Pkcs7)
                break
            case "ZeroPadding":
                setPadding(CryptoJS.pad.ZeroPadding)
                break
            case "NoPadding":
                setPadding(CryptoJS.pad.NoPadding)
                break
            case "AnsiX923":
                setPadding(CryptoJS.pad.AnsiX923)
                break
            case "Iso10126":
                setPadding(CryptoJS.pad.Iso10126)
                break
            case "Iso97971":
                setPadding(CryptoJS.pad.Iso97971)
                break
        }
    }

    return <Flex vertical gap={2} style={{width:"100%",paddingBottom:"10px"}}>
        <Flex justify={"space-between"} style={{alignItems:'center',height:"24px"}}>
            {props.title}
            <Space.Compact>
                <Button size={"small"} onClick={encrypt}>加密</Button>
                <Button size={"small"} onClick={decrypt}>解密</Button>
                <Button size={"small"} id={"close"} onClick={(e)=> {
                    e.stopPropagation();// 防止选中项背景色状态消失
                    if(props.onExitBtnClick) {
                        props.onExitBtnClick()
                    }
                }}>关闭</Button>
            </Space.Compact>
        </Flex>
        <Flex vertical gap={1} style={{width:"100%"}}>
            <Row style={RowCssProps}>
                <Col span={3} style={ColCssProps}>key</Col>
                <Col span={21}><Input onChange={(e)=>{setKey(e.target.value)}} size={"small"} placeholder="128/192/256位,即16/24/32字节"/></Col>
            </Row>
            <Row style={RowCssProps}>
                <Col span={3} style={ColCssProps}>iv</Col>
                <Col span={21}><Input onChange={(e)=>{setIV(e.target.value)}} size={"small"} placeholder="16字节"/></Col>
            </Row>
            <Row style={RowCssProps}>
                <Col span={3} style={ColCssProps}>mode</Col>
                <Col span={8}><Select style={{width:"100%"}} size={"small"} defaultValue={"CBC"} onChange={handleModeChange} options={
                    [
                        {title:"CBC",value:"CBC"},
                        {title:"ECB",value:"ECB"},
                        {title:"OFB",value:"OFB"},
                        {title:"CFB",value:"CFB"},
                        {title:"CTR",value:"CTR"},
                        {title:"CTRGladman",value:"CTRGladman"},
                    ]
                }/></Col>
                <Col span={4} offset={2} style={ColCssProps}>padding</Col>
                <Col span={7} ><Select style={{width:"100%"}} size={"small"} defaultValue={"Pkcs7"} onChange={handlePaddingChange} options={
                    [
                        {title:"Pkcs7",value:'Pkcs7'},
                        {title:"ZeroPadding",value:"ZeroPadding"},
                        {title:"NoPadding",value:"NoPadding"},
                        {title:"AnsiX923",value:"AnsiX923"},
                        {title:"Iso10126",value:"Iso10126"},
                        {title:"Iso97971",value:"Iso97971"},
                    ]
                }/></Col>
            </Row>
            <Row style={RowCssProps}>
                <Col span={3} style={ColCssProps}>输入</Col>
                <Col span={8}><Select style={{width:"100%"}} size={"small"} defaultValue={inputDataType} onSelect={setInputDataType} options={
                    [
                        {title:"Base64",value:DataType.Base64},
                        {title:"UTF-8",value:DataType.UTF_8},
                        {title:"Hex",value:DataType.Hex},
                    ]
                }/></Col>
                <Col span={4} offset={2} style={ColCssProps}>输出</Col>
                <Col span={7}><Select style={{width:"100%"}} size={"small"}  defaultValue={outputDataType} onSelect={setOutputDataType} options={
                    [
                        {title:"Base64",value:DataType.Base64},
                        {title:"UTF-8",value:DataType.UTF_8},
                        {title:"Hex",value:DataType.Hex},
                    ]
                }/></Col>
            </Row>
        </Flex>
    </Flex>
}

export const SM2V:React.FC<Props>=(props:Props)=>{
    const [privateKey,setPrivateKey] = useState("")
    const [publicKey,setPublicKey] = useState("")
    const [mode,setMode] = useState(SM2.constants.C1C3C2) // 0 表示 C1C2C3，1 表示 C1C3C2
    const [inputDataType,setInputDataType] = useState(DataType.Base64)
    const [outputDataType,setOutputDataType] = useState(DataType.UTF_8)

    const encrypt=()=>{
        if(!props.input) return
        const plaintext = props.input()
        if(plaintext===""){
            return
        }
        let words
        if(inputDataType===DataType.Base64){
            if(!isBase64(plaintext)){
                if(props.onResult){
                    return props.onResult("非法base64字符串")
                }
            }
            words =  Buffer.from(plaintext,"base64")
        }else if(inputDataType===DataType.Hex){
            words =  Buffer.from(plaintext,"hex")
        }else if(inputDataType===DataType.UTF_8){
            words =  Buffer.from(plaintext,"utf-8")
        }
        if(!words){
            if(props.onResult){
                return props.onResult("输入编码错误")
            }
            return
        }
        let outputEncoding:BufferEncoding = "hex"
        if(outputDataType===DataType.UTF_8){
            outputEncoding = "utf-8"
        }else if(outputDataType===DataType.Base64){
            outputEncoding = "base64"
        }
        try {
            const data =  SM2.encrypt(words, publicKey, {
                mode: mode,
                outputEncoding:outputEncoding
            });
            if(props.onResult){
                return props.onResult(Buffer.from(data).toString('utf-8'))
            }
        }catch (e:any) {
            return props.onResult && props.onResult(e)
        }
    }

    const decrypt=()=>{
        if(!props.input) return
        const ciphertext = props.input()
        if(ciphertext===""){
            return
        }
        let words
        if(inputDataType===DataType.Base64){
            if(!isBase64(ciphertext)){
                if(props.onResult){
                    return props.onResult("非法base64字符串")
                }
            }
            words =  Buffer.from(ciphertext,"base64")
        }else if(inputDataType===DataType.Hex){
            words =  Buffer.from(ciphertext,"hex")
        }else if(inputDataType===DataType.UTF_8){
            words =  Buffer.from(ciphertext,"utf-8")
        }
        if(!words){
            if(props.onResult){
                return props.onResult("输入编码错误")
            }
            return
        }
        let outputEncoding:BufferEncoding = "hex"
        if(outputDataType===DataType.UTF_8){
            outputEncoding = "utf-8"
        }else if(outputDataType===DataType.Base64){
            outputEncoding = "base64"
        }
        try {
            const data =  SM2.decrypt(words, privateKey, {
                outputEncoding: outputEncoding,
                mode: mode,
            });
            if(props.onResult){
                return props.onResult(data)
            }
        }catch (e) {
            return props.onResult && props.onResult(e)
        }
    }

    const handleModeChange=(value:string)=>{
        switch (value){
            case "C1C2C3":
                setMode(SM2.constants.C1C2C3)
                break
            case "C1C3C2":
                setMode(SM2.constants.C1C3C2)
                break
        }
    }

    const genKeyPair=()=>{
        const a = SM2.generateKeyPair()
        setPrivateKey(a.privateKey)
        setPublicKey(a.publicKey)
    }


    return <Flex vertical gap={2} style={{width:"100%",paddingBottom:"10px"}}>
        <Flex justify={"space-between"} style={{alignItems:'center',height:"24px"}}>
            {props.title}
            <Space.Compact>
                <Button size={"small"} onClick={encrypt}>加密</Button>
                <Button size={"small"} onClick={decrypt}>解密</Button>
                <Button size={"small"} id={"close"} onClick={(e)=> {
                    e.stopPropagation();// 防止选中项背景色状态消失
                    if(props.onExitBtnClick) {
                        props.onExitBtnClick()
                    }
                }}>关闭</Button>
            </Space.Compact>
        </Flex>
        <Flex vertical gap={1} style={{width:"100%"}}>
            <Row style={RowCssProps}>
                <Col span={3} style={ColCssProps}>公钥</Col>
                <Col span={21}><Input value={publicKey} onChange={(e)=>{setPublicKey(e.target.value)}} size={"small"} placeholder="04开头的16进制,共130字节"/></Col>
            </Row>
            <Row style={RowCssProps}>
                <Col span={3} style={ColCssProps}>私钥</Col>
                <Col span={21}><Input value={privateKey} onChange={(e)=>{setPrivateKey(e.target.value)}} size={"small"} placeholder="16进制,共64字节"/></Col>
            </Row>
            <Row style={RowCssProps}>
                <Col span={3} style={ColCssProps}>mode</Col>
                <Col span={8}><Select style={{width:"100%"}} size={"small"} defaultValue={"C1C3C2"} onChange={handleModeChange} options={
                    [
                        {value:"C1C2C3"},
                        {value:"C1C3C2"},
                    ]
                }/></Col>
                <Col span={7} offset={6}><Button size={"small"} onClick={genKeyPair}>公私钥生成</Button></Col>
            </Row>
            <Row style={RowCssProps}>
                <Col span={3} style={ColCssProps}>输入</Col>
                <Col span={8}><Select style={{width:"100%"}} size={"small"} defaultValue={inputDataType} onSelect={setInputDataType} options={
                    [
                        {value:DataType.Base64},
                        {value:DataType.UTF_8},
                        {value:DataType.Hex},
                    ]
                }/></Col>
                <Col span={4} offset={2} style={ColCssProps}>输出</Col>
                <Col span={7}><Select style={{width:"100%"}} size={"small"}  defaultValue={outputDataType} onSelect={setOutputDataType} options={
                    [
                        {value:DataType.Base64},
                        {value:DataType.UTF_8},
                        {value:DataType.Hex},
                    ]
                }/></Col>
            </Row>
        </Flex>
    </Flex>
}

export const DES:React.FC<Props>=(props:Props)=>{
    const [key,setKey] = useState("")
    const [iv,setIV] = useState("")
    const [mode,setMode] = useState(CryptoJS.mode.CBC)
    const [padding,setPadding] = useState(CryptoJS.pad.Pkcs7)
    const [inputDataType,setInputDataType] = useState(DataType.Base64)
    const [outputDataType,setOutputDataType] = useState(DataType.UTF_8)

    const encrypt=()=>{
        try {
            if(!props.input) return
            const plaintext = props.input()
            if(plaintext===""){
                return
            }
            let words
            if(inputDataType===DataType.Hex){
                words = CryptoJS.enc.Hex.parse(plaintext)
            }else if(inputDataType===DataType.Base64){
                if(!isBase64(plaintext)){
                    if(props.onResult){
                        return props.onResult("非法base64字符串")
                    }
                }
                words = CryptoJS.enc.Base64.parse(plaintext)
            }else if(inputDataType===DataType.UTF_8){
                words = CryptoJS.enc.Utf8.parse(plaintext)
            }
            if(!words){
                if(props.onResult){
                    return props.onResult("输入编码错误")
                }
                return
            }
            const k = CryptoJS.enc.Utf8.parse(key)
            const i = CryptoJS.enc.Utf8.parse(iv)
            const data = CryptoJS.DES.encrypt(words,k,{
                iv:i,
                mode:mode,
                padding:padding
            })
            let result
            if(outputDataType===DataType.Hex){
                result = CryptoJS.enc.Hex.stringify(data.ciphertext)
            }else if(outputDataType===DataType.Base64 || outputDataType===DataType.UTF_8){
                result = CryptoJS.enc.Base64.stringify(data.ciphertext)
            }
            if(props.onResult){
                if(result===""){
                    return props.onResult("加密失败")
                }else {
                    return props.onResult(result)
                }
            }
        }catch (e) {
            return props.onResult && props.onResult(e)
        }

    }

    const decrypt=()=>{
        try {
            if(!props.input) return
            const ciphertext = props.input()
            if(ciphertext===""){
                return
            }
            let words
            if(inputDataType===DataType.Hex){
                words = CryptoJS.enc.Hex.parse(ciphertext)
            }else if(inputDataType===DataType.Base64){
                if(!isBase64(ciphertext)){
                    if(props.onResult){
                        return props.onResult("非法base64字符串")
                    }
                }
                words = CryptoJS.enc.Base64.parse(ciphertext)
            }else if(inputDataType===DataType.UTF_8){
                words = CryptoJS.enc.Utf8.parse(ciphertext)
            }
            if(!words){
                if(props.onResult){
                    return props.onResult("输入编码错误")
                }
                return
            }
            const k = CryptoJS.enc.Utf8.parse(key)
            const i = CryptoJS.enc.Utf8.parse(iv)
            const data = CryptoJS.DES.decrypt(CryptoJS.enc.Base64.stringify(words),k,{
                iv:i,
                mode:mode,
                padding:padding
            })
            let result
            if(outputDataType===DataType.Hex){
                result = CryptoJS.enc.Hex.stringify(data)
            }else if(outputDataType===DataType.Base64){
                result = CryptoJS.enc.Base64.stringify(data)
            }else if(outputDataType===DataType.UTF_8){
                result = CryptoJS.enc.Utf8.stringify(data)
            }
            if(props.onResult){
                if(result===""){
                    return props.onResult("解密失败")
                }else {
                    return props.onResult(result)
                }
            }
        }catch (e) {
            return props.onResult && props.onResult(e)
        }
    }

    const handleModeChange=(value:string)=>{
        switch (value){
            case "CBC":
                setMode(CryptoJS.mode.CBC)
                break
            case "CFB":
                setMode(CryptoJS.mode.CFB)
                break
            case "CTR":
                setMode(CryptoJS.mode.CTR)
                break
            case "ECB":
                setMode(CryptoJS.mode.ECB)
                break
            case "OFB":
                setMode(CryptoJS.mode.OFB)
                break
            case "CTRGladman":
                setMode(CryptoJS.mode.CTRGladman)
                break
        }
    }

    const handlePaddingChange=(value:string)=>{
        switch (value){
            case "Pkcs7":
                setPadding(CryptoJS.pad.Pkcs7)
                break
            case "ZeroPadding":
                setPadding(CryptoJS.pad.ZeroPadding)
                break
            case "NoPadding":
                setPadding(CryptoJS.pad.NoPadding)
                break
            case "AnsiX923":
                setPadding(CryptoJS.pad.AnsiX923)
                break
            case "Iso10126":
                setPadding(CryptoJS.pad.Iso10126)
                break
            case "Iso97971":
                setPadding(CryptoJS.pad.Iso97971)
                break
        }
    }

    return <Flex vertical gap={2} style={{width:"100%",paddingBottom:"10px"}}>
        <Flex justify={"space-between"} style={{alignItems:'center',height:"24px"}}>
            {props.title}
            <Space.Compact>
                <Button size={"small"} onClick={encrypt}>加密</Button>
                <Button size={"small"} onClick={decrypt}>解密</Button>
                <Button size={"small"} id={"close"} onClick={(e)=> {
                    e.stopPropagation();// 防止选中项背景色状态消失
                    if(props.onExitBtnClick) {
                        props.onExitBtnClick()
                    }
                }}>关闭</Button>
            </Space.Compact>
        </Flex>
        <Flex vertical gap={1} style={{width:"100%"}}>
            <Row style={RowCssProps}>
                <Col span={3} style={ColCssProps}>key</Col>
                <Col span={21}><Input onChange={(e)=>{setKey(e.target.value)}} size={"small"} placeholder="128/192/256位,即16/24/32字节"/></Col>
            </Row>
            <Row style={RowCssProps}>
                <Col span={3} style={ColCssProps}>iv</Col>
                <Col span={21}><Input onChange={(e)=>{setIV(e.target.value)}} size={"small"} placeholder="16字节"/></Col>
            </Row>
            <Row style={RowCssProps}>
                <Col span={3} style={ColCssProps}>mode</Col>
                <Col span={8}><Select style={{width:"100%"}} size={"small"} defaultValue={"CBC"} onChange={handleModeChange} options={
                    [
                        {title:"CBC",value:"CBC"},
                        {title:"ECB",value:"ECB"},
                        {title:"OFB",value:"OFB"},
                        {title:"CFB",value:"CFB"},
                        {title:"CTR",value:"CTR"},
                        {title:"CTRGladman",value:"CTRGladman"},
                    ]
                }/></Col>
                <Col span={4} offset={2} style={ColCssProps}>padding</Col>
                <Col span={7} ><Select style={{width:"100%"}} size={"small"} defaultValue={"Pkcs7"} onChange={handlePaddingChange} options={
                    [
                        {title:"Pkcs7",value:'Pkcs7'},
                        {title:"ZeroPadding",value:"ZeroPadding"},
                        {title:"NoPadding",value:"NoPadding"},
                        {title:"AnsiX923",value:"AnsiX923"},
                        {title:"Iso10126",value:"Iso10126"},
                        {title:"Iso97971",value:"Iso97971"},
                    ]
                }/></Col>
            </Row>
            <Row style={RowCssProps}>
                <Col span={3} style={ColCssProps}>输入</Col>
                <Col span={8}><Select style={{width:"100%"}} size={"small"} defaultValue={inputDataType} onSelect={setInputDataType} options={
                    [
                        {title:"Base64",value:DataType.Base64},
                        {title:"UTF-8",value:DataType.UTF_8},
                        {title:"Hex",value:DataType.Hex},
                    ]
                }/></Col>
                <Col span={4} offset={2} style={ColCssProps}>输出</Col>
                <Col span={7}><Select style={{width:"100%"}} size={"small"}  defaultValue={outputDataType} onSelect={setOutputDataType} options={
                    [
                        {title:"Base64",value:DataType.Base64},
                        {title:"UTF-8",value:DataType.UTF_8},
                        {title:"Hex",value:DataType.Hex},
                    ]
                }/></Col>
            </Row>
        </Flex>
    </Flex>
}