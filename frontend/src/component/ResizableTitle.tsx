import React, { useState } from 'react';
import type { ResizeCallbackData } from 'react-resizable';
import { Resizable } from 'react-resizable';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import "./ResizableTitle.css"
const ResizableTitle = (
  props: React.HTMLAttributes<any> & {
    onResize: (e: React.SyntheticEvent<Element>, data: ResizeCallbackData) => void;
    width: number;
  },
) => {
  const { onResize, width, ...restProps } = props;

  if (!width) {
    return <th {...restProps} />;
  }

  return (
    <Resizable
      width={width}
      height={0}
      // handle={
      //   <span
      //     className="react-resizable-handle"
      //     onClick={(e) => {
      //       e.stopPropagation();
      //     }}
      //   />
      // }
      onResize={onResize}
      draggableOpts={{
        enableUserSelectHack: false,
        onMouseDown: (e: any) => {
          // fix: 修复在 Windows Chrome 和 Edge 松开鼠标依然能拖动
          if (window.getSelection) {
            const selection = window.getSelection();
            if (selection) {
              if (selection.empty) {  // Chrome
                selection.empty();
              } else if (selection.removeAllRanges) {  // Firefox
                selection.removeAllRanges();
              }
            }
          }
        }
      }}
    >
      <th {...restProps} />
    </Resizable>
  );
};

export default ResizableTitle