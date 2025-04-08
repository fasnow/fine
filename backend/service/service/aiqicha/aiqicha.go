package aiqicha

import (
	"encoding/json"
	"errors"
	"fine/backend/service/service"
	"fine/backend/utils"
	"fmt"
	"github.com/fasnow/goproxy"
	"github.com/tidwall/gjson"
	"github.com/xuri/excelize/v2"
	"math"
	"net/http"
	"net/url"
	"path/filepath"
	"strconv"
	"strings"
)

const BaseAPIUrl = "https://aiqicha.baidu.com"

type AiQiCha struct {
	http         *http.Client
	proxyManager *goproxy.GoProxy
	cookie       string
}

func New(token string) *AiQiCha {
	return &AiQiCha{
		http:   &http.Client{},
		cookie: token,
	}
}

func (r *AiQiCha) UseProxyManager(manager *goproxy.GoProxy) {
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
	req.Header.Add("User-Agent", goproxy.DefaultUA)
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
	Pid          string `json:"pid"`
	EntName      string `json:"entName"`
	Logo         string `json:"logo"`
	LogoWord     string `json:"logoWord"`
	RegRate      string `json:"regRate"`
	RegCapital   string `json:"regCapital"`
	Investment   bool   `json:"investment"`
	CancelStatus string `json:"cancelStatus"`
	Yid          string `json:"yid"`
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
		if item.CancelStatus == "注销" {
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

// GetCopyrights 获取产品，pageSize最大为10
func (r *AiQiCha) GetCopyrights(pid string, pageNum, pageSize int) (total int64, list []*Copyright, err error) {
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
	Logo    string `json:"logo"`
	//LogoWord    string `json:"logoWord"`
	//EntCoreName string `json:"entCoreName"`
	LegalPerson string `json:"legalPerson"`
	//PersonLink          string `json:"personLink"`
	//PersonID            string `json:"personId"`
	//LegalPersonLogo string `json:"legalPersonLogo"`
	//LegalPersonLogoWord string `json:"legalPersonLogoWord"`
	//CompNum             int    `json:"compNum"`
	//CompNumLink         string `json:"compNumLink"`
	StartDate  string `json:"startDate"`
	RegCapital string `json:"regCapital"`
	OpenStatus string `json:"openStatus"`
	Pid        string `json:"pid"`
	//EntLink    string `json:"entLink"`
}

// GetBranches 获取分公司
func (r *AiQiCha) GetBranches(pid string, pageNum, pageSize int) (total int64, list []*Branch, err error) {
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
		var t = &Branch{}
		if err := json.Unmarshal([]byte(branch.Raw), &t); err != nil {
			continue
		}
		list = append(list, t)
	}
	return total, list, nil
}

type ICP struct {
	Domain   []string `json:"domain"`
	HomeSite []string `json:"homeSite"`
	IcpNo    string   `json:"icpNo"`
	SiteName string   `json:"siteName"`
}

// GetICPs 获取备案信息
func (r *AiQiCha) GetICPs(pid string, pageNum, pageSize int) (int64, []*ICP, error) {
	req := service.NewRequest()
	req.Method = "GET"
	req.Path = "/cs/icpInfoAjax"
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
	total := gjson.Get(tt, "data.total").Int()
	list := make([]*ICP, 0)
	for _, branch := range gjson.Get(tt, "data.list").Array() {
		var icp = &ICP{}
		if err := json.Unmarshal([]byte(branch.Raw), &icp); err != nil {
			continue
		}
		list = append(list, icp)
	}
	return total, list, nil
}

type HeadInfo struct {
	Pid                string      `json:"pid"`
	Yid                string      `json:"yid"`
	EntName            string      `json:"entName"`
	RegAddr            string      `json:"regAddr"`
	Addr               string      `json:"addr"`
	Scope              string      `json:"scope"`
	OpenStatus         string      `json:"openStatus"`
	LegalPerson        string      `json:"legalPerson"`
	PersonTitle        string      `json:"personTitle"`
	StartDate          string      `json:"startDate"`
	RegCapital         string      `json:"regCapital"`
	PrinType           int         `json:"prinType"`
	CancelStatus       string      `json:"cancelStatus"`
	StyleStatus        int         `json:"styleStatus"`
	LicenseNumber      string      `json:"licenseNumber"`
	UnifiedCode        string      `json:"unifiedCode"`
	TaxNo              string      `json:"taxNo"`
	EntLogoWord        string      `json:"entLogoWord"`
	PersonLink         string      `json:"personLink"`
	PersonID           string      `json:"personId"`
	GeoInfo            GeoInfo     `json:"geoInfo"`
	IsClaim            int         `json:"isClaim"`
	ClaimURL           string      `json:"claimUrl"`
	Email              string      `json:"email"`
	PhoneinfoCount     int         `json:"phoneinfoCount"`
	Telephone          string      `json:"telephone"`
	Phoneinfo          []Phoneinfo `json:"phoneinfo"`
	PhoneNianbaoCount  int         `json:"phoneNianbaoCount"`
	PhoneQuanWangCount int         `json:"phoneQuanWangCount"`
	Emailinfo          []Emailinfo `json:"emailinfo"`
	Labels             Labels      `json:"labels"`
}

type GeoInfo struct {
	Lng float64 `json:"lng"`
	Lat float64 `json:"lat"`
}

type Phoneinfo struct {
	Phone          string `json:"phone"`
	Desc           string `json:"desc"`
	Ismobile       int    `json:"ismobile"`
	HideButton     int    `json:"hideButton"`
	PhoneCompCount int    `json:"phoneCompCount"`
}

type Emailinfo struct {
	Email string `json:"email"`
	Desc  string `json:"desc"`
}

type ContentList struct {
	Title   string   `json:"title"`
	Content []string `json:"content"`
}

type Closed struct {
	Text        string        `json:"text"`
	Style       string        `json:"style"`
	FontColor   string        `json:"fontColor"`
	BgColor     string        `json:"bgColor"`
	ContentList []ContentList `json:"contentList"`
}

type SelfRisk struct {
	Text      string `json:"text"`
	FontColor string `json:"fontColor"`
	Total     int    `json:"total"`
	BgColor   string `json:"bgColor"`
	Icon      string `json:"icon"`
	Link      string `json:"link"`
	Style     string `json:"style"`
}

type Labels struct {
	Closed   Closed   `json:"closed"`
	SelfRisk SelfRisk `json:"selfRisk"`
}

func (r *AiQiCha) HeadInfo(pid string) (*HeadInfo, error) {
	req := service.NewRequest()
	req.Method = "POST"
	req.Path = "/compdata/headinfoAjax"
	req.BodyParams.Set("pid", pid)
	bodyBytes, err := r.requestWithAuth(req)
	if err != nil {
		return nil, err
	}
	headInfo := &HeadInfo{}
	if err := json.Unmarshal([]byte(gjson.Get(string(bodyBytes), "data").String()), headInfo); err != nil {
		return nil, err
	}
	return headInfo, nil
}

type ExportNode struct {
	InvestRecord
	Copyrights    []*Copyright
	Branches      []*Branch
	ICPs          []*ICP
	ChildrenNodes []*ExportNode
}

// GetInvestRecordByDepthAndRate 根据pid获取深度为depth的控股公司, 小于0获取所有，出错返回当前结果
func (r *AiQiCha) GetInvestRecordByDepthAndRate(pid string, depth int, minRate, maxRate float64) (*ExportNode, error) {
	// 获取根节点信息
	headInfo, err := r.HeadInfo(pid)
	if err != nil {
		return nil, err
	}

	root := &ExportNode{
		InvestRecord: InvestRecord{
			Pid:          headInfo.Pid,
			EntName:      headInfo.EntName,
			LogoWord:     headInfo.EntLogoWord,
			RegCapital:   headInfo.RegCapital,
			CancelStatus: headInfo.CancelStatus,
			Yid:          headInfo.Yid,
		},
		ChildrenNodes: []*ExportNode{},
	}

	if depth == 0 {
		return root, nil
	}

	// 使用队列进行广度优先遍历
	type queueItem struct {
		node  *ExportNode
		level int
	}

	queue := []queueItem{{root, 1}}
	visited := map[string]bool{pid: true}

	for len(queue) > 0 {
		current := queue[0]
		queue = queue[1:]

		// 如果超过指定深度，停止处理
		if depth > 0 && current.level > depth {
			break
		}

		// 获取当前节点的投资记录
		records, err := r.GetInvestRecord(current.node.Pid)
		if err != nil {
			return root, err
		}

		// 处理当前层级的节点
		for _, record := range records {
			if record.CancelStatus == "注销" || record.Pid == "" || record.Pid == current.node.Pid {
				continue
			}
			regRate := utils.ParsePercentage(record.RegRate)
			if regRate < minRate || regRate > maxRate {
				continue
			}

			// 如果已经访问过，跳过
			if visited[record.Pid] {
				continue
			}
			visited[record.Pid] = true

			// 创建子节点
			child := &ExportNode{
				InvestRecord:  record,
				ChildrenNodes: []*ExportNode{},
			}

			// 添加到当前节点的子节点列表
			current.node.ChildrenNodes = append(current.node.ChildrenNodes, child)

			// 如果是无限深度或未达到指定深度，加入队列继续处理
			if depth < 0 || current.level < depth {
				queue = append(queue, queueItem{child, current.level + 1})
			}
		}
	}

	return root, nil
}

// GetAllCopyrights 根据pid获取所有产品信息，出错返回当前结果
func (r *AiQiCha) GetAllCopyrights(pid string) ([]*Copyright, error) {
	var allCopyrights []*Copyright
	total, copyrights, err := r.GetCopyrights(pid, 1, 10)
	if err != nil {
		return nil, err
	}
	allCopyrights = append(allCopyrights, copyrights...)
	totalPage := int(math.Ceil(float64(total) / 10.0))
	for i := 2; i <= totalPage; i++ {
		_, copyrights, err = r.GetCopyrights(pid, i, 10)
		if err != nil {
			return allCopyrights, err
		}
		allCopyrights = append(allCopyrights, copyrights...)
	}
	return allCopyrights, nil
}

// GetAllBranches 根据pid获取所有分公司，出错返回当前结果
func (r *AiQiCha) GetAllBranches(pid string) ([]*Branch, error) {
	var allBranches []*Branch
	total, branches, err := r.GetBranches(pid, 1, 1000)
	if err != nil {
		return nil, err
	}
	allBranches = append(allBranches, branches...)
	totalPage := int(math.Ceil(float64(total) / 1000.0))
	for i := 2; i <= totalPage; i++ {
		_, branches, err = r.GetBranches(pid, i, 1000)
		if err != nil {
			return allBranches, err
		}
		allBranches = append(allBranches, branches...)
	}
	return allBranches, nil
}

// GetAllICPs 根据pid获取所有备案信息，出错返回当前结果
func (r *AiQiCha) GetAllICPs(pid string) ([]*ICP, error) {
	var allICPs []*ICP
	total, _, err := r.GetICPs(pid, 1, 1)
	if err != nil {
		return nil, err
	}

	// 腾讯备案1k多点所以一次性全部查询
	_, icps, err := r.GetICPs(pid, 1, int(total))
	allICPs = append(allICPs, icps...)
	return allICPs, nil
}

// GetInvestTree 根据pid获取深度为depth的控股公司, 小于0获取所有，包含分公司和软件著作，出错返回当前结果
func (r *AiQiCha) GetInvestTree(pid string, depth int, minRate, maxRate float64, dataTypes []string) (*ExportNode, error) {
	root, err := r.GetInvestRecordByDepthAndRate(pid, depth, minRate, maxRate)
	if err != nil {
		return root, err
	}
	if root == nil {
		return nil, nil
	}

	// 广度优先获取软件著作
	queue := []*ExportNode{root}
	currentLevel := 0
	if utils.StringSliceContain(dataTypes, "copyright") {
		for len(queue) > 0 {
			levelSize := len(queue)
			for i := 0; i < levelSize; i++ {
				node := queue[0]
				queue = queue[1:]

				copyrights, err := r.GetAllCopyrights(node.Pid)
				node.Copyrights = copyrights
				if err != nil {
					return root, err
				}

				// 将子节点加入队列
				for _, child := range node.ChildrenNodes {
					queue = append(queue, child)
				}
			}
			currentLevel++
		}
	}

	// 广度优先获取备案信息
	queue = []*ExportNode{root}
	currentLevel = 0
	if utils.StringSliceContain(dataTypes, "icp") {
		for len(queue) > 0 {
			levelSize := len(queue)
			for i := 0; i < levelSize; i++ {
				node := queue[0]
				queue = queue[1:]

				icps, err := r.GetAllICPs(node.Pid)
				node.ICPs = icps
				if err != nil {
					return root, err
				}

				// 将子节点加入队列
				for _, child := range node.ChildrenNodes {
					queue = append(queue, child)
				}
			}
			currentLevel++
		}
	}

	// 广度优先获取分公司
	queue = []*ExportNode{root}
	currentLevel = 0
	if utils.StringSliceContain(dataTypes, "branch") {
		for len(queue) > 0 {
			levelSize := len(queue)
			for i := 0; i < levelSize; i++ {
				node := queue[0]
				queue = queue[1:]

				branches, err := r.GetAllBranches(node.Pid)
				node.Branches = branches
				if err != nil {
					return root, err
				}

				// 将子节点加入队列
				for _, child := range node.ChildrenNodes {
					queue = append(queue, child)
				}
			}
			currentLevel++
		}
	}

	return root, nil
}

func (r *AiQiCha) Export(root *ExportNode, outputFilepath string) error {
	f := excelize.NewFile()
	defer f.Close()

	// 创建主工作表
	sheetName := "公司投资结构"
	index, err := f.NewSheet(sheetName)
	if err != nil {
		return fmt.Errorf("创建工作表失败: %w", err)
	}

	// 设置主表头（扩展包含版权和分支机构信息）
	mainHeaders := []string{
		"序号", "层级", "关联PID", "PID", "企业名称", "投资比例", "注册资本", "状态", "版权数量", "分支机构数量", "Logo",
	}
	for col, header := range mainHeaders {
		cell, _ := excelize.CoordinatesToCellName(col+1, 1)
		f.SetCellValue(sheetName, cell, header)
	}

	// 创建版权信息工作表
	copyrightSheet := "版权信息"
	f.NewSheet(copyrightSheet)
	copyrightHeaders := []string{
		"序号", "关联企业PID", "著作人", "软件名称", "软件简称", "版本号", "软件著作分类", "行业分类", "登记号", "登记日期", "首次发表日期",
	}
	for col, header := range copyrightHeaders {
		cell, _ := excelize.CoordinatesToCellName(col+1, 1)
		f.SetCellValue(copyrightSheet, cell, header)
	}

	// 创建分支机构工作表
	branchSheet := "分支机构"
	f.NewSheet(branchSheet)
	branchHeaders := []string{
		"序号", "关联企业PID", "机构PID", "机构名称", "注册日期", "注册资本", "机构Logo", "负责人",
	}
	for col, header := range branchHeaders {
		cell, _ := excelize.CoordinatesToCellName(col+1, 1)
		f.SetCellValue(branchSheet, cell, header)
	}

	// 初始化行计数器
	mainRow, copyrightRow, branchRow := 2, 2, 2

	// 递归写入数据
	var writeNode func(*ExportNode, int, string)
	writeNode = func(node *ExportNode, level int, parentPID string) {
		if node == nil {
			return
		}

		// 写入主工作表
		mainCols := []interface{}{
			mainRow - 1,
			level,
			parentPID,
			node.Pid,
			node.EntName,
			node.RegRate,
			node.RegCapital,
			node.CancelStatus,
			len(node.Copyrights),
			len(node.Branches),
			node.Logo,
		}

		for col, value := range mainCols {
			cell, _ := excelize.CoordinatesToCellName(col+1, mainRow)
			f.SetCellValue(sheetName, cell, value)
		}

		// 设置缩进显示层级关系
		if level > 0 {
			cell, _ := excelize.CoordinatesToCellName(3, mainRow) // 企业名称列
			currentValue, _ := f.GetCellValue(sheetName, cell)
			f.SetCellStr(sheetName, cell, currentValue)
		}

		// 写入版权信息
		for _, copyright := range node.Copyrights {
			copyrightCols := []interface{}{
				copyrightRow - 1,
				node.Pid,
				copyright.SoftwareWork,
				copyright.SoftwareName,
				copyright.ShortName,
				copyright.BatchNum,
				copyright.SoftwareType,
				copyright.TypeCode,
				copyright.RegNo,
				copyright.RegDate,
				copyright.FirstDate,
			}
			for col, value := range copyrightCols {
				cell, _ := excelize.CoordinatesToCellName(col+1, copyrightRow)
				f.SetCellValue(copyrightSheet, cell, value)
			}
			copyrightRow++
		}

		// 写入分支机构信息
		for _, branch := range node.Branches {
			branchCols := []interface{}{
				branchRow - 1,
				node.Pid,
				branch.Pid,
				branch.EntName,
				branch.StartDate,
				branch.RegCapital,
				branch.Logo,
				branch.LegalPerson,
			}
			for col, value := range branchCols {
				cell, _ := excelize.CoordinatesToCellName(col+1, branchRow)
				f.SetCellValue(branchSheet, cell, value)
			}
			branchRow++
		}

		mainRow++

		// 递归处理子节点
		for _, child := range node.ChildrenNodes {
			writeNode(child, level+1, node.Pid)
		}
	}

	writeNode(root, 0, "0")

	r.SetExcelStyle(f, "公司投资结构", len(mainHeaders), mainRow-1)
	r.SetExcelStyle(f, "版权信息", len(copyrightHeaders), copyrightRow-1)
	r.SetExcelStyle(f, "分支机构", len(branchHeaders), branchRow-1)

	utils.FreezeFirstRow(f, "公司投资结构")
	utils.FreezeFirstRow(f, "版权信息")
	utils.FreezeFirstRow(f, "分支机构")

	f.SetActiveSheet(index)

	// 删除默认表
	defaultSheet := f.GetSheetName(0)
	f.DeleteSheet(defaultSheet)

	if err := utils.CreateDirectory(filepath.Dir(outputFilepath)); err != nil {
		return fmt.Errorf("保存文件失败: %w", err)
	}
	if err := f.SaveAs(outputFilepath); err != nil {
		return fmt.Errorf("保存文件失败: %w", err)
	}

	return nil
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

// 辅助函数：设置自动列宽
func setAutoWidth(f *excelize.File, sheet string, cols int) {
	for col := 1; col <= cols; col++ {
		colName, _ := excelize.ColumnNumberToName(col)
		f.SetColWidth(sheet, colName, colName, 18) // 设置统一列宽
	}
}

func (r *AiQiCha) SetExcelStyle(file *excelize.File, sheetName string, headerLen, dataLen int) {
	border := []excelize.Border{
		{
			Type:  "right",
			Color: "#000000",
			Style: 1,
		},
		{
			Type:  "left",
			Color: "#000000",
			Style: 1,
		},
		{
			Type:  "top",
			Color: "#000000",
			Style: 1,
		},
		{
			Type:  "bottom",
			Color: "#000000",
			Style: 1,
		},
	}
	// 表头格式
	headerStyle, err := file.NewStyle(&excelize.Style{
		Fill:      excelize.Fill{Type: "pattern", Color: []string{"#d0cece"}, Pattern: 1},
		Alignment: &excelize.Alignment{Horizontal: "center"},
		Border:    border,
	})
	if err != nil {
		return
	}
	_ = file.SetCellStyle(sheetName, "A1", utils.ColumnNumberToName(headerLen)+"1", headerStyle)

	// 数据格式
	dataStyle, err := file.NewStyle(&excelize.Style{
		Fill:      excelize.Fill{Type: "pattern"},
		Alignment: &excelize.Alignment{Horizontal: "left"},
		Border:    border,
	})
	_ = file.SetCellStyle(sheetName, "A2", utils.ColumnNumberToName(headerLen)+strconv.Itoa(dataLen), dataStyle)
}
