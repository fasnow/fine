import React, { useEffect, useState } from 'react';
import { Button, Col, ConfigProvider, Form, Input, Row, Select, Space, Switch, Tabs, Tooltip } from 'antd';
import type { ButtonProps, FormProps, TabsProps } from 'antd';
import "./Setting.css"
import ScrollBar from '../../component/ScrollBar';
import { useDispatch, useSelector } from 'react-redux';
import {RootState, setProxy} from '@/store/store';
import { SyncOutlined } from '@ant-design/icons';
import { errorNotification } from '@/component/Notification';
import {
  Get0zone,
  GetFofa, GetHunter,
  GetProxy, GetQuake,
  SaveProxy,

} from "../../../wailsjs/go/config/Config";
import {SetAuth as SetHunterAuth} from "../../../wailsjs/go/hunter/Bridge";
import {SetAuth as SetFofaAuth} from "../../../wailsjs/go/fofa/Bridge";
import {SetAuth as Set0zoneAuth} from "../../../wailsjs/go/zone/Bridge";
import {SetAuth as SetQuakeAuth} from "../../../wailsjs/go/zone/Bridge";
const onChange = (key: string) => {
  console.log(key);
};

export const buttonProps: ButtonProps = {
  type: "default", shape: "round", size: "small"
};

export const authFormProps: FormProps = {
  size: "middle", style: { width: "400px" }, preserve:false
};

export const proxyFormProps: FormProps = {
  size: "middle", style: { width: "300px" }
};

export const Proxy: React.FC = () => {
  const [editable, setEditable] = useState(false)
  const [form] = Form.useForm();
  const dispatch = useDispatch()
  const save = (values: any) => {
    setEditable(false)
    form.setFieldsValue(values);
    SaveProxy({
      enable:values.enable,
      type:values.type,
      host:values.host,
      port:values.port,
      user:values.username,
      pass:values.password
    }).then(()=>{
      dispatch(setProxy({
        enable:values.enable,
        type:values.type,
        host:values.host,
        port:values.port,
        user:values.username,
        pass:values.password}))
    }).catch(
        err=>errorNotification("错误",err,3)
    )
  }
  useEffect(() => {
    GetProxy().then(
        result=>{
          form.setFieldsValue({
            type: result.type,
            host: result.host,
            port: result.port,
            username: result.user,
            password: result.pass,
            enable: result.enable
          });
          dispatch(setProxy(result))
        }
    )
  }, []);
  return (<div style={{
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: "20px"
  }}>
    <div >
      <Form
        {...proxyFormProps}
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        layout="horizontal"
        onFinish={(values) => { save(values) }}
        disabled={!editable}
        colon={false}
      >
        <Form.Item label="类型" name="type">
          <Select size="small">
            <Select.Option value="http">http</Select.Option>
            <Select.Option value="socks5">socks5</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="主机" name="host">
          <Input size="small" />
        </Form.Item>
        <Form.Item label="端口" name="port">
          <Input size="small" />
        </Form.Item>
        <Form.Item label="用户名" name="username">
          <Input size="small" />
        </Form.Item>
        <Form.Item label="密码" name="password">
          <Input.Password size="small" />
        </Form.Item>
        <Form.Item labelCol={{ span: 4 }} label >
          <Row >
            <Col offset="0" span="12">
              <Form.Item noStyle>
                {
                  !editable ?
                    <Button {...buttonProps} disabled={false} onClick={() => setEditable(true)} >修改</Button>
                    :
                    <>
                      <Button {...buttonProps}
                        onClick={() => form.submit()}
                      >保存</Button>
                      <Button {...buttonProps}
                        onClick={() => setEditable(false)}
                      >取消</Button>
                    </>
                }
              </Form.Item>
            </Col>
            <Col offset="6">
              <Form.Item name="enable" noStyle valuePropName='checked'>
                <Switch disabled={editable} size="default" checkedChildren="开启" unCheckedChildren="关闭" onChange={() => form.submit()} />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>
      </Form>
    </div>
  </div>)
}

