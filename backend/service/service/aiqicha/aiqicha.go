package aiqicha

import (
	"encoding/json"
	"errors"
	"fine/backend/proxy/v2"
	"fine/backend/service/service"
	"fine/backend/utils"
	"github.com/tidwall/gjson"
	"net/http"
	"net/url"
	"strconv"
	"strings"
)

const BaseAPIUrl = "https://aiqicha.baidu.com"

type AiQiCha struct {
	http         *http.Client
	proxyManager *proxy.Manager
	cookie       string
}

func New(token string) *AiQiCha {
	return &AiQiCha{
		http:   &http.Client{},
		cookie: token,
	}
}

func (r *AiQiCha) UseProxyManager(manager *proxy.Manager) {
	r.proxyManager = manager
	r.http = manager.GetClient()
}

func (r *AiQiCha) SetAuth(cookie string) {
	r.cookie = cookie
}

func (r *AiQiCha) GenAuthQueryParam() url.Values {
	return url.Values{}
}

type IndustryNode struct {
	Value     string          `json:"value"`
	Label     string          `json:"label"`
	ChildList []*IndustryNode `json:"childList,omitempty"`
}

func (c *IndustryNode) UnmarshalJSON(data []byte) error {
	type Alias IndustryNode
	aux := &struct {
		Name string `json:"name"`
		*Alias
	}{
		Alias: (*Alias)(c),
	}

	if err := json.Unmarshal(data, &aux); err != nil {
		return err
	}

	// 将 `name` 映射到 `label`
	c.Label = aux.Name
	return nil
}

type AreaNode struct {
	Value     string      `json:"value"`
	Label     string      `json:"label"`
	ChildList []*AreaNode `json:"childList,omitempty"`
}

func (c *AreaNode) UnmarshalJSON(data []byte) error {
	type Alias AreaNode
	aux := &struct {
		Name string `json:"name"`
		*Alias
	}{
		Alias: (*Alias)(c),
	}

	if err := json.Unmarshal(data, &aux); err != nil {
		return err
	}

	// 将 `name` 映射到 `label`
	c.Label = aux.Name
	return nil
}

func (r *AiQiCha) request(req *service.Request, auth bool) ([]byte, error) {
	req.BodyParams.Decorate(req)
	req.Header.Add("Referer", BaseAPIUrl)
	req.Header.Add("User-Agent", proxy.DefaultUA)
	if auth {
		req.Header.Add("Cookie", r.cookie)
	}
	bytes, err := req.Fetch(r.http, BaseAPIUrl, func(response *http.Response) error {
		if response.StatusCode != 200 {
			return errors.New(strconv.Itoa(response.StatusCode))
		}
		return nil
	})
	return bytes, err
}

func (r *AiQiCha) requestWithoutAuth(req *service.Request) ([]byte, error) {
	return r.request(req, false)
}

func (r *AiQiCha) requestWithAuth(req *service.Request) ([]byte, error) {
	return r.request(req, true)
}

type SuggestItem struct {
	Pid         string `json:"pid"`
	LegalPerson string `json:"legalPerson"`
	ResultStr   string `json:"resultStr"`
	Name        string `json:"name"`
}

func (r *AiQiCha) Suggest(key string) ([]SuggestItem, error) {
	req := service.NewRequest()
	req.Method = "POST"
	req.Path = "/index/suggest"
	req.BodyParams.Set("q", key)
	bytes, err := r.requestWithAuth(req)
	if err != nil {
		return nil, err
	}
	tt := string(bytes)
	var status = gjson.Get(tt, "status").Num
	if status != 0 {
		var message = gjson.Get(tt, "msg").String()
		return nil, errors.New(message)
	}
	var suggestItem = make([]SuggestItem, 0)
	var companySuggestList = gjson.Get(tt, "data.queryList").Array()
	for _, company := range companySuggestList {
		var item SuggestItem
		err := json.Unmarshal([]byte(company.Raw), &item)
		if err != nil {
			continue
		}
		item.Name = strings.ReplaceAll(item.ResultStr, "<em>", "")
		item.Name = strings.ReplaceAll(item.Name, "</em>", "")
		suggestItem = append(suggestItem, item)
	}
	return suggestItem, nil
}

