// import React, { LegacyRef, useState } from "react"
// import "./css.css"
// import { Button, Dropdown, MenuProps } from "antd";
// import { ItemType } from "antd/es/menu/hooks/useItems";
// interface MenuContextProps extends React.HTMLAttributes<HTMLDivElement> {
//     items: ItemType[],
//     open: boolean,
//     onClicked: (key: string) => void,
//     toInvisible: () => void,
//     event: React.MouseEvent<any, MouseEvent>
// }
// class ContextMenu extends React.Component<MenuContextProps>{
//     customDivRef: LegacyRef<HTMLDivElement> = React.createRef();
//     constructor(props: MenuContextProps) {
//         super(props)
//     }

//     handleCustomDivClick = (e: { target: any; }) => {
//         const target = e.target;

//         // 在这里你可以检查目标元素是否是表格内的某个元素
//         // 例如，你可以检查目标元素的 class 或标签名来确定点击的是表格内的内容

//         // 这里以一个示例判断点击的是否是表格行（tr）元素
//         if (target.tagName === 'TD') {
//           // 如果点击的是表格行，你可以进一步处理点击事件
//           // 例如，获取行数据等操作
//           console.log('点击了表格行');
//         }
//         console.log('点击了表格行1',target.tagName);
//       };
//     state = {
//         id: "contextmenu",
//         open: false,
//         mousePosition: {
//             x: 0,
//             y: 0
//         },
//         event: this.props.event
//     };

//     async componentDidUpdate(prevProps: MenuContextProps) {
//         this.props.event?.preventDefault()
//         if (this.props.open !== prevProps.open) {
//             this.setState({ open: this.props.open });
//         }

//     }

//     handleMenuClick: MenuProps['onClick'] = (e) => {
//         this.props.toInvisible()
//         return this.props.onClicked(e.key)
//     };


//     onClickOutside = () => {
//         this.props.toInvisible()
//         document.removeEventListener(`click`, this.onClickOutside)
//     }
//     render() {
//         const { children, items, open, ...rest } = this.props;
//         const menus: MenuProps = {
//             items,
//             onClick: this.handleMenuClick,
//         };
//         const id = `${Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000}`
//         const y = this.props.event?.clientY
//         const x = this.props.event?.clientX
//         if (open) {
//             document.addEventListener(`click`, this.onClickOutside)
//         }
//         return (
//             <div 
//             ref={this.customDivRef} 
//             onClick={this.handleCustomDivClick}
//             onContextMenu={this.handleCustomDivClick}
//                 id={"id"}
//                 style={{ ...rest.style }}
//             >
//                 {children}
//                 {
//                     open && (<div
//                         style={{
//                             zIndex: 99999,
//                             position: 'fixed',
//                             top: `${y}px`,
//                             left: `${x}px`,
//                         }}
//                     >
//                         <Dropdown
//                             open={open}
//                             menu={menus}
//                             placement="bottom"
//                             // getPopupContainer={() => document.getElementById(id)}
//                             destroyPopupOnHide
//                         >
//                             <span />
//                         </Dropdown>
//                     </div>)
//                 }
//             </div>
//         );
//     }
// }

// export default ContextMenu
import React, { LegacyRef, useState } from "react"
import { Button, Dropdown, MenuProps, message } from "antd";
import { ItemType } from "antd/es/menu/hooks/useItems";
import copy from "copy-to-clipboard";
import {MenuItemsKey} from "../type";
interface MenuContextProps extends React.HTMLAttributes<HTMLDivElement> {
    items: ItemType[],
    onItemClick: (key: string) => void,
    hidden?: boolean
}

interface MenuContextState {
    open: boolean,
    position: {
        clientX: number,
        clientY: number
    },
}

class ContextMenu extends React.Component<MenuContextProps, MenuContextState>{
    constructor(props: MenuContextProps) {
        super(props)
    }
    ref: LegacyRef<HTMLDivElement> = React.createRef();
    state = {
        open: false,
        position: {
            clientX: 0,
            clientY: 0
        },
    };
    handleMenucontextClick = async (e: React.MouseEvent<any, MouseEvent>) => {
        e.preventDefault()
        if (this.props.hidden) {
            return
        }
        await this.setState({
            position: {
                clientX: e.clientX,
                clientY: e.clientY
            },
            open: false
        })
        this.setState({ open: true })
    };



    onClickOutside = () => {
        this.setState({ open: false })
        document.removeEventListener(`click`, this.onClickOutside)
    }

    handleMenuClick: MenuProps['onClick'] = (e) => {
        this.setState({ open: false })
        return this.props.onItemClick(e.key)
    };
    copy = () => {
        const [messageApi, contextHolder] = message.useMessage();
        const { children, items, ...rest } = this.props;
        const menus: MenuProps = {
            items,
            onClick: this.handleMenuClick,
        };
        const id = `${Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000}`
        if (this.state.open) {
            document.addEventListener(`click`, this.onClickOutside)
        }
        const handleLetfClick = async (e: React.MouseEvent<any, MouseEvent>) => {
            e.preventDefault()
            if (this.state.open) {
                this.setState({ open: false })
            }
        };
        
        return (
            <div
                ref={this.ref}
                onClick={handleLetfClick}
                onContextMenu={this.handleMenucontextClick}
                id={id}
                style={{ ...rest.style }}
            >
                {contextHolder}
                {children}
                {
                    this.state.open && (<div
                        style={{
                            zIndex: 99999,
                            position: 'fixed',
                            top: `${this.state.position.clientY}px`,
                            left: `${this.state.position.clientX}px`,
                        }}
                    >
                        <Dropdown
                            open={this.state.open}
                            menu={menus}
                            placement="bottom"
                            // getPopupContainer={() => document.getElementById(id)}
                            destroyPopupOnHide
                        >
                            <span />
                        </Dropdown>
                    </div>)
                }
            </div>
        );

    }

    render() {
       
        return (
            <this.copy></this.copy>
            // <div
            //     ref={this.ref}
            //     onClick={this.handleLetfClick}
            //     onContextMenu={this.handleMenucontextClick}
            //     id={id}
            //     style={{ ...rest.style }}
            // >
            //     {children}
            //     {
            //         open && (<div
            //             style={{
            //                 zIndex: 99999,
            //                 position: 'fixed',
            //                 top: `${this.state.position.clientY}px`,
            //                 left: `${this.state.position.clientX}px`,
            //             }}
            //         >
            //             <Dropdown
            //                 open={this.state.open}
            //                 menu={menus}
            //                 placement="bottom"
            //                 // getPopupContainer={() => document.getElementById(id)}
            //                 destroyPopupOnHide
            //             >
            //                 <span />
            //             </Dropdown>
            //         </div>)
            //     }
            // </div>
        );
    }
}

export default ContextMenu