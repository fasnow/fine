import { AxiosRequestConfig } from "axios";
import { _exportDataToExcel, _saveDownloadLogItem } from "../electron/electronApi";
import {
  FofaAuthType,
  HunterAuthType,
  ProxyType,
  QuakeAuthType,
  ZoneAuthType,
  FofaQueryDataType,
  IcpItemType,
  IcpQueryResult,
  RequestDataType,
  ExportDataReturnType,
  FofaQueryResult,
  FofaUserType,
  ZoneSiteQueryResult,
  ServerResponseType,
  ZoneSiteItemType,
  ZoneApkQueryResult,
  ZoneEmailQueryResult,
  ZoneMemberQueryResult,
  ZoneCodeQueryResult,
  ZoneDarknetQueryResult,
  ZoneTGQueryResult,
  ZoneDomainQueryResult,
  ExportStatusType,
  DownloadLogItem,
} from "../type";
import req from "./request";
import { RSDQueryResult, RequestDataType as QuakeRequestDataType, UserType, QueryType } from "../type/quake";
import { HunterQueryDataType, HunterQueryResult } from "../type/hunter";
import { message } from "antd";
import { DownloadItem } from "electron";
import { AppItem, BaseInfo, InvestmentItem, ShareholderItem, SubsidiaryItem, SuggestItem as SuggestItem, SupplierItem, WechatItem, WeiboItem } from "../pages/unitmap/TianYanCha";

export const $getAllConf = async () => req.get("/config");
export const $getProxyConf = () => req.get("/config/proxy");
export const $getFofaConf = () => req.get("/config/fofa");
export const $getHunterConf = () => req.get("/config/hunter");
export const $get0zoneConf = () => req.get("/config/0.zone");
export const $getQuakeConf = () => req.get("/config/quake");
export const $getFofaUser = async (): Promise<{ error: Error, user: FofaUserType }> => {
  const res: { error: Error, user: FofaUserType } = {
    error: undefined,
    user: {
      email: "",
      username: "",
      category: "",
      fcoin: 0,
      fofa_point: 0,
      remain_free_point: 0,
      remain_api_query: 0,
      remain_api_data: 0,
      isvip: false,
      vip_level: 0,
      is_verified: false,
      avatar: "",
      message: "",
      fofacli_ver: "",
      fofa_server: false
    }
  }
  try {
    const resp = await req.get("/user/fofa");
    const result = resp.data;
    if (result["code"] !== 200) {
      res.error = result["message"];
    } else {
      res.user = result["data"];
    }
  } catch (err) {
    res.error = err;
  }
  return res;

};
export const $getQuakeUser = async (): Promise<{ error: Error, user: UserType }> => {
  const res: { error: Error, user: UserType } = {
    error: undefined,
    user: {
      id: "",
      user: {
        id: "",
        username: "",
        fullname: "",
        email: "",
        group: []
      },
      baned: false,
      ban_status: "",
      month_remaining_credit: 0,
      constant_credit: 0,
      credit: 0,
      persistent_credit: 0,
      free_query_api_count: 0,
      avatar_id: "",
      token: "",
      mobile_phone: "",
      source: "",
      time: "",
      disable: {
        disable_time: "",
        start_time: ""
      },
      privacy_log: {
        quake_log_status: false,
        quake_log_time: "",
        anonymous_model: false,
        status: false,
        time: ""
      },
      enterprise_information: {
        name: "",
        email: "",
        status: ""
      },
      invitation_code_info: {
        code: "",
        invite_acquire_credit: 0,
        invite_number: 0
      },
      is_cashed_invitation_code: false,
      role_validity: {
        注册用户: ""
      },
      personal_information_status: false,
      role: []
    }
  }
  try {
    const resp = await req.get("/user/quake");
    const result = resp.data;
    if (result["code"] !== 200) {
      res.error = result["message"];
    } else {
      res.user = result["data"];
    }
  } catch (err) {
    res.error = err;
  }
  return res;

};
export const $getOtherConf = () => req.get("/config/other");

export const $saveProxyConf = (data: ProxyType) =>
  req.post("/config/proxy", data);
export const $saveFofaConf = (data: FofaAuthType) =>
  req.post("/config/fofa", data);
export const $saveHunterConf = (data: HunterAuthType) =>
  req.post("/config/hunter", data);
