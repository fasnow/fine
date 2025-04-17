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

export const MonacoEditorProps:EditorProps = {
    defaultValue:"",// windows下不设置会导致长时间加载
    defaultLanguage:"plaintext",
    theme:"vs-dark",
    options: {
        fixedOverflowWidgets: false, // 让搜索框浮动在文本上方
        quickSuggestions: false,  // 快速建议
        suggestOnTriggerCharacters: false,// 触发字符建议
        parameterHints: { enabled: false },// 参数提示
        wordBasedSuggestions: undefined,// 基于单词的建议
        contextmenu: false, // 禁用右键菜单
        minimap: { enabled: false },// 小地图
        scrollBeyondLastLine: false, // 滚动到最后一行
        lineNumbers: 'on', // 行号显示
        glyphMargin: false, // 字形边距
        folding: false, // 代码折叠
        lineDecorationsWidth: 10, // 行装饰宽度
        lineNumbersMinChars: 0,
        renderLineHighlight: 'all',// 行高亮
        overviewRulerLanes: 0,
        hideCursorInOverviewRuler: true,
        overviewRulerBorder: false,
        links: false,
    }
}