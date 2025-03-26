import {Flex, Input} from "antd";
import React, {useEffect, useState} from "react";

export interface InputProps{
    value?: string | number | undefined
    onBlur?: (value: string | number | undefined)=>void
    label?: string
    labelWidth?: string | number
    inputWidth?: string | number
    placeholder?: string,
}

const LabelInput:React.FC<InputProps> = (props) =>{
    const [value, setValue] = useState(props.value)
    useEffect(()=>{
        setValue(props.value)
    }, [props.value])

    return <Flex justify={"left"} >
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
        <Input
            value={value}
            onChange={(e) => {setValue(e.target.value) }}
            size={'small'}
            style={{width: props.inputWidth || 'fit-content'}}
            onBlur={()=>{
                if (props.onBlur) {
                    props.onBlur(value)
                }
            }}
        />
    </Flex>
}

export default LabelInput