export const $save0zoneConf = (data: ZoneAuthType) =>
  req.post("/config/0.zone", data);
export const $saveQuakeConf = (data: QuakeAuthType) =>
  req.post("/config/quake", data);
export const $saveOtherConf = (data: any) => req.post("/config/other", data);

export const $ip138Ip2Domains = async (
  ip: string
): Promise<{ error: Error, items: { domain: string, date: string }[] }> => {
  const res: { error: Error, items: { domain: string, date: string }[] } = {
    error: undefined,
    items: [],
  };
  try {
    const config: AxiosRequestConfig = {
      params: {
        ip: ip
      },
    };
    const resp = await req.get("/query/ip138/ip2Domains", config);
    const result = resp.data;
    if (result["code"] !== 200) {
      res.error = result["message"];
    } else {
      res.items = result["data"] ? result["data"] : [];
    }
  } catch (err) {
    res.error = err;
  }
  return res;
};

export const $ip138Domain2Ips = async (
  domain: string
): Promise<{ error?: Error, message?: string, items: { ip: string, locationOrDate: string }[] }> => {
  const res: { error?: Error, message?: string, items: { ip: string, locationOrDate: string }[] } = {
    items: [],
  };
  try {
    const config: AxiosRequestConfig = {
      params: {
        domain: domain
      },
    };
    const resp = await req.get("/query/ip138/domain2Ips", config);
    const result = resp.data;
    if (result["code"] !== 200) {
      res.error = result["message"];
    } else {
      const data = result["data"]
      res.items = data["items"] ? data["items"] : [];
      res.message = data["message"];
    }
  } catch (err) {
    res.error = err;
  }
  return res;
};
export const $ip138Domain2HistoryIps = async (
  domain: string
): Promise<{ error?: Error, items: { ip: string, locationOrDate: string }[] }> => {
  const res: { error?: Error, items: { ip: string, locationOrDate: string }[] } = {
    items: [],
  };
  try {
    const config: AxiosRequestConfig = {
      params: {
        domain: domain
      },
    };
    const resp = await req.get("/query/ip138/domain2HistoryIps", config);
    const result = resp.data;
    if (result["code"] !== 200) {
      res.error = result["message"];
    } else {
      res.items = result["data"] ? result["data"] : []
    }
  } catch (err) {
    res.error = err;
  }
  return res;
};
export const $icpRecordQuery = async (
  data: RequestDataType
): Promise<IcpQueryResult> => {
  const res: IcpQueryResult = {
    error: undefined,
    total: 0,
    items: [],
    page: 0,
    size: 0,
    id: "",
    maxPage: 0
  };
  try {
    const resp = await req.post("/query/icpRecord", data);
    const result = resp.data;
    if (result["code"] !== 200) {
      res.error = result["message"];
    } else {
      res.items = result["data"]["items"];
      res.total = result["data"]["total"];
      res.page = result["data"]["page"];
      res.size = result["data"]["size"];
      res.id = result["data"]["id"];
    }
  } catch (err) {
    res.error = err;
  }
  return res;
};

export const $icpRecordExport = async (id: string): Promise<ExportDataReturnType> => {//返回错误信息，如果有
  const config: AxiosRequestConfig = {
    params: {
      id: id,
      page: 1
    },
    responseType: "arraybuffer",
  };
  return await downloadFile("/export/icpRecord", config);
};

export async function downloadFile(url: string, config: any): Promise<ExportDataReturnType> {
  let result: ExportDataReturnType = {
    error: undefined,
    filename: "",
    dir: ""
  }
  let filename: string;
  // 发送文件下载请求并获取响应
  await req.get(url, config)
    .then(async (response) => {
      // 解析响应头中的文件名
      const contentDisposition = response.headers["content-disposition"];
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      if (contentDisposition != undefined) {
        const matches = filenameRegex.exec(contentDisposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, "");
          filename = decodeURIComponent(filename);
        }
      }
      // 将流数据保存到变量
      if (filename) {
        const fileData = new Uint8Array(response.data);
        // 处理字节码数据，比如保存到文件、解析等
        // console.log(byteArray);
        // const fileData = await streamToBuffer(response.data);
        // 调用方法2保存文件，并返回保存结果
        result = await _exportDataToExcel(fileData, filename);
      } else {
        result.error = "未检测到文件名"
      }
    })
    .catch((error) => {
      try {
        const tmp = JSON.parse(error["message"]) as ServerResponseType
        result.error = tmp["message"]
      } catch (err) {
        result.error = error["message"]
      }
    });
  return result;
}

