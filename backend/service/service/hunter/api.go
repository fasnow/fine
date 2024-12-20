package hunter

import (
	"errors"
	"fine/backend/logger"
	"fine/backend/service/model/hunter"
	"fine/backend/service/service"
	"fine/backend/utils"
	"fmt"
	"github.com/goccy/go-json"
	"io"
	"net/http"
	"strconv"
	"strings"
)

type Result struct {
	AccountType  string         `json:"accountType"`  //账号类型
	ConsumeQuota int            `json:"consumeQuota"` //消耗积分
	RestQuota    int            `json:"restQuota"`    //今日剩余积分
	SyntaxPrompt string         `json:"syntaxPrompt"`
	Total        int64          `json:"total"` //资产总数
	PageNum      int            `json:"pageNum"`
	PageSize     int            `json:"pageSize"`
	Items        []*hunter.Item `json:"items"`
}

//type Component struct {
//	Name    string `json:"name"`    //组件名称
//	Number string `json:"version"` //组件版本
//}
//
//type Item struct {
//	IsRisk         string      `json:"is_risk"`          //风险资产
//	URL            string      `json:"url"`              //url
//	IP             string      `json:"ip"`               //IP
//	Port           int         `json:"port"`             //端口
//	WebTitle       string      `json:"web_title"`        //网站标题
//	Domain         string      `json:"domain"`           //域名
//	IsRiskProtocol string      `json:"is_risk_protocol"` //高危协议
//	Protocol       string      `json:"protocol"`         //协议
//	BaseProtocol   string      `json:"base_protocol"`    //通讯协议
//	StatusCode     int         `json:"status_code"`      //网站状态码
//	Component      []Component `json:"component"`
//	Os             string      `json:"os"`                 //操作系统
//	Company        string      `json:"company"`            //备案单位
//	Number         string      `json:"number"`             //备案号
//	Country        string      `json:"country,omitempty"`  ////这三个字段
//	Province       string      `json:"province,omitempty"` ////合并保留一个
//	City           string      `json:"city"`               ////city字段即可
//	UpdatedAt      string      `json:"updated_at"`         //探查时间
//	IsWeb          string      `json:"is_web"`             //web资产
//	AsOrg          string      `json:"as_org"`             //注册机构
//	Isp            string      `json:"isp"`                //运营商信息
//	Banner         string      `json:"banner"`
//}

func (r *Hunter) Get(req *GetDataReq) (*Result, error) {
	req.req.QueryParams.Set("api-key", r.key)
	url := fmt.Sprintf("%v?%s", HunterApiUrl, req.req.QueryParams.Encode())
	request, err := http.NewRequest("GET", url, nil)
	if err != nil {
		logger.Info(err.Error())
		return nil, err
	}
	response, err := r.http.Do(request)
	if err != nil {
		logger.Info(err.Error())
		return nil, err
	}
	if response.StatusCode != 200 {
		return nil, service.NonStatusOK
	}
	body, err := io.ReadAll(response.Body)
	if err != nil {
		logger.Info(err.Error())
		return nil, err
	}
	var tmpResponse struct {
		Code int `json:"code"`
		Data struct {
			AccountType  string         `json:"account_type"`
			Total        int64          `json:"total"`
			Time         int            `json:"time"`
			Arr          []*hunter.Item `json:"arr"`
			ConsumeQuota string         `json:"consume_quota"`
			RestQuota    string         `json:"rest_quota"`
			SyntaxPrompt string         `json:"syntax_prompt"`
		} `json:"data"`
		Message string `json:"message"`
	}
	err = json.Unmarshal(body, &tmpResponse)
	if err != nil {
		logger.Info(err.Error())
		return nil, err
	}
	if tmpResponse.Code == 429 {
		return nil, errors.New(tmpResponse.Message)
	}
	if tmpResponse.Code != 200 {
		return nil, errors.New(tmpResponse.Message)
	}
	page, err := strconv.Atoi(req.req.QueryParams.Get("page"))
	if err != nil {
		logger.Info("无法解析字段: " + err.Error())
		return nil, err
	}
	size, err := strconv.Atoi(req.req.QueryParams.Get("page_size"))
	if err != nil {
		logger.Info("无法解析字段: " + err.Error())
		return nil, err
	}
	var result Result
	consumeQuota, _ := strings.CutPrefix(tmpResponse.Data.ConsumeQuota, "消耗积分：")
	restQuota, _ := strings.CutPrefix(tmpResponse.Data.RestQuota, "今日剩余积分：")
	result.AccountType = tmpResponse.Data.AccountType
	result.ConsumeQuota, _ = strconv.Atoi(consumeQuota)
	result.RestQuota, _ = strconv.Atoi(restQuota)
	result.SyntaxPrompt = tmpResponse.Data.SyntaxPrompt
	result.PageNum = page
	result.PageSize = size
	result.Total = tmpResponse.Data.Total
	result.Items = tmpResponse.Data.Arr
	if result.Items == nil {
		result.Items = make([]*hunter.Item, 0)
	}
	return &result, nil
}

func (r *Hunter) Export(items []*hunter.Item, filename string) error {
	if len(items) == 0 {
		return nil
	}
	var headers = []any{"ID", "DOMAIN", "Port", "IP", "URL", "Protocol", "Title", "Status_Code", "Company", "Component",
		"Icp", "os", "Banner", "Is_Risk", "Is_Web", "Location", "As_Org", "Isp", "Updated_At"}
	var data = [][]any{headers}
	for i, item := range items {
		var tmpComponent []string
		for _, comp := range item.Component {
			tmpComponent = append(tmpComponent, comp.Name+" "+comp.Version)
		}
		var location []string
		if item.Country != "" {
			location = append(location, item.Country)
		}
		if item.Province != "" {
			location = append(location, item.Province)
		}
		if item.City != "" {
			location = append(location, item.City)
		}
		var tmpItem = []any{
			i + 1,
			item.Domain,
			item.Port,
			item.IP,
			item.URL,
			item.Protocol,
			item.WebTitle,
			item.StatusCode,
			item.Company,
			strings.Join(tmpComponent, "\n"),
			item.Number,
			item.Os,
			item.Banner,
			item.IsRisk,
			item.IsWeb,
			strings.Join(location, " "),
			item.AsOrg,
			item.Isp,
			item.UpdatedAt,
		}
		data = append(data, tmpItem)
	}
	if err := utils.SaveToExcel(data, filename); err != nil {
		logger.Info("保存文件至本地失败: " + err.Error())
		return err
	}
	return nil
}
