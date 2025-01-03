import React from "react";

type Props = {
    children: React.ReactNode;
    gap?: number;
    vertical?: boolean,
    style?: React.CSSProperties;
};

const FlexV2: React.FC<Props> = (props) => {
    // 获取第一层的子元素，确保不嵌套的元素被获取
    const childArray = React.Children.toArray(props.children);
    const { gap, ...restStyle } = props.style || {};
    const new_gap = props.gap
    return (
        <div
            style={{
                display: "flex",
                flexDirection: props.vertical ? "column" : "row",
                ...restStyle
            }}
        >
            {
                childArray.map((child, index) => {
                    const style: React.CSSProperties = {}
                    if (props.vertical) {
                        style.marginBottom = index === childArray.length - 1 ? 0 : new_gap
                    } else {
                        style.marginRight = index === childArray.length - 1 ? 0 : new_gap
                    }
                    return (
                        <div key={index} style={style}>
                            {child}
                        </div>
                    );
                })
            }
        </div>
    );
};

export default FlexV2;