export const $fofaQuery = async (
  data: FofaQueryDataType
): Promise<FofaQueryResult> => {
  const res: FofaQueryResult = {
    error: undefined,
    total: 0,
    items: [],
    page: 0,
    size: 0,
    id: "",
    maxPage: 0
  };
  try {
    const resp = await req.post("/query/fofa", data);
    const result = resp.data;
    if (result["code"] !== 200) {
      res.error = result["message"];
    } else {
      res.items = result["data"]["items"];
      res.total = result["data"]["total"];
      res.page = result["data"]["page"];
      res.size = result["data"]["size"];
      res.id = result["data"]["id"];
      res.maxPage = result["data"]["maxPage"];
    }
  } catch (err) {
    res.error = err;
  }
  return res;
};

export const $fofaQueryExport = async (id: string, page: number, size: number): Promise<Error> => {//返回错误信息，如果有
  const config: AxiosRequestConfig = {
    params: {
      id: id,
      page: page,
      size: size,
    },
  };
  try {
    const resp = await req.get("/export/fofa", config);
    const result = resp.data;
    if (result["code"] !== 200) {
      return result["message"];
    }
  } catch (err) {
    return err;
  }
};

export const $fofaQueryExportStatus = async (
  id: string
): Promise<ExportStatusType> => {
  const res: ExportStatusType = {
    error: undefined,
    filename: "",
    message: ""
  };
  try {
    const config: AxiosRequestConfig = {
      params: {
        id: id,
      },
    };
    const resp = await req.get("/exportStatus/fofa", config);
    const result = resp.data;
    if (result["code"] !== 200) {
      res.error = result["message"];
    } else {
      res.message = result["data"]["message"];
      res.filename = result["data"]["filename"];
    }
  } catch (err) {
    res.error = err;
  }
  return res;
};

export const $hunterQuery = async (
  data: HunterQueryDataType
): Promise<HunterQueryResult> => {
  const res: HunterQueryResult = {
    error: undefined,
    total: 0,
    items: [],
    page: 0,
    size: 0,
    id: "",
    maxPage: 0,
    accountType: "",
    consumeQuota: 0,
    restQuota: 0,
    syntaxPrompt: ""
  };
  try {
    const resp = await req.post("/query/hunter", data);
    const result = resp.data;
    if (result["code"] !== 200) {
      res.error = result["message"];
    } else {
      res.items = result["data"]["items"];
      res.total = result["data"]["total"];
      res.page = result["data"]["page"];
      res.size = result["data"]["size"];
      res.id = result["data"]["id"];
      res.maxPage = result["data"]["maxPage"];
      res.accountType = result['data']['accountType']
      res.consumeQuota = result['data']['consumeQuota']
      res.restQuota = result['data']['restQuota']
      res.syntaxPrompt = result['data']['syntaxPrompt']
    }
  } catch (err) {
    res.error = err;
  }
  return res;
};

export const $hunterQueryExport = async (id: string, page: number, size: number): Promise<Error> => {//返回错误信息，如果有
  const config: AxiosRequestConfig = {
    params: {
      id: id,
      page: page,
      size: size,
    },
  };
  try {
    const resp = await req.get("/export/hunter", config);
    const result = resp.data;
    if (result["code"] !== 200) {
      return result["message"];
    }
  } catch (err) {
    return err;
  }
};

export const $hunterQueryExportStatus = async (
  id: string
): Promise<ExportStatusType> => {
  const res: ExportStatusType = {
    error: undefined,
    filename: "",
    message: ""
  };
  try {
    const config: AxiosRequestConfig = {
      params: {
        id: id,
      },
    };
    const resp = await req.get("/exportStatus/hunter", config);
    const result = resp.data;
    if (result["code"] !== 200) {
      res.error = result["message"];
    } else {
      res.message = result["data"]["message"];
      res.filename = result["data"]["filename"];
    }
  } catch (err) {
    res.error = err;
  }
  return res;
};

