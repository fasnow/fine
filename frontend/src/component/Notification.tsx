import { ModalProps, notification } from 'antd';
import "./Notification.css"


export const successNotification = (message: string, description: any, duration?: number) => {
    const des = description.toString()
    notification.success({
        message,
        description: des,
        placement: "topRight",
        duration,
    })
}

export const infoNotification = (message: string, description: any, duration?: number) => {
    const des = description.toString()
    notification.info({
        message,
        description: des,
        placement: "topRight",
        duration,
    })
}

export const warningNotification = (message: string, description: any, duration?: number) => {
    const des = description.toString()
    notification.warning({
        message,
        description: des,
        placement: "topRight",
        duration,
    })
}

export const errorNotification = (message: string, description: any, duration?: number) => {
    const des = description.toString()
    notification.error({
        message,
        description: des,
        placement: "topRight",
        duration,
    })
}

