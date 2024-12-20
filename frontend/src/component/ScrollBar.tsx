import React from "react"
interface ScrollBarProps extends React.HTMLAttributes<HTMLDivElement> {
    height?:string|number
    maxHeight?:string|number
    overly?:boolean
}
const ScrollBar : React.FC<ScrollBarProps> =(props)=>{
    const { children,height,maxHeight, ...rest } = props;
    return (
        <div
            className="scrollBar"
            style={{ overflow: "auto",height:height,maxHeight:maxHeight,...rest.style }}
        >
            {children}
        </div>
    );
}

export default ScrollBar