export const $zoneQueryExportStatus = async (
  id: string
): Promise<ExportStatusType> => {
  const res: ExportStatusType = {
    error: undefined,
    filename: "",
    message: ""
  };
  try {
    const config: AxiosRequestConfig = {
      params: {
        id: id,
      },
    };
    const resp = await req.get("/exportStatus/0.zone", config);
    const result = resp.data;
    if (result["code"] !== 200) {
      res.error = result["message"];
    } else {
      res.message = result["data"]["message"];
      res.filename = result["data"]["filename"];
    }
  } catch (err) {
    res.error = err;
  }
  return res;
};

export const $zoneSiteQuery = async (
  data: RequestDataType
): Promise<ZoneSiteQueryResult> => {
  const res: ZoneSiteQueryResult = {
    error: undefined,
    total: 0,
    items: [],
    page: 0,
    size: 0,
    id: "",
    maxPage: 0,
  };
  try {
    const resp = await req.post("/query/0.zone/site", data);
    const result = resp.data;
    if (result["code"] !== 200) {
      res.error = result["message"];
    } else {
      res.items = result["data"]["items"];
      res.total = result["data"]["total"];
      res.page = result["data"]["page"];
      res.size = result["data"]["size"];
      res.id = result["data"]["id"];
      res.maxPage = result["data"]["maxPage"];
    }
  } catch (err) {
    res.error = err;
  }
  return res;
};

export const $zoneSiteQueryExport = async (id: string, page: number): Promise<Error> => {//返回错误信息，如果有
  const config: AxiosRequestConfig = {
    params: {
      id: id,
      page: page,
    },
  };
  try {
    const resp = await req.get("/export/0.zone/site", config);
    const result = resp.data;
    if (result["code"] !== 200) {
      return result["message"];
    }
  } catch (err) {
    return err;
  }
};

export const $zoneDomainQuery = async (
  data: RequestDataType
): Promise<ZoneDomainQueryResult> => {
  const res: ZoneDomainQueryResult = {
    error: undefined,
    total: 0,
    items: [],
    page: 0,
    size: 0,
    id: "",
    maxPage: 0,
  };
  try {
    const resp = await req.post("/query/0.zone/domain", data);
    const result = resp.data;
    if (result["code"] !== 200) {
      res.error = result["message"];
    } else {
      res.items = result["data"]["items"];
      res.total = result["data"]["total"];
      res.page = result["data"]["page"];
      res.size = result["data"]["size"];
      res.id = result["data"]["id"];
      res.maxPage = result["data"]["maxPage"];
    }
  } catch (err) {
    res.error = err;
  }
  return res;
};

export const $zoneDomainQueryExport = async (id: string, page: number): Promise<Error> => {//返回错误信息，如果有
  const config: AxiosRequestConfig = {
    params: {
      id: id,
      page: page,
    },
  };
  try {
    const resp = await req.get("/export/0.zone/domain", config);
    const result = resp.data;
    if (result["code"] !== 200) {
      return result["message"];
    }
  } catch (err) {
    return err;
  }
};

export const $zoneApkQuery = async (
  data: RequestDataType
): Promise<ZoneApkQueryResult> => {
  const res: ZoneApkQueryResult = {
    error: undefined,
    total: 0,
    items: [],
    page: 0,
    size: 0,
    id: "",
    maxPage: 0,
  };
  try {
    const resp = await req.post("/query/0.zone/apk", data);
    const result = resp.data;
    if (result["code"] !== 200) {
      res.error = result["message"];
    } else {
      res.items = result["data"]["items"];
      res.total = result["data"]["total"];
      res.page = result["data"]["page"];
      res.size = result["data"]["size"];
      res.id = result["data"]["id"];
      res.maxPage = result["data"]["maxPage"];
    }
  } catch (err) {
    res.error = err;
  }
  return res;
};

export const $zoneApkQueryExport = async (id: string, page: number): Promise<Error> => {//返回错误信息，如果有
  const config: AxiosRequestConfig = {
    params: {
      id: id,
      page: page,
    },
  };
  try {
    const resp = await req.get("/export/0.zone/apk", config);
    const result = resp.data;
    if (result["code"] !== 200) {
      return result["message"];
    }
  } catch (err) {
    return err;
  }
};

