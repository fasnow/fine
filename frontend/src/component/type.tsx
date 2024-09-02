//"微信小程序" "微信公众号(含小程序)"
export type MsgOfWechatType = {
  iconUrl: string    //logo
  code: string   //公众号二维码
  introduction: string,//描述/说明
  mini_program: {
    appid: string,
    certified_text: string, //账号主体
    desc: string,           //描述
    headimg_url: string,  //favicon
    nickname: string,
  }[]
  wechat_id: string //微信公众号id
}

// 微信小程序
export type MsgOfMiniProgramType = {
  iconUrl: string //logo
  code: string //公众号二维码
  introduction: string //描述/说明
  app_id: string //微信公众号id
}

// 安卓apk
export type MsgOfApkType = {
  app_url: string
  iconUrl: string
  introduction: string
}
export interface ZoneEmailItemType {
  email: string
  email_type: string
  group: string//所属集团
  source: string[]//来源 
  timestamp: string//更新时间
}

export interface ZoneMemberItemType {
  name: string
  position: string[]
  introduction: string
  source: string    //来源
  timestamp: string   //入库时间
  company: string   //所属集团
}



export const QUERY_FIRST = "查询后再导出"
export const ISSUE_URL = "https://github.com/fasnow/fine/issues"
export const GITHUB_URL = "https://github.com/fasnow/fine/"


