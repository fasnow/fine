import React, {useEffect, useState} from "react";
import {Button, ButtonProps, Flex, Input} from "antd";

interface PasswordProps {
    label?: string
    labelWidth?: string | number
    value: string
    width?: string | number
    onSubmit: (path:string)=>Promise<boolean>|boolean
    onCancel?: ()=>void
    placeholder?: string,
}

const Password:React.FC<PasswordProps>=(props)=>{
    const [editable, setEditable] = useState(false)
    const [value, setValue] = useState(props.value)
    const buttonProps: ButtonProps = {
        type: "default", shape: "round", size: "small"
    };

    useEffect(()=>{
        setValue(props.value)
    }, [props.value])

    const onClick=async () => {
        if (await props.onSubmit(value || "")) {
            setEditable(false)
        }
    }

    const cancel = () => {
        if (props.onCancel){
            props.onCancel()
        }
        setValue(props.value)
        setEditable(false)
    }

    return <Flex justify={"left"}>
        {
            props.label &&
            <span style={{
                display: "inline-block",
                textAlign: "left",
                paddingRight: "5px",
                height: "24px",
                width: props.labelWidth || 'fit-content',
                minWidth: props.labelWidth || 'fit-content',
                whiteSpace: 'nowrap'
            }}
            >{props.label}</span>
        }
        <Input.Password placeholder={props.placeholder} style={{width: "600px", marginRight: "10px"}} value={value} onChange={(e) => { if (editable) setValue(e.target.value) }} size={"small"} />
        <Flex gap={10}>
            {
                !editable ?
                    <Button {...buttonProps} onClick={() => setEditable(true)}>修改</Button>
                    :
                    <Flex gap={10}>
                        <Button {...buttonProps} htmlType="submit"
                                onClick={onClick}
                        >保存</Button>
                        <Button {...buttonProps} htmlType="submit"
                                onClick={cancel}
                        >取消</Button>
                    </Flex>
            }
        </Flex>
    </Flex>
}

export default Password