export const $zoneEmailQuery = async (
  data: RequestDataType
): Promise<ZoneEmailQueryResult> => {
  const res: ZoneEmailQueryResult = {
    error: undefined,
    total: 0,
    items: [],
    page: 0,
    size: 0,
    id: "",
    maxPage: 0,
  };
  try {
    const resp = await req.post("/query/0.zone/email", data);
    const result = resp.data;
    if (result["code"] !== 200) {
      res.error = result["message"];
    } else {
      res.items = result["data"]["items"];
      res.total = result["data"]["total"];
      res.page = result["data"]["page"];
      res.size = result["data"]["size"];
      res.id = result["data"]["id"];
      res.maxPage = result["data"]["maxPage"];
    }
  } catch (err) {
    res.error = err;
  }
  return res;
};

export const $zoneEmailQueryExport = async (id: string, page: number): Promise<Error> => {//返回错误信息，如果有
  const config: AxiosRequestConfig = {
    params: {
      id: id,
      page: page,
    },
  };
  try {
    const resp = await req.get("/export/0.zone/email", config);
    const result = resp.data;
    if (result["code"] !== 200) {
      return result["message"];
    }
  } catch (err) {
    return err;
  }
};

export const $zoneMemberQuery = async (
  data: RequestDataType
): Promise<ZoneMemberQueryResult> => {
  const res: ZoneMemberQueryResult = {
    error: undefined,
    total: 0,
    items: [],
    page: 0,
    size: 0,
    id: "",
    maxPage: 0,
  };
  try {
    const resp = await req.post("/query/0.zone/member", data);
    const result = resp.data;
    if (result["code"] !== 200) {
      res.error = result["message"];
    } else {
      res.items = result["data"]["items"];
      res.total = result["data"]["total"];
      res.page = result["data"]["page"];
      res.size = result["data"]["size"];
      res.id = result["data"]["id"];
      res.maxPage = result["data"]["maxPage"];
    }
  } catch (err) {
    res.error = err;
  }
  return res;
};

export const $zoneMemberQueryExport = async (id: string, page: number): Promise<Error> => {//返回错误信息，如果有
  const config: AxiosRequestConfig = {
    params: {
      id: id,
      page: page,
    },
  };
  try {
    const resp = await req.get("/export/0.zone/member", config);
    const result = resp.data;
    if (result["code"] !== 200) {
      return result["message"];
    }
  } catch (err) {
    return err;
  }
};

export const $zoneCodeQuery = async (
  data: RequestDataType
): Promise<ZoneCodeQueryResult> => {
  const res: ZoneCodeQueryResult = {
    error: undefined,
    total: 0,
    items: [],
    page: 0,
    size: 0,
    id: "",
    maxPage: 0,
  };
  try {
    const resp = await req.post("/query/0.zone/code", data);
    const result = resp.data;
    if (result["code"] !== 200) {
      res.error = result["message"];
    } else {
      res.items = result["data"]["items"];
      res.total = result["data"]["total"];
      res.page = result["data"]["page"];
      res.size = result["data"]["size"];
      res.id = result["data"]["id"];
      res.maxPage = result["data"]["maxPage"];
    }
  } catch (err) {
    res.error = err;
  }
  return res;
};

export const $zoneCodeQueryExport = async (id: string, page: number): Promise<Error> => {//返回错误信息，如果有
  const config: AxiosRequestConfig = {
    params: {
      id: id,
      page: page,
    },
  };
  try {
    const resp = await req.get("/export/0.zone/code", config);
    const result = resp.data;
    if (result["code"] !== 200) {
      return result["message"];
    }
  } catch (err) {
    return err;
  }
};

export const $zoneDarknetQuery = async (
  data: RequestDataType
): Promise<ZoneDarknetQueryResult> => {
  const res: ZoneDarknetQueryResult = {
    error: undefined,
    total: 0,
    items: [],
    page: 0,
    size: 0,
    id: "",
    maxPage: 0,
  };
  try {
    const resp = await req.post("/query/0.zone/darknet", data);
    const result = resp.data;
    if (result["code"] !== 200) {
      res.error = result["message"];
    } else {
      res.items = result["data"]["items"];
      res.total = result["data"]["total"];
      res.page = result["data"]["page"];
      res.size = result["data"]["size"];
      res.id = result["data"]["id"];
      res.maxPage = result["data"]["maxPage"];
    }
  } catch (err) {
    res.error = err;
  }
  return res;
};

