import React, {forwardRef, useEffect, useImperativeHandle, useState} from "react";
import {Checkbox, CheckboxProps, Divider, Flex, GetProp} from "antd";
import {StatisticalAggs} from "../../wailsjs/go/fofa/Bridge";
import {errorNotification} from "@/component/Notification";
import LineSplit from "@/component/LineSplit";
import {fofa} from "../../wailsjs/go/models";
import Detail = fofa.Detail;
import Country = fofa.Country;

interface FofaStatisticalAggsProps {
    value?: string;
    ref?: any;
}

const FofaStatisticalAggs:React.FC<FofaStatisticalAggsProps> = forwardRef((props,ref)=>{
    const [loading, setLoading] = useState<boolean>(false)
    const [protocolData, setProtocolData] = useState<Detail[]>()
    const [domainData, setDomainData] = useState<Detail[]>()
    const [portData, setPortData] = useState<Detail[]>()
    const [titleData, setTitleData] = useState<Detail[]>()
    const [osData, setOsData] = useState<Detail[]>()
    const [serverData, setServerData] = useState<Detail[]>()
    const [countryData, setCountryData] = useState<Country[]>()
    const [asNumberData, setAsNumberData] = useState<Detail[]>()
    const [asOrganizationData, setAsOrganizationData] = useState<Detail[]>()
    const [assetTypeData, setAssetTypeData] = useState<Detail[]>()
    const [fidData, setFidData] = useState<Detail[]>()
    const [icpData, setIcpData] = useState<Detail[]>()
    const [hiddenList, setHiddenList] = useState<{ [key: string]: boolean }>({
        protocol:true,
        domain:true,
        port:true,
        title:true,
        os:true,
        server:true,
        country:true,
        as_number:true,
        as_organization:true,
        asset_type:true,
        fid:true,
        icp:true,
    })
    const [fields, setFields] = useState<string[]>([
        'protocol','domain','port','title','os','server','country','as_number','as_organization','asset_type','fid','icp'
    ])
    const fieldOptions = [
        { label: '协议', value: 'protocol' },
        { label: '域名', value: 'domain' },
        { label: '端口', value: 'port' },
        { label: 'HTTP标题', value: 'title' },
        { label: '操作系统', value: 'os' },
        { label: 'HttpServer信息', value: 'server' },
        { label: '国家/城市统计', value: 'country' },
        { label: 'asn编号', value: 'as_number' },
        { label: 'asn组织', value: 'as_organization' },
        { label: '资产类型', value: 'asset_type' },
        { label: 'fid统计', value: 'fid' },
        { label: 'icp备案信息', value: 'icp' },
    ];
    const checkAll = fieldOptions.length === fields?.length;
    const indeterminate = fields.length > 0 && fields.length < fieldOptions.length;

    useEffect(()=>{
        update(fields)
    },[fields])

    useImperativeHandle(ref, () => ({
        query: (value: string) => query(value),
    }));

    const onCheckAllChange: CheckboxProps['onChange'] = (e) => {
        setFields(e.target.checked ? fieldOptions.map(i=>i.value) : []);
    };

    const query=(v:string)=>{
        const t = fields?.join(",")
        if(!t)return
        setLoading(true)
        StatisticalAggs(t,v)
            .then(r=>{
                setProtocolData(r.aggs.protocol)
                setDomainData(r.aggs.domain)
                setPortData(r.aggs.port)
                setTitleData(r.aggs.title)
                setOsData(r.aggs.os)
                setServerData(r.aggs.server)
                setCountryData(r.aggs.countries)
                setAsNumberData(r.aggs.as_number)
                setAsOrganizationData(r.aggs.as_organization)
                setAssetTypeData(r.aggs.asset_type)
                setFidData(r.aggs.fid)
                setIcpData(r.aggs.icp)
            })
            .catch(e=>{
                errorNotification("错误",e)
            })
            .finally(()=>setLoading(false))
    }

    const onChange: GetProp<typeof Checkbox.Group, 'onChange'> = (checkedValues) => {
        setFields(checkedValues as string[])
    };

    const update = (fields: (keyof typeof hiddenList)[] | undefined | null) => {
        console.log(fields)
        setHiddenList(prevState => {
            const newState = {...prevState };
            Object.keys(newState).forEach(key => {
                newState[key] = !fields?.includes(key);
            });
            console.log(newState)
            return newState;
        });
    };

    return (
        <Flex vertical style={{height: '100%'}} gap={10}>
            <Flex vertical gap={5} >
                <Flex justify={'center'} align={'center'}>
                    <Checkbox indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAll}>
                        全选
                    </Checkbox>
                    <Checkbox.Group
                        options={fieldOptions}
                        value={fields}
                        onChange={onChange}
                    />
                </Flex>
            </Flex>
            <Divider style={{margin:'0'}}/>
            <Flex style={{overflow:'auto', flex: 1, boxSizing: 'border-box'}}>
                <LineSplit data={protocolData} columnDefs={[
                    {field: "count", headerName: '数量', width: 80},
                    {field: "name", headerName:'名称', width: 80, wrapText: true, autoHeight: true},
                ]} label={"协议"} hidden={hiddenList.protocol} loading={loading}/>
                <LineSplit data={domainData} columnDefs={[
                    {field: "count", headerName: '数量', width: 80},
                    {field: "name", headerName:'名称', width: 200,wrapText: true, autoHeight: true},
                ]} label={"域名"} hidden={hiddenList.domain} width={290} loading={loading}/>
                <LineSplit data={portData} columnDefs={[
                    {field: "count", headerName: '数量', width: 80},
                    {field: "name", headerName:'名称', width: 100,wrapText: true, autoHeight: true},
                ]} label={"端口"} hidden={hiddenList.port} loading={loading}/>
                <LineSplit data={titleData} columnDefs={[
                    {field: "count", headerName: '数量', width: 80},
                    {field: "name", headerName:'名称', width: 300, wrapText: true, autoHeight: true},
                ]} label={"http 标题"} hidden={hiddenList.title} loading={loading}/>
                <LineSplit data={osData} columnDefs={[
                    {field: "count", headerName: '数量', width: 80},
                    {field: "name", headerName:'名称', width: 100, wrapText: true, autoHeight: true},
                ]} label={"操作系统"} hidden={hiddenList.os} loading={loading}/>
                <LineSplit data={serverData} columnDefs={[
                    {field: "count", headerName: '数量', width: 80},
                    {field: "name", headerName:'名称', width: 200, wrapText: true, autoHeight: true},
                ]} label={"http server信息"} hidden={hiddenList.server} loading={loading}/>
                <LineSplit data={countryData} columnDefs={[
                    {field: "count", headerName: '数量', width: 80},
                    {field: "name", headerName:'名称', width: 100,  wrapText: true, autoHeight: true},
                    {field: "code", headerName: '搜索语句', width: 200,  wrapText: true, autoHeight: true},
                ]} label={"国家、城市统计"} hidden={hiddenList.country} loading={loading}/>
                <LineSplit data={asNumberData} columnDefs={[
                    {field: "count", headerName: '数量', width: 80},
                    {field: "name", headerName:'名称', width: 100, wrapText: true, autoHeight: true},
                ]} label={"asn编号"} hidden={hiddenList.as_number} loading={loading}/>
                <LineSplit data={asOrganizationData} columnDefs={[
                    {field: "count", headerName: '数量', width: 80},
                    {field: "name", headerName:'名称', width: 200, wrapText: true, autoHeight: true},
                ]} label={"asn组织"} hidden={hiddenList.as_organization} loading={loading}/>
                <LineSplit data={assetTypeData} columnDefs={[
                    {field: "count", headerName: '数量', width: 80},
                    {field: "name", headerName:'名称', width: 120, wrapText: true, autoHeight: true},
                ]} label={"资产类型"} hidden={hiddenList.asset_type} loading={loading}/>
                <LineSplit data={fidData} columnDefs={[
                    {field: "count", headerName: '数量', width: 80},
                    {field: "name", headerName:'名称', width: 250, wrapText: true, autoHeight: true},
                ]} label={"fid 统计"} hidden={hiddenList.fid} loading={loading}/>
                <LineSplit data={icpData} columnDefs={[
                    {field: "count", headerName: '数量', width: 80},
                    {field: "name", headerName:'名称', width: 250, wrapText: true, autoHeight: true},
                ]} label={"icp备案信息"} hidden={hiddenList.icp} loading={loading}/>
            </Flex>
        </Flex>
    );
})

export default FofaStatisticalAggs