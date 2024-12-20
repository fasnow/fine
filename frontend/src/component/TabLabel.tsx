import React from "react";

interface TabItemProps {
    label: string;
}

const TabLabel: React.FC<TabItemProps> = ({ label}) => {
    return <span style={{display:"flex",width:"30px", justifyContent:"space-around"}}>{label}</span>
};

export default TabLabel;