export const $zoneDarknetQueryExport = async (id: string, page: number): Promise<Error> => {//返回错误信息，如果有
  const config: AxiosRequestConfig = {
    params: {
      id: id,
      page: page,
    },
  };
  try {
    const resp = await req.get("/export/0.zone/darknet", config);
    const result = resp.data;
    if (result["code"] !== 200) {
      return result["message"];
    }
  } catch (err) {
    return err;
  }
};

export const $zoneTGQuery = async (
  data: RequestDataType
): Promise<ZoneTGQueryResult> => {
  const res: ZoneTGQueryResult = {
    error: undefined,
    total: 0,
    items: [],
    page: 0,
    size: 0,
    id: "",
    maxPage: 0,
  };
  try {
    const resp = await req.post("/query/0.zone/aim", data);
    const result = resp.data;
    if (result["code"] !== 200) {
      res.error = result["message"];
    } else {
      res.items = result["data"]["items"];
      res.total = result["data"]["total"];
      res.page = result["data"]["page"];
      res.size = result["data"]["size"];
      res.id = result["data"]["id"];
      res.maxPage = result["data"]["maxPage"];
    }
  } catch (err) {
    res.error = err;
  }
  return res;
};

export const $zoneTGQueryExport = async (id: string, page: number): Promise<Error> => {//返回错误信息，如果有
  const config: AxiosRequestConfig = {
    params: {
      id: id,
      page: page,
    },
  };
  try {
    const resp = await req.get("/export/0.zone/aim", config);
    const result = resp.data;
    if (result["code"] !== 200) {
      return result["message"];
    }
  } catch (err) {
    return err;
  }
};

export const $quakeFieldQuery = async (fieldType: QueryType): Promise<{ error: Error, field: string[] }> => {
  const res: { error: Error, field: string[] } = {
    error: undefined,
    field: []
  };
  try {
    const resp = await req.get("/query/quake/field?type=" + fieldType);
    const result = resp.data;
    if (result["code"] !== 200) {
      res.error = result["message"];
    } else {
      res.field = result["data"];
    }
  } catch (err) {
    res.error = err;
  }
  return res;
};

export const $quakeRealtimeServiceQuery = async (
  data: QuakeRequestDataType
): Promise<RSDQueryResult> => {
  const res: RSDQueryResult = {
    error: undefined,
    total: 0,
    items: [],
    page: 0,
    size: 0,
    id: "",
    maxPage: 0,
  };
  try {
    const resp = await req.post("/query/quake/realtime/service", data);
    const result = resp.data;
    if (result["code"] !== 200) {
      res.error = result["message"];
    } else {
      res.items = result["data"]["items"];
      res.total = result["data"]["total"];
      res.page = result["data"]["page"];
      res.size = result["data"]["size"];
      res.id = result["data"]["id"];
      res.maxPage = result["data"]["maxPage"];
    }
  } catch (err) {
    res.error = err;
  }
  return res;
};

export const $quakeRealtimeHostQuery = async (
  data: RequestDataType
): Promise<RSDQueryResult> => {
  const res: RSDQueryResult = {
    error: undefined,
    total: 0,
    items: [],
    page: 0,
    size: 0,
    id: "",
    maxPage: 0,
  };
  try {
    const resp = await req.post("/query/quake/realtime/host", data);
    const result = resp.data;
    if (result["code"] !== 200) {
      res.error = result["message"];
    } else {
      res.items = result["data"]["items"];
      res.total = result["data"]["total"];
      res.page = result["data"]["page"];
      res.size = result["data"]["size"];
      res.id = result["data"]["id"];
      res.maxPage = result["data"]["maxPage"];
    }
  } catch (err) {
    res.error = err;
  }
  return res;
};

export const $quakeDeepServiceQuery = (data: any) =>
  req.post("/query/quake/deep/service", data);

export const $quakeDeepHostQuery = (data: any) =>
  req.post("/query/quake/deep/host", data);

export const $quakeRealtimeServiceExport = async (id: string, page: number, size: number): Promise<Error> => {//返回错误信息，如果有
  const config: AxiosRequestConfig = {
    params: {
      id: id,
      page: page,
      size: size
    },
  };
  try {
    const resp = await req.get("/export/quake/realtime/service", config);
    const result = resp.data;
    if (result["code"] !== 200) {
      return result["message"];
    }
  } catch (err) {
    return err;
  }
};

