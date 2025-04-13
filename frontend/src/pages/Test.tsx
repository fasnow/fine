import React, {
    useCallback,
    useMemo,
    useRef,
    useState,
    StrictMode,
  } from "react";
  import { createRoot } from "react-dom/client";
  import { AgGridReact } from "ag-grid-react";
  import {
      CellValueChangedEvent,
    ClientSideRowModelModule,
    ColDef,
    ColGroupDef,
    GridApi,
    GridOptions,
    ITextCellEditorParams,
    ModuleRegistry,
    TextEditorModule,
    ValidationModule,
  } from "ag-grid-community";
import { matcher } from "wailsjs/go/models";
import { WithIndex } from "@/component/Interface";
  ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    TextEditorModule,
    ValidationModule /* Development Only */,
  ]);
  const colors: string[] = [
    'AliceBlue',
    'AntiqueWhite',
    'Aqua',
    'Aquamarine',
    'Azure',
];
  function getRandomNumber(min: number, max: number) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  
  const data = Array.from(Array(20).keys()).map(() => {
    const color = colors[getRandomNumber(0, colors.length - 1)];
    return {
      color: color,
      value: getRandomNumber(0, 1000),
    };
  });
  

  type PageDataType=WithIndex<matcher.Rule>

  const GridExample = () => {
    const containerStyle = useMemo(() => ({ width: "100%", height: "100%" }), []);
    const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);
    const [rowData, setRowData] = useState<PageDataType[]>([]);
    const [columnDefs, setColumnDefs] = useState<ColDef[]>([
      {
        field: "Name",
        editable: true,
      },
    ]);

    function onCellValueChanged(event: CellValueChangedEvent): void {
        console.log(event);
    }
  
    return (
      <div style={containerStyle}>
        <div style={gridStyle}>
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            onCellValueChanged={onCellValueChanged}
          />
        </div>
      </div>
    );
  };

export default GridExample;