import React from 'react';
import { Resizable } from 'react-resizable';
import "./ResizableTitle.css"

// @ts-ignore
const ResizableTitle = props => {
  const { onResize, width, ...restProps } = props;

  if (!width) {
    return <th {...restProps} />;
  }

  return (
    <Resizable
      width={width}
      height={0}
      onResize={onResize}
      draggableOpts={{
        enableUserSelectHack: false,
        onMouseDown: () => {
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