type Penetration struct {
	Shareholders  []Shareholder  `json:"shareholders"`
	InvestRecords []InvestRecord `json:"investRecords"`
}

type Shareholder struct {
	Pid         string `json:"pid"`
	Name        string `json:"name"`
	SubRate     string `json:"subRate"`
	Logo        string `json:"logo"`
	LogoWord    string `json:"logoWord"`
	SubMoney    string `json:"subMoney"`
	PersonLink  string `json:"personLink"`
	PersonID    string `json:"personId"`
	PersonLogo  string `json:"personLogo"`
	Shareholder bool   `json:"shareholder"`
}

type InvestRecord struct {
	Pid        string `json:"pid"`
	EntName    string `json:"entName"`
	Logo       string `json:"logo"`
	LogoWord   string `json:"logoWord"`
	RegRate    string `json:"regRate"`
	RegCapital string `json:"regCapital"`
	Investment bool   `json:"investment"`
	Yid        string `json:"yid"`
}

func (r *AiQiCha) GetStockChart(pid, drill string) (*Penetration, error) {
	req := service.NewRequest()
	req.Method = "GET"
	req.Path = "/stockchart/stockchartAjax"
	req.QueryParams.Set("pid", pid)
	req.QueryParams.Set("drill", drill)
	bytes, err := r.requestWithAuth(req)
	if err != nil {
		return nil, err
	}
	tt := string(bytes)
	var status = gjson.Get(tt, "status").Num
	if status != 0 {
		var message = gjson.Get(tt, "msg").String()
		return nil, errors.New(message)
	}
	var shareholders = make([]Shareholder, 0)
	for _, shareholder := range gjson.Get(tt, "data.shareholdersData.list").Array() {
		var item Shareholder
		err := json.Unmarshal([]byte(shareholder.Raw), &item)
		if err != nil {
			continue
		}
		shareholders = append(shareholders, item)
	}
	var investRecords = make([]InvestRecord, 0)
	for _, investRecord := range gjson.Get(tt, "data.investRecordData.list").Array() {
		var item InvestRecord
		err := json.Unmarshal([]byte(investRecord.Raw), &item)
		if err != nil {
			continue
		}
		investRecords = append(investRecords, item)
	}
	return &Penetration{
		Shareholders:  shareholders,
		InvestRecords: investRecords,
	}, nil
}

func (r *AiQiCha) GetShareholder(pid string) ([]Shareholder, error) {
	stockChart, err := r.GetStockChart(pid, "0")
	if err != nil {
		return nil, err
	}
	return stockChart.Shareholders, nil
}

func (r *AiQiCha) GetInvestRecord(pid string) ([]InvestRecord, error) {
	stockChart, err := r.GetStockChart(pid, "0")
	if err != nil {
		return nil, err
	}
	return stockChart.InvestRecords, nil
}

type Copyright struct {
	SoftwareName string `json:"softwareName"`
	ShortName    string `json:"shortName"`
	BatchNum     string `json:"batchNum"`
	SoftwareType string `json:"softwareType"`
	TypeCode     string `json:"typeCode"`
	RegDate      string `json:"regDate"`
	SoftwareWork string `json:"softwareWork"`
	RegNo        string `json:"regNo"`
	FirstDate    string `json:"firstDate"`
	Nationality  string `json:"nationality"`
	SoftID       string `json:"softId"`
	DetailURL    string `json:"detailUrl"`
}

type CopyrightDetail struct {
	SoftwareName string `json:"softwareName"`
	ShortName    string `json:"shortName"`
	BatchNum     string `json:"batchNum"`
	SoftwareType string `json:"softwareType"`
	TypeCode     string `json:"typeCode"`
	RegNo        string `json:"regNo"`
	RegDate      string `json:"regDate"`
	SoftwareWork string `json:"softwareWork"`
	FirstDate    string `json:"firstDate"`
	Nationality  string `json:"nationality"`
}

