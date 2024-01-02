package tianyancha

import (
	"github.com/fasnow/ghttp"
)

const (
	companySuggestUrl    = "https://capi.tianyancha.com/cloud-tempest/search/suggest/v3"                                //获取企业ID
	getCompanyInfoUrl    = "https://capi.tianyancha.com/cloud-other-information/companyinfo/baseinfo/web"               //获取基本信息
	getSubsidiaryUrl     = "https://capi.tianyancha.com/cloud-company-background/company/branchList"                    //根据企业ID获取子公司
	icpRecordQueryApiUrl = "https://capi.tianyancha.com/cloud-intellectual-property/intellectualProperty/icpRecordList" // icpRecordQueryApiUrl 第二步，根据企业ID获取子公司
	equityTreeUrl        = "https://capi.tianyancha.com/tyc-enterprise-graph/ei/get/penetration/slow/list/single"       //根据企业ID获取股权信息
	getShareholderUrl    = "https://capi.tianyancha.com/cloud-company-background/companyV2/dim/holderForWeb"
	getInvesteeUrl       = "https://capi.tianyancha.com/cloud-company-background/company/investListV2"
	getWeiboUrl          = "https://capi.tianyancha.com/cloud-business-state/weibo/list"
	getAppUrl            = "https://capi.tianyancha.com/cloud-business-state/v3/ar/appbkinfo"
	getSupplierUrl       = "https://capi.tianyancha.com/cloud-business-state/supply/summaryList"
	getWechatUrl         = "https://capi.tianyancha.com/cloud-business-state/wechat/list"
)

type TianYanCha struct {
	token      string
	http       *ghttp.Client
	queryDepth int
}

func NewClient() *TianYanCha {
	client := &TianYanCha{
		http: &ghttp.Client{},
	}
	return client
}
