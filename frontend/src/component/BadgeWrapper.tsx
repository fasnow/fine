import React from 'react';

interface BadgeWrapperProps {
    info: string;
    children: React.ReactNode;
}

const BadgeWrapper: React.FC<BadgeWrapperProps> = ({ info, children }) => {
    return (
        <>
            {
                info ?
                    <span style={{ position: 'relative', display: 'inline-block' }}>
                        {children}
                        <div
                            style={{
                                position: 'absolute',
                                top: '-7px',
                                right: '-10px',
                                backgroundColor: '#f50',
                                color: 'white',
                                borderRadius: '3px 3px 3px 0',
                                alignItems: 'center',
                                textAlign: 'center',
                                fontSize: '8px',
                                padding: "0 2px 0 2px",
                                fontStyle: 'italic',
                                lineHeight: '10px',
                                fontWeight: 'bold',
                                width: '24px',
                            }}
                        >
                            {info}
                            <div
                                style={{
                                    position: "absolute",
                                    bottom: "-3px", // 尾巴位置微调
                                    left: "0",
                                    width: "3px",
                                    height: "3px",
                                    backgroundColor: '#f50',
                                    clipPath: "polygon(0 0, 0 3px, 3px 0)", // 小尾巴三角形
                                }}
                            />
                        </div>
                    </span>
                    : children
            }
        </>
    );
};
export default BadgeWrapper