import { EditorProps } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { loader } from '@monaco-editor/react';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

// 改为从本地加载而不是cdn
// eslint-disable-next-line no-restricted-globals
self.MonacoEnvironment = {
    getWorker(_, label) {
        if (label === 'json') {
            return new jsonWorker();
        }
        if (label === 'css' || label === 'scss' || label === 'less') {
            return new cssWorker();
        }
        if (label === 'html' || label === 'handlebars' || label === 'razor') {
            return new htmlWorker();
        }
        if (label === 'typescript' || label === 'javascript') {
            return new tsWorker();
        }
        return new editorWorker();
    },
};
loader.config({ paths: { vs: '/node_modules/monaco-editor/min/vs' } });
loader.config({ monaco });

export const MonacoEditorProps: EditorProps = {
    loading: null,
    defaultValue: "",
    defaultLanguage: "plaintext",
    theme: "vs-dark",
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