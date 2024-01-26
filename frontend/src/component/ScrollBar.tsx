import React from "react"
interface ScrollBarProps extends React.HTMLAttributes<HTMLDivElement> {
    height?:string|number
    maxHeight?:string|number
    overly?:boolean
}
class ScrollBar extends React.Component<ScrollBarProps>{
    constructor(props: ScrollBarProps) {
        super(props)
    }
    render() {
        const { children,height,maxHeight, ...rest } = this.props;
        return (
            <div
                className="scrollBar"
                style={{ overflow: "auto",height:height,maxHeight:maxHeight,...rest.style }}
            >
                {children}
            </div>
        );
    }
}

export default ScrollBar