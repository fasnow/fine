import {Button, Flex, Input, Space} from "antd";
import React from "react";
import {OpenDirectoryDialog} from "../../wailsjs/go/osoperation/Runtime";

export interface DirectorySelectorProps{
    value?: string | number | undefined
    onSelect?: (dir:string)=>void
    label?: string
    labelWidth?: string | number
    inputWidth?: string | number
    placeholder?: string,
}

const DirectorySelector:React.FC<DirectorySelectorProps> = (props) =>{
    const openDirectoryDialog = () => {
        OpenDirectoryDialog().then(
            result => {
                if (props.onSelect){
                    props.onSelect(result)
                }
            }
        )
    }
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
        <Space.Compact size={"small"} style={{width:'100%'}}>
            <Input size={'small'} value={props.value} style={{width: props.inputWidth || 'fit-content',}}/>
            <Button onClick={openDirectoryDialog}>选择</Button>
        </Space.Compact>
    </Flex>
}

export default DirectorySelector