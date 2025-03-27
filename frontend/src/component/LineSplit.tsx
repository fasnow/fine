import React, {useState, useRef, ReactNode, useEffect, useMemo} from "react";
import {Flex} from "antd";
import NotFound from "@/component/Notfound";
import Loading from "@/component/Loading";
import {ColDef} from "ag-grid-community";
import {AgGridReact} from "ag-grid-react";
import {AGGridCommonOptions} from "@/pages/Props";

export interface Column {
    value?: string;
    width?: number;
    label?: string;
    data?: any[];
    hidden?: boolean;
    columnDefs?:ColDef[];
    flex?: number;
    loading?: boolean
}

const LineSplit: React.FC<Column> = (props) => {
    const startX = useRef<number>(0);
    const [width, setWidth] = useState(()=>{
        let w = 0
        props.columnDefs?.forEach((i)=>{
            w = w + (i.width || 0)
        })
        return w + 10
    })
    const widthRef = useRef<number>(width)

    const handleMouseDown = (e: React.MouseEvent) => {
        startX.current = e.pageX;
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
        const deltaX = e.pageX - startX.current;
        startX.current = e.pageX;
        widthRef.current = widthRef.current + deltaX
        setWidth(widthRef.current)
    };

    const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
    };

    return (
        <Flex style={{width:'max-content', height: '100%', boxSizing: 'border-box', position: "relative"}}>
            <Flex
                vertical
                style={{
                    width: width,
                    display: props.hidden === true || props.hidden === undefined?'none':'flex',
                    position: "relative",
                    height:'100%'
                }}
            >
                <Flex justify={"center"} style={{height: 24}} align={"center"}>
                    <Flex justify={"center"} style={{flex:1}}>{props.label}</Flex>
                    <div
                        onMouseDown={(e) => handleMouseDown(e)}
                        style={{
                            width: "3px",
                            height: "12px",
                            alignItems: 'center',
                            position: 'relative',
                            cursor: "ew-resize",
                            justifyItems: 'center'
                        }}
                    >
                        <div style={{
                            width: "3px",
                            height: "100%",
                            backgroundColor: "#d8dada",
                            padding: '0',
                            right: '0'
                        }}/>
                    </div>
                </Flex>
                <AgGridReact
                    {...AGGridCommonOptions}
                    loading={props.loading}
                    sideBar={false}
                    autoSizeStrategy={{type: "fitGridWidth"}}
                    rowData={props.data}
                    columnDefs={props.columnDefs}
                    cellSelection={true}
                />
            </Flex>
        </Flex>
    );
};

export default LineSplit;