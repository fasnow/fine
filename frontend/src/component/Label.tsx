import {Flex} from "antd";
import React from "react";

interface PasswordProps {
    style?: React.CSSProperties
    label: string
    labelWidth?: string | number
    value: any
    width?: string | number
}

const Label:React.FC<PasswordProps>=(props)=>{
    return <Flex justify={"left"} style={{...props.style}}>
        <span style={{display: "inline-block", textAlign: "left", paddingRight: "5px", height: "24px", minWidth: props.labelWidth || 'fit-content', maxWidth: props.labelWidth || 'fit-content'}}>{props.label}</span>
        {props.value}
    </Flex> 
}

export default Label