import React, { LegacyRef } from "react"
import { Dropdown, MenuProps, message } from "antd";
import {ItemType} from "antd/es/menu/interface";

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
        this.setState({
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