export const $quakeRealtimeServiceExportStatus = async (
  id: string
): Promise<ExportStatusType> => {
  const res: ExportStatusType = {
    error: undefined,
    filename: "",
    message: ""
  };
  try {
    const config: AxiosRequestConfig = {
      params: {
        id: id,
      },
    };
    const resp = await req.get("/exportStatus/quake", config);
    const result = resp.data;
    if (result["code"] !== 200) {
      res.error = result["message"];
    } else {
      res.message = result["data"]["message"];
      res.filename = result["data"]["filename"];
    }
  } catch (err) {
    res.error = err;
  }
  return res;
};

export const $tianYanChaSuggest = async (key: string): Promise<{ error: Error, items: SuggestItem[] }> => {
  const res: { error: Error, items: SuggestItem[] } = {
    error: undefined,
    items: undefined
  };
  try {
    const config: AxiosRequestConfig = {
      params: {
        key: key,
      },
    };
    const resp = await req.get("/query/tianYanCha/suggest", config)
    const result = resp.data;
    if (result["code"] !== 200) {
      res.error = result["message"]
      return res
    }
    res.items = result["data"]
    return res
  } catch (error) {
    res.error = error
    return res
  }
}

export const $tianYanChaBaseInfo = async (id: string): Promise<{ error: Error, baseInfo: BaseInfo }> => {
  const res: { error: Error, baseInfo: BaseInfo } = {
    error: undefined,
    baseInfo: undefined
  };
  try {
    const config: AxiosRequestConfig = {
      params: {
        id: id,
      },
    };
    const resp = await req.get("/query/tianYanCha/baseInfo", config)
    const result = resp.data;
    if (result["code"] !== 200) {
      res.error = result["message"]
      return res
    }
    res.baseInfo = result["data"]
    return res
  } catch (error) {
    res.error = error
    return res
  }
}

export const $tianYanChaSubsidiary = async (id: string): Promise<{ error: Error, subsidiary: SubsidiaryItem[] }> => {
  const res: { error: Error, subsidiary: SubsidiaryItem[] } = {
    error: undefined,
    subsidiary: undefined
  };
  try {
    const config: AxiosRequestConfig = {
      params: {
        id: id,
      },
    };
    const resp = await req.get("/query/tianYanCha/subsidiary", config)
    const result = resp.data;
    if (result["code"] !== 200) {
      res.error = result["message"]
      return res
    }
    res.subsidiary = result["data"]
    return res
  } catch (error) {
    res.error = error
    return res
  }
}

export const $tianYanChaShareholder = async (id: string): Promise<{ error: Error, shareholder: ShareholderItem[] }> => {
  const res: { error: Error, shareholder: ShareholderItem[] } = {
    error: undefined,
    shareholder: undefined
  };
  try {
    const config: AxiosRequestConfig = {
      params: {
        id: id,
      },
    };
    const resp = await req.get("/query/tianYanCha/shareholder", config)
    const result = resp.data;
    if (result["code"] !== 200) {
      res.error = result["message"]
      return res
    }
    res.shareholder = result["data"]
    return res
  } catch (error) {
    res.error = error
    return res
  }
}


export const $tianYanChaInvestment = async (id: string): Promise<{ error: Error, investment: InvestmentItem[] }> => {
  const res: { error: Error, investment: InvestmentItem[] } = {
    error: undefined,
    investment: undefined
  };
  try {
    const config: AxiosRequestConfig = {
      params: {
        id: id,
      },
    };
    const resp = await req.get("/query/tianYanCha/investment", config)
    const result = resp.data;
    if (result["code"] !== 200) {
      res.error = result["message"]
      return res
    }
    res.investment = result["data"]
    return res
  } catch (error) {
    res.error = error
    return res
  }
}

export const $tianYanChaSupplier = async (id: string): Promise<{ error: Error, supplier: SupplierItem[] }> => {
  const res: { error: Error, supplier: SupplierItem[] } = {
    error: undefined,
    supplier: undefined
  };
  try {
    const config: AxiosRequestConfig = {
      params: {
        id: id,
      },
    };
    const resp = await req.get("/query/tianYanCha/supplier", config)
    const result = resp.data;
    if (result["code"] !== 200) {
      res.error = result["message"]
      return res
    }
    res.supplier = result["data"]
    return res
  } catch (error) {
    res.error = error
    return res
  }
}