const Account: React.FC = () => {
  const dispatch = useDispatch()

  const FofaForm: React.FC = () => {
    const [form] = Form.useForm()
    const [editable, setEditable] = useState(false)
    const fofaAuth = useSelector((state: RootState) => state.config.auth.fofa)
    function save(values: any) {
      setEditable(false)
      form.setFieldsValue(values);
      SetFofaAuth(values.email,values.key).catch(
          err=>errorNotification("错误",err,3)
      )
    }

    useEffect(() => {
      GetFofa().then(
          (result)=>{
            form.setFieldsValue({
              email: result.email,
              key: result.token,
            });
          }
      )
    }, []);
    return (<div className='border'>
      <span className='border_title' >
        Fofa
      </span>
      <Form
        {...authFormProps}
        form={form}
        disabled={!editable}
        onFinish={(values) => save(values)}
      >
        <Form.Item name="email">
          <Input placeholder="email" />
        </Form.Item>
        <Form.Item name="key">
          <Input.Password placeholder="token" />
        </Form.Item>
      </Form>
      {
        !editable ?
          <Button {...buttonProps} onClick={() => setEditable(true)} >修改</Button>
          :
          <>
            <Button {...buttonProps} htmlType="submit"
              onClick={() => form.submit()}
            >保存</Button>
            <Button {...buttonProps} htmlType="submit"
              onClick={() => setEditable(false)}
            >取消</Button>
          </>
      }
    </div>)
  }

  const HunterForm: React.FC = () => {
    const [form] = Form.useForm()
    const [editable, setEditable] = useState(false)
    const hunterAuth = useSelector((state: RootState) => state.config.auth?.hunter)
    useEffect(() => {
      GetHunter().then(
          (result)=> form.setFieldsValue({key: result.token,})
      )
    }, []);
    function save(values: any) {
      setEditable(false)
      form.setFieldsValue(values);
      SetHunterAuth(values.key).catch(
          err=>errorNotification("错误",err,3)
      )
    }
    return (<div className='border'>
      <span className='border_title' >
        Hunter
      </span>
      <Form
        {...authFormProps}
        form={form}
        disabled={!editable}
        onFinish={(values) => { save(values) }}
      >
        <Form.Item name="key">
          <Input.Password placeholder="token" />
        </Form.Item>
      </Form>
      {
        !editable ?
          <Button {...buttonProps} onClick={() => setEditable(true)} >修改</Button>
          :
          <>
            <Button {...buttonProps} htmlType="submit"
              onClick={() => form.submit()}
            >保存</Button>
            <Button {...buttonProps} htmlType="submit"
              onClick={() => setEditable(false)}
            >取消</Button>
          </>
      }
    </div>)
  }

  const ZoneForm: React.FC = () => {
    const [form] = Form.useForm()
    const [editable, setEditable] = useState(false)
    const zoneAuth = useSelector((state: RootState) => state.config.auth?.['0.zone'])
    useEffect(() => {
      Get0zone().then(
          (result)=> form.setFieldsValue({key: result.token,})
      )
    }, []);
    function save(values: any) {
      setEditable(false)
      form.setFieldsValue(values);
      Set0zoneAuth(values.key).catch(
          err=>errorNotification("错误",err,3)
      )
    }
    return (<div className='border'>
      <span className='border_title'>
        0.zone
      </span>
      <Form
        {...authFormProps}
        form={form}
        disabled={!editable}
        onFinish={(values) => save(values)}
      >
        <Form.Item name="key" >
          <Input.Password placeholder="token" />
        </Form.Item>
      </Form>
      {
        !editable ?
          <Button {...buttonProps} onClick={() => setEditable(true)} >修改</Button>
          :
          <>
            <Button {...buttonProps} htmlType="submit"
              onClick={() => form.submit()}
            >保存</Button>
            <Button {...buttonProps} htmlType="submit"
              onClick={() => setEditable(false)}
            >取消</Button>
          </>
      }
    </div>)
  }

  const QuakeForm: React.FC = () => {
    const [form] = Form.useForm()
    const [editable, setEditable] = useState(false)
    useEffect(() => {
      GetQuake().then(
          (result)=> form.setFieldsValue({key: result.token,})
      )
    }, []);
    function save(values: any) {
      setEditable(false)
      form.setFieldsValue(values);
      SetQuakeAuth(values.key).catch(
          err=>errorNotification("错误",err,3)
      )
    }
    return (<div className='border' >
      <span className='border_title' >
        Quake
      </span>
      <Form
        {...authFormProps}
        form={form}
        disabled={!editable}
        onFinish={(values) => save(values)}
      >
        <Form.Item name="key">
          <Input.Password placeholder="token" />
        </Form.Item>
      </Form>
      {
        !editable ?
          <Button {...buttonProps} onClick={() => setEditable(true)} >修改</Button>
          :
          <>
            <Button {...buttonProps} htmlType="submit"
              onClick={() => form.submit()}
            >保存</Button>
            <Button {...buttonProps} htmlType="submit"
              onClick={() => setEditable(false)}
            >取消</Button>
          </>
      }
    </div>)
  }

  return (
    <ScrollBar height="calc(100vh - 100px)">
      <Space direction='vertical' style={{ width: "100%", paddingTop: "20px" }} size={20} >
        <FofaForm />
        <HunterForm />
        <ZoneForm />
        <QuakeForm />
      </Space>
    </ScrollBar>
  )

}

const items: TabsProps['items'] = [
  {
    key: 'account',
    label: `账号`,
    children: <Account />,
    destroyInactiveTabPane:true
  },
  {
    key: 'proxy',
    label: `代理`,
    children: <Proxy />,
    destroyInactiveTabPane:true
  },

  // {
  //   key: 'other',
  //   label: `其他`,
  //   children: <NotFound />,
  // },
];


export const Setting: React.FC = () => {
  const dispatch = useDispatch()
  const RefreshPanel = () => {
    const [spin, setSpin] = useState<boolean>(false)


    return (<Tooltip title="刷新设置">
      <Button style={{ marginLeft: "10px" }} size="small" shape="circle" type="text" icon={<SyncOutlined spin={spin}
        onClick={async () => {
          setSpin(true)
          // await getUserInfo()
          setSpin(false)
        }}
      />}></Button>
    </Tooltip>)
  }
  return <ConfigProvider
    theme={{
      token: {
        marginLG: 16,
        margin: 0,
      }
    }}>
    <Tabs
      size="small"
      // tabBarExtraContent={{
      //   right: <RefreshPanel />
      // }}
      style={{ height: "100%" }} defaultActiveKey="account" items={items} onChange={onChange} />
  </ConfigProvider>
}
