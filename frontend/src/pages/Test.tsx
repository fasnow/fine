

import Tabs from "antd/es/tabs";
import { Tab } from "rc-tabs/lib/interface";
import Editor from '@monaco-editor/react';
import { editor } from 'monaco-editor';

const tabs: Tab[] = [];
for (let i = 0; i < 20; i += 1) {
  tabs.push(
    {
      label: `Tab ${i}`,
      children: <Editor
        height="100%"
        defaultLanguage="plaintext"
        value={"111111111"}
        options={{
          // 让搜索框浮动在文本上方
          fixedOverflowWidgets: true,
          // 禁用所有提示和自动完成
          quickSuggestions: false,
          suggestOnTriggerCharacters: false,
          parameterHints: { enabled: false },
          wordBasedSuggestions: undefined,
          // 禁用右键菜单
          contextmenu: false,

          // 禁用其他不必要的功能
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: 'off',
          glyphMargin: false,
          folding: false,
          lineDecorationsWidth: 0,
          lineNumbersMinChars: 0,
          renderLineHighlight: 'none',
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          overviewRulerBorder: false,
        }}
      />,
      key: i.toString()
    }
  )
}


const Test = () => {
  return <Tabs items={tabs} style={{ height: '100%' }} />;
};

export default Test;