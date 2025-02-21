import {ValueType} from "rc-input-number";
import React, {useState} from "react";
import {Flex, InputNumber, InputNumberProps} from "antd";

interface NumberProps {
    label?: string
    labelWidth?: string | number
    value: number
    width?: string | number
    onChange: (value: ValueType | null)=>Promise<boolean>
}

const Number:React.FC<NumberProps>=(props)=>{
    const [value, setValue] = useState<number | null>(props.value)

    const onChange: InputNumberProps<number>['onChange'] = async (value) => {
        if (await props.onChange(value)) {
            setValue(value);
        }
    };
    return <Flex>
        {
            props.label &&
            <span style={{display: "inline-block", textAlign: "left", paddingRight: "5px", height: "24px", width: props.labelWidth || 'fit-content'}}>{props.label}</span>
}
    <InputNumber<number> precision={0}
    formatter={(value) => value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || ""}
    parser={(value) => (value ? parseFloat(value.replace(/,/g, "")) : 0)}
    value={value} size={"small"} style={{width:props.width || '100px'}} onChange={onChange}/>
    </Flex>
}

export default Number