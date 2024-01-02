import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Button, Col, ConfigProvider, Form, Input, Row, Select, Space, Switch, Tabs, Tooltip } from 'antd';
import type { ButtonProps, FormProps, TabsProps } from 'antd';
import "./Setting.css"
import ScrollBar from '../../component/ScrollBar';
import NotFound from '../Notfound';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, setAuth, setFofaAuth, setFofaUser, setHunterAuth, setProxy, setQuakeAuth, setZoneAuth } from '../../store/store';
import { $getFofaUser, $save0zoneConf, $saveFofaConf, $saveHunterConf, $saveProxyConf, $saveQuakeConf } from '../../http/api';
import { SyncOutlined } from '@ant-design/icons';
import { FofaUserType } from '../../type';
import { errorNotification } from '../../component/Notification';
const onChange = (key: string) => {
  console.log(key);
};

export const buttonProps: ButtonProps = {
  type: "default", shape: "round", size: "small"
};

export const authFormProps: FormProps = {
  size: "middle", style: { width: "400px" }
};

export const proxyFormProps: FormProps = {
  size: "middle", style: { width: "300px" }
};

export const Proxy: React.FC = () => {
  const [editable, setEditable] = useState(false)
  const dispatch = useDispatch()
  const [form] = Form.useForm();
  const proxy = useSelector((state: RootState) => state.config.proxy)

  const save = (values: any) => {
    setEditable(false)
    form.setFieldsValue(values);
    dispatch(setProxy(values))
    $saveProxyConf(values).then(
      resp => {
        console.log(resp.data)
      }
    ).catch()
  }
  useEffect(() => {
    if (proxy) {
      console.log(proxy)
      form.setFieldsValue({
        type: proxy.type,
        host: proxy.host,
        port: proxy.port,
        username: proxy.user,
        password: proxy.pass,
        enable: proxy.enable
      });
    }
  }, [proxy]);
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
      console.log(values)
      setEditable(false)
      form.setFieldsValue(values);
      dispatch(setFofaAuth(values))
      $saveFofaConf(values).then(
        resp => {
          console.log(resp.data)
        }
      ).catch()
    }

    useEffect(() => {
      console.log("fofaAuth", fofaAuth)
      if (fofaAuth) {
        form.setFieldsValue({
          email: fofaAuth.email,
          key: fofaAuth.key,
        });
      }
    }, [fofaAuth]);
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
      if (hunterAuth) {
        form.setFieldsValue({
          key: hunterAuth.key,
        });
      }
    }, [hunterAuth]);
    function save(values: any) {
      console.log(values)
      setEditable(false)
      form.setFieldsValue(values);
      dispatch(setHunterAuth(values))
      $saveHunterConf(values).then(
        resp => {
          console.log(resp.data)
        }
      ).catch()
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
      if (zoneAuth) {
        form.setFieldsValue({
          key: zoneAuth.key,
        });
      }
    }, [zoneAuth]);
    function save(values: any) {
      console.log(values)
      setEditable(false)
      form.setFieldsValue(values);
      dispatch(setZoneAuth(values))
      $save0zoneConf(values).then(
        resp => {
          console.log(resp.data)
        }
      ).catch()
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
    const quakeAuth = useSelector((state: RootState) => state.config.auth?.quake)
    useEffect(() => {
      if (quakeAuth) {
        form.setFieldsValue({
          key: quakeAuth.key,
        });
      }
    }, [quakeAuth]);
    function save(values: any) {
      console.log(values)
      setEditable(false)
      form.setFieldsValue(values);
      dispatch(setQuakeAuth(values))
      $saveQuakeConf(values).then(
        resp => {
          console.log(resp.data)
        }
      ).catch()
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
  },
  {
    key: 'proxy',
    label: `代理`,
    children: <Proxy />,
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
