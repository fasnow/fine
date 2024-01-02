import { CaretLeftOutlined, DoubleLeftOutlined, DoubleRightOutlined } from "@ant-design/icons"
import { Button, Checkbox, Dropdown, Input, MenuProps, Radio, Select, Space, Tabs, TabsProps } from "antd"
import DropdownButton from "antd/es/dropdown/dropdown-button"
import TextArea from "antd/es/input/TextArea"
import { useState } from "react"
import CryptoJS from 'crypto-js'
import * as Buffer from 'buffer';
type ItemType = {
    label: React.ReactNode,
    value: React.ReactNode,
    children: React.ReactNode
}

type EncodeType = {
    base64: ItemType,
    rsa: ItemType,
    aes: ItemType
}

const Base64: React.FC = () => {
    const [value, setValue] = useState<string>("")
    const [encodedValue, setEncodedValue] = useState<string>("")
    const [enable, setEnable] = useState<boolean>(false)
    const [valuePlaceholder, setValuePlaceholder] = useState<string>("")

    // Base64 编码
    const base64Encode = (value: string): string => {
        const buffer = Buffer.Buffer.from(value, "utf-8")
        return buffer.toString('base64');
    }

    // Base64 解码
    const base64Decode = (encoded: string): string => {
        if (!isBase64(encoded)) throw "not valide base64 fomat string"
        const buffer = Buffer.Buffer.from(encoded, "base64")
        return buffer.toString("utf-8");
    }

    const isBase64 = (base64String: string): boolean => {
        const base64Regex = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/;
        return base64Regex.test(base64String)
    }

    const handleEncode = () => {
        if (!enable) {
            setEncodedValue(base64Encode(value))
            return
        }
        const lines = value.split("\n")
        const encodedLines = lines.map((line) => {
            if (!line) return ""
            return base64Encode(line)
        })
        setEncodedValue(encodedLines.join("\n"))
    }

    const handleDecode = () => {
        if (!enable) {
            try {
                const decode = base64Decode(encodedValue)
                setValue(decode)
                setValuePlaceholder("")
            } catch {
                if (encodedValue.trim().split("\n").length > 1) {
                    setValue("")
                    setValuePlaceholder("解码失败,解码内容包含多行,是否应该执行【按行编解码】")
                } else {
                    setValue("")
                    setValuePlaceholder("解码失败")
                }
            }
            return
        }
        const lines = encodedValue.split("\n")
        const decodedLines = lines.map((line) => {
            if (!line) return ""
            try {
                return base64Decode(line)
            } catch {
                return "该行解码失败";
            }

        })
        setValue(decodedLines.join("\n"))
        setValuePlaceholder("")
    }


    return <div style={{ width: "100%", display: "flex", flexDirection: "row", gap: "5px" }}>
        <TextArea size="small" autoSize={{ minRows: 10 }} style={{ whiteSpace: 'nowrap' }} placeholder={valuePlaceholder} value={value} onChange={(e) => setValue(e.target.value)} />
        <div style={{ width: "240px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "5px" }}>
            <Checkbox onChange={(e) => setEnable(e.target.checked)}>按行编解码</Checkbox>
            <Button size="small" onClick={handleEncode}>编码<DoubleRightOutlined /></Button>
            <Button size="small" onClick={handleDecode}><DoubleLeftOutlined />解码</Button>
        </div>
        <TextArea size="small" style={{ whiteSpace: 'nowrap' }} value={encodedValue} onChange={(e) => setEncodedValue(e.target.value)} />
    </div>
}

const paddingOptions = ["Pkcs5/Pkcs7", "ZeroPadding", "NoPadding", "AnsiX923", "Iso10126", "Iso97971"] as const
const modeOptions = ["ECB", "CBC", "CFB", "CTR", "CTRGladman", "OFB"] as const
const outputEncodeOptions = ["Base64", "Hex"] as const
const ivKeyEncodeOptions = ["Hex", "Base64"] as const
type paddingType = typeof paddingOptions[number] | "";
type modeType = typeof modeOptions[number];
type outputEncodeType = typeof outputEncodeOptions[number];
type ivKeyEncodeType = typeof ivKeyEncodeOptions[number];
const AES: React.FC = () => {
    const [plaintext, setPlaintext] = useState<string>("")
    const [ciphertext, setCiphertext] = useState<string>("")
    const [valuePlaceholder, setPlaintextPlaceholder] = useState<string>("")
    const [encodedValuePlaceholder, setCiphertextPlaceholder] = useState<string>("")
    const [iv, setIv] = useState<string>("")
    const [key, setKey] = useState<string>("")
    const [keyEncode, setKeyEncode] = useState<ivKeyEncodeType>()
    const [ivEncode, setIvEncode] = useState<ivKeyEncodeType>()
    const [outputEncode, setOutputEncode] = useState<outputEncodeType>()
    const [mode, setMode] = useState<any>(CryptoJS.mode.ECB);
    const [padding, setPadding] = useState<any>(CryptoJS.pad.Pkcs7);
    const [disableIv, setDisableIv] = useState(mode == CryptoJS.mode.ECB);
    const [disablePadding, setDisablePadding] = useState(mode == CryptoJS.mode.ECB || mode == CryptoJS.mode.OFB || mode == CryptoJS.mode.CFB);

    const encrypt = () => {
        if (!plaintext) {
            setCiphertext("")
            setCiphertextPlaceholder("")
            setPlaintextPlaceholder("")
            return
        }
        const options: { mode?: any, padding?: any, iv?: any } = {
            mode: mode,
            // padding: padding,
            // iv: CryptoJS.enc.Utf8.parse(iv)  // 初始化向量（IV），长度通常与块大小相同
        };
        if (mode) {
            options["mode"] = padding
        }
        if (!disableIv) {
            options["padding"] = padding
            options["iv"] = CryptoJS.enc.Utf8.parse(iv)
        }
        if (!disablePadding) {
            options["padding"] = padding
        }
        // if (ivEncode == "")
        //     // const encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(plaintext), CryptoJS.enc.Utf8.parse(key), options);
        // setCiphertext(encrypted.ciphertext.toString())
        setCiphertextPlaceholder("")
        setPlaintextPlaceholder("")
    }

    const decrypt = () => {
        if (!ciphertext) {
            setPlaintext("")
            setCiphertextPlaceholder("")
            setPlaintextPlaceholder("")
        }
        const options: { mode?: any, padding?: any, iv?: any } = {
            mode: mode,
            // padding: padding,
            // iv: CryptoJS.enc.Utf8.parse(iv)  // 初始化向量（IV），长度通常与块大小相同
        };
        if (!disableIv) {
            options["padding"] = padding
            options["iv"] = CryptoJS.enc.Utf8.parse(iv)
        }
        if (!disablePadding) {
            options["padding"] = padding
        }
        const ciphertextHexStr = CryptoJS.enc.Hex.parse(ciphertext);
        const srcs = CryptoJS.enc.Base64.stringify(ciphertextHexStr);
        const decrypted = CryptoJS.AES.decrypt(srcs, CryptoJS.enc.Utf8.parse(key), options);
        setPlaintext(decrypted.toString(CryptoJS.enc.Utf8))
        setCiphertextPlaceholder("")
        setPlaintextPlaceholder("")
    }

    const handleModeChange = (value: string) => {
        if (value == "ECB") {
            setDisableIv(true)
        } else {
            setDisableIv(false)
        }
        if (value == "OFB" || value == "ECB" || value == "CFB") {
            setDisablePadding(true)
        } else {
            setDisablePadding(false)
        }
        switch (value) {
            case "CBC":
                setMode(CryptoJS.mode.CBC)
                break
            case "CFB":
                setMode(CryptoJS.mode.CFB)
                break
            case "CTR":
                setMode(CryptoJS.mode.CTR)
                break
            case "CTRGladman":
                setMode(CryptoJS.mode.CTRGladman)
                break
            case "OFB":
                setMode(CryptoJS.mode.OFB)
                break
            case "ECB":
                setMode(CryptoJS.mode.ECB)
                break
        }
    };

    const handlePaddingChange = (value: string) => {
        switch (value) {
            case "Pkcs5/Pkcs7":
                setPadding(CryptoJS.pad.Pkcs7)
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
            case "ZeroPadding":
                setPadding(CryptoJS.pad.ZeroPadding)
                break
            case "NoPadding":
                setPadding(CryptoJS.pad.NoPadding)
        }
    };

    return <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
        <Space>
            <Select
                showSearch
                size="small"
                defaultValue={modeOptions[0]}
                style={{ width: 120 }}
                onChange={handleModeChange}
                options={modeOptions.map((mode) => ({ label: mode, value: mode }))}
            />
            <Select
                showSearch
                size="small"
                defaultValue={paddingOptions[0]}
                style={{ width: 120 }}
                onChange={handlePaddingChange}
                options={paddingOptions.map((paddingLabel) => ({ label: paddingLabel, value: paddingLabel }))}
                disabled={disablePadding}
            />
            <span style={{ display: "flex", flexDirection: "row", gap: "3px" }}>
                IV
                <Input
                    size="small"
                    addonBefore={
                        <Select
                            size="small"
                            style={{ width: "90px" }}
                            defaultValue={ivKeyEncodeOptions[0]}
                            options={ivKeyEncodeOptions.map((item) => ({ label: item, value: item }))} />
                    }
                    addonAfter={<>{iv.length}bytes</>}
                    disabled={disableIv}
                    onChange={(e) => setIv(e.target.value.trim())} />
            </span>
            <span style={{ display: "flex", flexDirection: "row", gap: "3px" }}>
                KEY
                <Input
                    size="small"
                    addonBefore={
                        <Select
                            size="small"
                            style={{ width: "90px" }}
                            defaultValue={ivKeyEncodeOptions[0]}
                            options={ivKeyEncodeOptions.map((item) => ({ label: item, value: item }))}

                        />
                    }
                    addonAfter={<>{key.length}bytes</>}
                    onChange={(e) => setKey(e.target.value.trim())} />
            </span>
        </Space>
        <span style={{ display: "flex", flexDirection: "row", gap: "3px", width: "290px" }}>
            <span style={{ whiteSpace: "nowrap" }}>输出编码</span>
            <Select
                size="small"
                style={{ width: "90px" }}
                defaultValue={outputEncodeOptions[0]}
                options={outputEncodeOptions.map((item) => ({ label: item, value: item }))} />
        </span>
        <div style={{ width: "100%", display: "flex", flexDirection: "row", gap: "5px" }}>
            <TextArea size="small" autoSize={{ minRows: 10 }} style={{ whiteSpace: 'nowrap' }} placeholder={valuePlaceholder} value={plaintext} onChange={(e) => setPlaintext(e.target.value.trim())} />
            <div style={{ width: "240px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "5px" }}>
                <Button size="small" onClick={encrypt}>加密<DoubleRightOutlined /></Button>
                <Button size="small" onClick={decrypt}><DoubleLeftOutlined />解密</Button>
            </div>
            <TextArea size="small" style={{ whiteSpace: 'nowrap' }} placeholder={encodedValuePlaceholder} value={ciphertext} onChange={(e) => setCiphertext(e.target.value.trim())} />
        </div>

    </div>
}

const Encode: React.FC = () => {
    // const [encodeType, setEncodeType] = useState("")
    const items: TabsProps['items'] = [
        {
            label: "Base64",
            key: "base64",
            children: <Base64 />
        },
        {
            label: "AES",
            key: "aes",
            children: <AES />
        },
        {
            label: "RSA",
            key: "rsa",
            children: ""
        },
    ]
    return <Tabs size="small" items={items} />
}

export default Encode