import React from "react";

const titleHeight = '30px'
const tabHeight = 24
export const CssConfig = {
    title:{
        textAlign: 'center',
        color: '#000',
        height: titleHeight,
        lineHeight: titleHeight,
        margin: '0',
        padding: '0',
        backgroundColor:"rgb(255,255,255)"
    } as React.CSSProperties,
    tab:{
        height:`${tabHeight}px`,
    },
}