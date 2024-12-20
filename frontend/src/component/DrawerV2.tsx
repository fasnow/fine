import React from "react";
import ReactDOM from "react-dom";
import "./DrawerV2.css";

interface DrawerProps {
    open?: boolean; // 是否打开
    onClose?: () => void; // 关闭抽屉的函数
    children?: React.ReactNode; // 抽屉的内容
    container?: HTMLElement | null; // 自定义渲染节点，默认为 null
}

const DrawerV2: React.FC<DrawerProps> = ({ open, onClose, children, container = null }) => {
    const drawerContent = (
        <div className={`drawer-overlay ${open ? "show" : ""}`} onClick={onClose}>
            <div className={`drawer ${open ? "show" : ""}`} onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>
                    Close
                </button>
                <div className="drawer-content">{children}</div>
            </div>
        </div>
    );

    // 如果传入了 container，则使用 React Portal 渲染到指定节点；否则渲染到当前节点
    return container ? ReactDOM.createPortal(drawerContent, container) : drawerContent;
};

export default DrawerV2;