export const $tianYanChaWeibo = async (id: string): Promise<{ error: Error, weibo: WeiboItem[] }> => {
  const res: { error: Error, weibo: WeiboItem[] } = {
    error: undefined,
    weibo: undefined
  };
  try {
    const config: AxiosRequestConfig = {
      params: {
        id: id,
      },
    };
    const resp = await req.get("/query/tianYanCha/weibo", config)
    const result = resp.data;
    if (result["code"] !== 200) {
      res.error = result["message"]
      return res
    }
    res.weibo = result["data"]
    return res
  } catch (error) {
    res.error = error
    return res
  }
}

export const $tianYanChaApp = async (id: string): Promise<{ error: Error, app: AppItem[] }> => {
  const res: { error: Error, app: AppItem[] } = {
    error: undefined,
    app: undefined
  };
  try {
    const config: AxiosRequestConfig = {
      params: {
        id: id,
      },
    };
    const resp = await req.get("/query/tianYanCha/app", config)
    const result = resp.data;
    if (result["code"] !== 200) {
      res.error = result["message"]
      return res
    }
    res.app = result["data"]
    return res
  } catch (error) {
    res.error = error
    return res
  }
}

export const $tianYanChaWechat = async (id: string): Promise<{ error: Error, wechat: WechatItem[] }> => {
  const res: { error: Error, wechat: WechatItem[] } = {
    error: undefined,
    wechat: undefined
  };
  try {
    const config: AxiosRequestConfig = {
      params: {
        id: id,
      },
    };
    const resp = await req.get("/query/tianYanCha/wechat", config)
    const result = resp.data;
    if (result["code"] !== 200) {
      res.error = result["message"]
      return res
    }
    res.wechat = result["data"]
    return res
  } catch (error) {
    res.error = error
    return res
  }
}


export const quakeRealtimeHostDataExport = "/export/quake/realtime/host";
export const quakeDeepServicedDataExport = "/export/quake/deep/service";
export const quakeDeepHostDataExport = "/export/quake/deep/host";

export const allQueryStep1 = "/query/all/step1";
export const allQueryStep2 = "/query/all/step2";
export const $tianYanChaStep1 = (data: any) =>
  req.post("/query/tianYanCha/search", data);
export const $tianYanChaStep2 = (data: any) =>
  req.post("/query/tianYanCha/unitBranch", data);
export const tianYanChaStep3 = (data: any) =>
  req.post("/query/tianYanCha/unitIcpRecord", data);
export const getExternalIp = () => req.get("/query/externalIp");

export const batchHttp = "/query/batchHttp";

export const $checkUpdate = () => req.get("/checkUpdate");

export const $getDownloadLog = async (start: number, limit: number): Promise<{ items: DownloadLogItem[], error: Error }> => {
  const res: { items: DownloadLogItem[], error: Error } = {
    items: [],
    error: undefined
  };
  const config: AxiosRequestConfig = {
    params: {
      start: start,
      limit: limit,
      action: "get"
    },
  };
  try {
    const resp = await req.get("/downloadLog", config);
    const result = resp.data;
    if (result["code"] !== 200) {
      res.error = result["message"];
    } else {
      res.items = result["data"];
    }
  } catch (err) {
    res.error = err;
  }
  return res;
};

export const $clearDownloadLog = async (): Promise<Error> => {
  try {
    const config: AxiosRequestConfig = {
      params: {
        action: "clear"
      },
    };
    const resp = await req.get("/downloadLog", config);
    const result = resp.data;
    if (result["code"] !== 200) {
      return result["message"];
    }
  } catch (err) {
    return err
  }
  return undefined;
};

export const $removeDownloadLogItem = async (filename: string, dir: string): Promise<Error> => {
  const config: AxiosRequestConfig = {
    params: {
      filename: filename,
      dir: dir,
      action: "remove"
    },
  };
  try {
    const resp = await req.get("/downloadLog", config);
    const result = resp.data;
    if (result["code"] !== 200) {
      return result["message"];
    }
  } catch (err) {
    return err
  }
  return undefined;
};