// GetCopyrightList 获取产品
func (r *AiQiCha) GetCopyrightList(pid string, pageNum, pageSize int) (total int64, list []*Copyright, err error) {
	req := service.NewRequest()
	req.Method = "GET"
	req.Path = "/cs/copyrightAjax"
	req.QueryParams.Set("pid", pid)
	req.QueryParams.Set("p", strconv.Itoa(pageNum))
	req.QueryParams.Set("size", strconv.Itoa(pageSize))
	bytes, err := r.requestWithAuth(req)
	if err != nil {
		return 0, nil, err
	}
	tt := string(bytes)
	var status = gjson.Get(tt, "status").Num
	if status != 0 {
		var message = gjson.Get(tt, "msg").String()
		return 0, nil, errors.New(message)
	}
	total = gjson.Get(tt, "data.total").Int()
	list = make([]*Copyright, 0)
	for _, copyright := range gjson.Get(tt, "data.list").Array() {
		var cr = &Copyright{}
		if err := json.Unmarshal([]byte(copyright.Raw), &cr); err != nil {
			continue
		}
		list = append(list, cr)
	}
	return total, list, nil
}

type Branch struct {
	EntName string `json:"entName"`
	//Logo                string `json:"logo"`
	//LogoWord            string `json:"logoWord"`
	//EntCoreName         string `json:"entCoreName"`
	LegalPerson string `json:"legalPerson"`
	//PersonLink          string `json:"personLink"`
	//PersonID            string `json:"personId"`
	//LegalPersonLogo     string `json:"legalPersonLogo"`
	//LegalPersonLogoWord string `json:"legalPersonLogoWord"`
	//CompNum             int    `json:"compNum"`
	//CompNumLink         string `json:"compNumLink"`
	StartDate string `json:"startDate"`
	//RegCapital          string `json:"regCapital"`
	//OpenStatus          string `json:"openStatus"`
	//Pid                 string `json:"pid"`
	//EntLink             string `json:"entLink"`
}

// GetBranchList 获取分公司
func (r *AiQiCha) GetBranchList(pid string, pageNum, pageSize int) (total int64, list []*Branch, err error) {
	req := service.NewRequest()
	req.Method = "GET"
	req.Path = "/detail/branchajax"
	req.QueryParams.Set("pid", pid)
	req.QueryParams.Set("p", strconv.Itoa(pageNum))
	req.QueryParams.Set("size", strconv.Itoa(pageSize))
	req.QueryParams.Set("f", "{\"openStatus\":\"开业\"}")
	bytes, err := r.requestWithAuth(req)
	if err != nil {
		return 0, nil, err
	}
	tt := string(bytes)
	var status = gjson.Get(tt, "status").Num
	if status != 0 {
		var message = gjson.Get(tt, "msg").String()
		return 0, nil, errors.New(message)
	}
	total = gjson.Get(tt, "data.total").Int()
	list = make([]*Branch, 0)
	for _, branch := range gjson.Get(tt, "data.list").Array() {
		var copyright = &Branch{}
		if err := json.Unmarshal([]byte(branch.Raw), &copyright); err != nil {
			continue
		}
		list = append(list, copyright)
	}
	return total, list, nil
}

func (r *AiQiCha) ExportCopyrights(items []*Copyright, outputFilepath string) error {
	var headers = []any{"序号", "软件名称", "软件简称", "版本号", "软件著作分类", "行业分类", "登记日期", "软件著作人", "登记号", "首次发表日期", "国籍"}
	var data = [][]any{headers}
	for i, item := range items {
		var tmpItem = []any{
			i + 1,
			item.SoftwareName,
			item.ShortName,
			item.BatchNum,
			item.SoftwareType,
			item.TypeCode,
			item.RegDate,
			item.SoftwareWork,
			item.RegNo,
			item.FirstDate,
			item.Nationality,
		}
		data = append(data, tmpItem)
	}
	return utils.SaveToExcel(data, outputFilepath)
}

func (r *AiQiCha) ExportBranches(items []*Branch, outputFilepath string) error {
	var headers = []any{"序号", "企业名称", "负责人", "成立日期"}
	var data = [][]any{headers}
	for i, item := range items {
		var tmpItem = []any{
			i + 1,
			item.EntName,
			item.LegalPerson,
			item.StartDate,
		}
		data = append(data, tmpItem)
	}
	return utils.SaveToExcel(data, outputFilepath)
}
