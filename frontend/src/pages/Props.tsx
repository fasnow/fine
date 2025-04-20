import {ModalProps} from "antd";
import {GridOptions} from "ag-grid-community/dist/types/src/entities/gridOptions";
import NotFound from "@/component/Notfound";
import Loading from "@/component/Loading";
import { editor } from 'monaco-editor';
import { EditorProps } from "@monaco-editor/react";
export const ExportDataPanelProps: ModalProps = {
    // centered: true,
    mask: false,
    maskClosable: false,
    cancelButtonProps: {size: "small"},
    okButtonProps: {size: "small"},
    style: {top: "20%"}
}


export const AGGridCommonOptions: GridOptions = {
    // embedFullWidthRows: true, // 是否嵌入表格，嵌入表格会随表格水平移动，否则会以当前表格可视宽度展示无需水平滚动 https://www.ag-grid.com/react-data-grid/full-width-rows/
    headerHeight: 32,
    rowHeight: 32,
    noRowsOverlayComponent: () => <NotFound/>,
    loadingOverlayComponent: () => <Loading/>,
    cellSelection: true, // 范围选择
    tooltipInteraction: true,
    tooltipShowDelay: 0,
    defaultColDef: {
        enableValue: true,
        enableRowGroup: true,
        enablePivot: true,
        filter: true,
        suppressHeaderMenuButton: true,
        suppressHeaderFilterButton: true,
    }
}

export const AGGridCommonOptionsNoCopy: GridOptions = {
    ...AGGridCommonOptions,
    suppressCellFocus: true // 禁止获取焦点，意味无法复制
}

