import React, { useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
import { ColDef } from "ag-grid-community";
interface RowData {
    country: string;
    // year: string;
    gold: number;
    silver: number;
    bronze: number;
}

const Test: React.FC = () => {
    const [rowData] = useState<RowData[]>([
        { country: "USA", gold: 10, silver: 15, bronze: 20 },
        { country: "USA", gold: 12, silver: 14, bronze: 18 },
        { country: "UK",gold: 8, silver: 10, bronze: 12 },
        { country: "UK", gold: 9, silver: 11, bronze: 13 },
        { country: "China",  gold: 15, silver: 18, bronze: 22 },
        { country: "China",gold: 18, silver: 20, bronze: 25 },
    ]);

    const [columnDefs] = useState<ColDef<RowData>[]>([
        { field: "country", sortable: true, filter: true },
        // { field: "year", pivot: true, sortable: true, filter: true },
        { field: "gold", aggFunc: "sum" },
        { field: "silver", aggFunc: "sum" },
        { field: "bronze", aggFunc: "sum" },
    ]);

    const defaultColDef = {
        sortable: true,
        filter: true,
        // resizable: true,
    };

    return (
        <div
            className="ag-theme-alpine"
            style={{ height: "500px", width: "100%" }}
        >
            <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                animateRows={true}
                // groupIncludeFooter={true}
                pivotMode={true}
                // containerStyle={{width: "100%" }}
                // style={{ width: '100%', height: '100%' }}
            />
        </div>
    );
};

export default Test;
