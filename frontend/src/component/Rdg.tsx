// CustomRadioGroup.tsx
import React, { useState, ReactNode } from 'react';
import './Rdg.css';
import { Badge, List, Popover, Space, Tag } from 'antd';

export interface RadioOption {
  label: ReactNode;
  value: string | number;
  badgeCount: number;
  content: { key: number, value: string }[];
}

export interface CustomRadioGroupProps extends React.HTMLProps<HTMLDivElement> {
  options: RadioOption[];
  defaultValue?: string | number;
  maxHeight: string | number
}

const Rdg: React.FC<CustomRadioGroupProps> = (props: CustomRadioGroupProps) => {
  const [selectedValue, setSelectedValue] = useState<string | number>(
    props.defaultValue
  );
  const [data, setData] = useState<{ key: number, value: string }[]>(props.options.filter((item) => item.value == props.defaultValue)[0]?.content)

  const handleRadioChange = (value: string | number) => {
    setSelectedValue(value);
    setData(props.options.filter((item) => item.value == value)[0]?.content)
  };

  return (
    <>
      {
        props.options?.length > 0 && (
          <>
            <Space wrap>
              {
                props.options.map((option, index) => (
                  <div
                    key={index}
                  >
                    <Popover
                      destroyTooltipOnHide//优化渲染性能，不然切回来的时候会卡
                      content={
                        <div style={{ maxHeight: "200px", maxWidth: "200px", overflow: "auto" }}>
                          <List
                            dataSource={option.content}
                            renderItem={(item) => (
                              <List.Item key={item.key} style={{padding:0}}>
                                {item.value}
                              </List.Item>
                            )}
                          />
                        </div>
                      }
                    >
                      <Badge count={option.badgeCount} size="small" offset={[-10, 0]}>
                        <Tag bordered={false}>
                          <label key={option.value}
                            className={`custom-radio ${selectedValue === option.value ? 'active' : ''}`}
                            onClick={() => handleRadioChange(option.value)}>
                            {option.label}
                          </label>
                        </Tag>
                      </Badge>
                    </Popover>
                  </div>
                ))}
            </Space>
          </>
        )
      }
    </>
  );
};
const MyItem: React.ForwardRefRenderFunction<
  HTMLDivElement,
  { line: string, index: number } & { style?: React.CSSProperties }
> = (props, ref) => {
  const { style, index, line } = props;

  return (
    <span
      ref={ref}
      style={{

        // lineHeight: '30px',
        boxSizing: 'border-box',
        display: 'flex',
        // position: 'relative',
        alignItems: 'center',
        borderInline: 0,
        backgroundColor: "rgb(255,255,255,1)",
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {/* <LineNumber
        index={index}
        style={{
          left: 0,
        }}
      /> */}
      {line}
    </span>
  );
};
const ForwardMyItem = React.forwardRef(MyItem);
export default Rdg;
