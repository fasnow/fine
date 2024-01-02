package tianyancha

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/fasnow/ghttp"
	"math"
	"net/http"
	url2 "net/url"
	"strconv"
	"strings"
	"time"
)

func (t *TianYanCha) SetToken(token string) *TianYanCha {
	t.token = token
	return t
}

type ShareholderTreeNode struct {
	ChildrenID string `json:"children_id"`
	ShareholderItem
	Parent []*ShareholderTreeNode
}

type Info struct {
	ParentId        string                 `json:"parent_id"`
	Id              string                 `json:"id"`
	BaseInfo        BaseInfo               `json:"baseInfo"`         //基础信息
	Subsidiary      []*SubsidiaryItem      `json:"subsidiary"`       //分公司列表
	Shareholder     []*ShareholderItem     `json:"shareholder"`      //股东列表
	Investment      []*InvestmentItem      `json:"investment"`       //投资列表
	Wechat          []*WechatItem          `json:"wechat"`           //微信
	App             []*AppItem             `json:"app"`              //app
	Weibo           []*WeiboItem           `json:"weibo"`            //微博
	Supplier        []*SupplierItem        `json:"supplier"`         //供应商列表
	SubsidiaryTree  []*Info                `json:"subsidiary_tree"`  //分公司递归列表
	InvestmentTree  []*Info                `json:"investment_tree"`  //投资递归列表
	ShareholderTree []*ShareholderTreeNode `json:"shareholder_tree"` //股东递归列表
}

func (t *TianYanCha) Get(gid string, investRatio float64, investDepth int, shareholderDepth int) (*Info, error) {
	if investDepth < 0 {
		return nil, nil
	}
	var info = &Info{Id: gid, SubsidiaryTree: make([]*Info, 0), InvestmentTree: make([]*Info, 0)}
	baseInfo, err := t.GetBaseInfo(gid)
	if err != nil {
		return nil, err
	}
	info.BaseInfo = baseInfo
	subsidiary, err := t.GetSubsidiary(gid)
	if err != nil {
		return nil, err
	}
	info.Subsidiary = subsidiary
	shareholder, err := t.GetShareholder(gid)
	if err != nil {
		return nil, err
	}
	info.Shareholder = shareholder
	investment, err := t.GetInvestment(gid, investRatio)
	if err != nil {
		return nil, err
	}
	info.Investment = investment
	wechat, err := t.GetWechat(gid)
	if err != nil {
		return nil, err
	}
	info.Wechat = wechat
	app, err := t.GetApp(gid)
	if err != nil {
		return nil, err
	}
	info.App = app
	weibo, err := t.GetWeibo(gid)
	if err != nil {
		return nil, err
	}
	info.Weibo = weibo
	supplier, err := t.GetSupplier(gid)
	if err != nil {
		return nil, err
	}
	info.Supplier = supplier

	for _, item := range investment {
		result, err2 := t.Get(strconv.Itoa(item.Id), investRatio, investDepth-1, 0)
		if err2 != nil {
			return nil, err2
		}
		if result != nil {
			result.ParentId = gid
			info.InvestmentTree = append(info.InvestmentTree, result)
		}
	}
	for _, item := range subsidiary {
		result, err2 := t.Get(strconv.Itoa(item.ID), investRatio, investDepth-1, 0)
		if err2 != nil {
			return nil, err2
		}
		if result != nil {
			result.ParentId = gid
			info.SubsidiaryTree = append(info.SubsidiaryTree, result)
		}
	}
	return info, nil
}

// SuggestItem 第一步返回的ID信息
type SuggestItem struct {
	ID         string `json:"graphId"`    //数据ID
	Type       int    `json:"type"`       //
	MatchType  string `json:"matchType"`  //匹配类别
	ComName    string `json:"comName"`    //企业名称
	Name       string `json:"name"`       //
	Alias      string `json:"alias"`      //企业名称别名
	Logo       string `json:"logo"`       //企业Logo
	ClaimLevel any    `json:"claimLevel"` //
	RegStatus  int    `json:"regStatus"`  //经营状态
}

// Suggest
//
//	@Description:模糊查找企业
//	@param unitName 关键字
//	@return []*SuggestItem 企业信息
func (t *TianYanCha) Suggest(unitName string) ([]*SuggestItem, error) {
	var req *http.Request
	unitName = strings.TrimSpace(unitName)
	if unitName == "" {
		return nil, errors.New("incorrect unitName")
	}
	reqBody := strings.NewReader(fmt.Sprintf("{\"keyword\":\"%v\"}", unitName))
	req, _ = http.NewRequest("POST", companySuggestUrl, reqBody)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Tycid", "f335d190280911ec87a92d07ca8b72a4")
	req.Header.Set("X-Auth-Token", t.token)
	resp, err := t.http.Do(req)
	if err != nil {
		return nil, err
	}
	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("获取企业【%s】信息时返回错误,状态码【%d】", unitName, resp.StatusCode)
	}
	body, err := ghttp.GetResponseBody(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("获取企业【%s】信息时返回错误响应体", unitName)
	}
	var tmpResponse struct {
		State      string         `json:"state"`
		Message    string         `json:"message"`
		Special    string         `json:"special"`
		VipMessage string         `json:"vipMessage"`
		IsLogin    int            `json:"isLogin"`
		ErrorCode  int            `json:"errorCode"`
		Data       []*SuggestItem `json:"data"`
	}
	err = json.Unmarshal(body, &tmpResponse)
	if err != nil {
		return nil, fmt.Errorf("解析企业【%s】信息响应体时发生错误,错误信息：%s", unitName, err)
	}
	var result = make([]*SuggestItem, 0)
	return append(result, tmpResponse.Data...), nil
}

type BaseInfo struct {
	LegalPersonName string    `json:"legal_person_name"` //法定代表人
	Phone           []*string `json:"phone"`             //电话
	Email           []*string `json:"email"`             //邮箱
	Address         string    `json:"address"`           //地址
	Website         string    `json:"website"`           //网址
	Description     string    `json:"description"`       //简介
	Name            string    `json:"name"`              //企业名称
	EnName          string    `json:"en_name"`           //企业英文名称
	RegStatus       string    `json:"reg_status"`        //经营状态
	EstablishTime   string    `json:"establish_time"`    //成立日期
	CreditCode      string    `json:"uscc"`              //统一社会信用代码
	RegCapital      string    `json:"reg_capital"`       //注册资本
	PaidCapital     string    `json:"paid_capital"`      //实缴资本
	TaxNumber       string    `json:"tax_number"`        //纳税人识别号
}

// GetBaseInfo
//
//	@Description: 根据graphId获取企业基本信息
func (t *TianYanCha) GetBaseInfo(gid string) (BaseInfo, error) {
	var req *http.Request
	var baseInfo = BaseInfo{}
	gid = strings.TrimSpace(gid)
	if gid == "" {
		return baseInfo, errors.New("graphId不能为空")
	}
	req, _ = http.NewRequest("GET", getCompanyInfoUrl+"?id="+gid, nil)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Version", "TYC-Web")
	req.Header.Set("X-Auth-Token", t.token)
	resp, err := t.http.Do(req)
	if err != nil {
		return baseInfo, err
	}
	if resp.StatusCode == 404 {
		return baseInfo, nil
	}
	if resp.StatusCode != 200 {
		return baseInfo, fmt.Errorf("获取企业【%s】信息时返回错误,状态码【%d】", gid, resp.StatusCode)
	}
	body, err := ghttp.GetResponseBody(resp.Body)
	var tmpData struct {
		State      string `json:"state"`
		Message    string `json:"message"`
		Special    string `json:"special"`
		VipMessage string `json:"vipMessage"`
		IsLogin    int    `json:"isLogin"`
		ErrorCode  int    `json:"errorCode"`
		Data       struct {
			ActualCapital           string    `json:"actualCapital"`
			CompanyProfilePlainText string    `json:"companyProfilePlainText"`
			Email                   string    `json:"email"`
			EmailList               []*string `json:"emailList"`
			EstiblishTime           int64     `json:"estiblishTime"`
			LegalPersonName         string    `json:"legalPersonName"`
			Name                    string    `json:"name"`
			PhoneList               []*string `json:"phoneList"`
			PhoneNumber             string    `json:"phoneNumber"`
			RegCapitalAmount        string    `json:"regCapitalAmount"`
			RegLocation             string    `json:"regLocation"`
			RegStatus               string    `json:"regStatus"`
			TaxNumber               string    `json:"taxNumber"`
			WebsiteList             string    `json:"websiteList"`
		} `json:"data"`
	}
	err3 := json.Unmarshal(body, &tmpData)
	if err3 != nil {
		return baseInfo, err3
	}
	baseInfo.LegalPersonName = tmpData.Data.LegalPersonName
	baseInfo.Phone = append(baseInfo.Phone, &tmpData.Data.PhoneNumber)
	baseInfo.Phone = append(baseInfo.Phone, tmpData.Data.PhoneList...)
	baseInfo.Email = tmpData.Data.EmailList
	baseInfo.Address = tmpData.Data.RegLocation
	baseInfo.Website = tmpData.Data.WebsiteList
	baseInfo.Description = tmpData.Data.CompanyProfilePlainText
	baseInfo.Name = tmpData.Data.Name
	baseInfo.EnName = ""
	baseInfo.RegStatus = tmpData.Data.RegStatus
	baseInfo.EstablishTime = time.Unix(tmpData.Data.EstiblishTime/1000, 0).UTC().Format("2006-01-02")
	baseInfo.CreditCode = tmpData.Data.TaxNumber
	baseInfo.RegCapital = tmpData.Data.RegCapitalAmount
	baseInfo.PaidCapital = tmpData.Data.ActualCapital
	baseInfo.TaxNumber = tmpData.Data.TaxNumber
	return baseInfo, nil
}

//type StockHolderRatio struct {
//	ID         string              `json:"id"`
//	Ratio      float64             `json:"ratio"`
//	AmountStr  string              `json:"amountStr"`
//	HolderList []*StockHolderRatio `json:"holderList"`
//}
//
//type StockHolderInfo struct {
//	ID          string      `json:"id"`
//	HumanNameID interface{} `json:"humanNameId"`
//	CompanyID   int         `json:"companyId"`
//	EntityType  int         `json:"entityType"`
//	Name        string      `json:"name"`
//	Logo        string      `json:"logo"`
//	StatusTag   struct {
//		TagID           int    `json:"tagId"`
//		Name            string `json:"name"`
//		Title           string `json:"title"`
//		FontColor       string `json:"fontColor"`
//		BackgroundColor string `json:"backgroundColor"`
//	} `json:"statusTag"`
//	BaseInfoList []struct {
//		BaseInfoType string `json:"baseInfoType"`
//		ShowText     string `json:"showText"`
//		JumpRoute    string `json:"jumpRoute"`
//	} `json:"baseInfoList"`
//	TagList []struct {
//		TagID           int    `json:"tagId"`
//		Name            string `json:"name"`
//		Title           string `json:"title"`
//		FontColor       string `json:"fontColor"`
//		BackgroundColor string `json:"backgroundColor"`
//	} `json:"tagList"`
//	CardList []struct {
//		CardType                     int    `json:"cardType"`
//		Title                        string `json:"title"`
//		SubTitle                     string `json:"subTitle"`
//		Content                      string `json:"content"`
//		JumpRoute                    string `json:"jumpRoute"`
//		DimensionKeyForAppEventTrack string `json:"dimensionKeyForAppEventTrack"`
//	} `json:"cardList"`
//	HasHolder        bool        `json:"hasHolder"`
//	HasInvestor      bool        `json:"hasInvestor"`
//	Industry         interface{} `json:"industry"`
//	IsValid          bool        `json:"isValid"`
//	IsBlock          bool        `json:"isBlock"`
//	FinalBeneficial  bool        `json:"finalBeneficial"`
//	BigHolder        bool        `json:"bigHolder"`
//	ActualController bool        `json:"actualController"`
//}
//
//type StockGraphItem struct { //投资者
//	Ratio *StockHolderRatio
//	Info  *StockHolderInfo
//}
//
//type StockGraph struct {
//	ID              string            `json:"id"`
//	InvestorList    []*StockGraphItem `json:"investorList"`
//	InvesteeList    []*StockGraphItem `json:"investeeList"`
//	InvestorListIn  any               `json:"investorListIn"`  //还未使用到
//	InvestorListOut any               `json:"investorListOut"` //还未使用到
//}
//
//// GetGraphInfo
////
////	@Description:根据graphId获取企业的投资者和被投资者股权占比信息
//func (t *TianYanCha) GetGraphInfo(graphId string) (*StockGraph, error) {
//	result := &StockGraph{
//		ID:           graphId,
//		InvestorList: make([]*StockGraphItem, 0),
//		InvesteeList: make([]*StockGraphItem, 0),
//	}
//	investorList, err := t.GetInvestorGraphInfo(graphId)
//	if err != nil {
//		return nil, err
//	}
//	result.InvestorList = investorList
//	investeeList, err := t.GetInvesteeGraphInfo(graphId)
//	if err != nil {
//		return nil, err
//	}
//	result.InvesteeList = investeeList
//	return result, nil
//}
//
//// GetInvestorGraphInfo 根据graphId获取投资者股权占比信息
////
////	@Description:
////	@return []*StockGraphItem
//func (t *TianYanCha) GetInvestorGraphInfo(graphId string) ([]*StockGraphItem, error) {
//	investorList, err := t.getGraphInfo("IN", graphId)
//	if err != nil {
//		return nil, err
//	}
//	return investorList, nil
//}
//
//// GetInvesteeGraphInfo 根据graphId获取被投资者股权占比信息
////
////	@Description:
////	@return []*StockGraphItem
//func (t *TianYanCha) GetInvesteeGraphInfo(graphId string) ([]*StockGraphItem, error) {
//	investeeList, err := t.getGraphInfo("OUT", graphId)
//	if err != nil {
//		return nil, err
//	}
//	return investeeList, nil
//}
//
//func (t *TianYanCha) getGraphInfo(direct string, graphId string) ([]*StockGraphItem, error) {
//	var postStruct = struct {
//		IDList            []string    `json:"idList"`
//		Direct            string      `json:"direct"`
//		MinRatio          interface{} `json:"minRatio"`
//		CenterID          string      `json:"centerId"`
//		EntityType        int         `json:"entityType"`
//		TargetLevel       int         `json:"targetLevel"`
//		Category          string      `json:"category"`
//		Year              int         `json:"year"`
//		Ratio             interface{} `json:"ratio"`
//		IsValid           bool        `json:"isValid"`
//		Depth             int         `json:"depth"`
//		EventID           string      `json:"eventId"`
//		Pm                string      `json:"pm"`
//		Spm               string      `json:"spm"`
//		PageID            string      `json:"page_id"`
//		MaxRatio          interface{} `json:"maxRatio"`
//		TraceID           int64       `json:"traceId"`
//		PreviousSignature string      `json:"previousSignature"`
//		Signature         string      `json:"signature"`
//	}{
//		IDList:            []string{graphId},
//		Direct:            direct,
//		MinRatio:          nil,
//		CenterID:          "1740741037",
//		EntityType:        2,
//		TargetLevel:       2,
//		Category:          "BOTH",
//		Year:              2023,
//		Ratio:             nil,
//		IsValid:           true,
//		Depth:             1,
//		EventID:           "i9",
//		Pm:                "9",
//		Spm:               "i9",
//		PageID:            "TYCGraphPage",
//		MaxRatio:          nil,
//		TraceID:           0,
//		PreviousSignature: "",
//		Signature:         "",
//	}
//	postByte, err := json.Marshal(postStruct)
//	if err != nil {
//		return nil, err
//	}
//	var req *http.Request
//	req, _ = http.NewRequest("POST", equityTreeUrl, strings.NewReader(string(postByte)))
//	req.Header.Add("Content-Type", "application/json")
//	req.Header.Add("Eventid", "i9")
//	req.Header.Add("Version", "TYC-Web")
//	req.Header.Add("X-Auth-Token", t.token)
//	resp, err := t.http.Do(req)
//	if err != nil {
//		return nil, err
//	}
//	if resp.StatusCode != 200 {
//		return nil, fmt.Errorf("获取企业【%s】信息时返回错误,状态码【%d】", graphId, resp.StatusCode)
//	}
//	body, err := ghttp.GetResponseBody(resp.Body)
//	type tmpTree struct {
//		ID           string              `json:"id"`
//		HolderList   []*StockHolderRatio `json:"holderList"`
//		InvestorList []*StockHolderRatio `json:"investorList"`
//	}
//	var tmpResponse struct {
//		Items     int    `json:"result"`
//		State      string `json:"state"`
//		Message    string `json:"message"`
//		Special    string `json:"special"`
//		VipMessage string `json:"vipMessage"`
//		PayPointID string `json:"payPointId"`
//		ModelJSON  string `json:"modelJson"`
//		IsLogin    int    `json:"isLogin"`
//		ErrorCode  int    `json:"errorCode"`
//		Data       struct {
//			NodesMap  map[string]*StockHolderInfo `json:"nodesMap"`
//			TreeList  []*tmpTree                  `json:"treeList"`
//			OutOfSize bool                        `json:"outOfSize"`
//			Signature string                      `json:"signature"`
//		} `json:"data"`
//	}
//	err2 := json.Unmarshal(body, &tmpResponse)
//	if err2 != nil {
//		return nil, err2
//	}
//	if tmpResponse.Items != 200 {
//		return nil, fmt.Errorf(tmpResponse.Message)
//	}
//	var stockGraphItems = make([]*StockGraphItem, 0)
//	for _, tree := range tmpResponse.Data.TreeList {
//		if direct == "IN" {
//			for _, holderInfo := range tree.HolderList {
//				var holder = &StockGraphItem{
//					Ratio: holderInfo,
//				}
//				if info, ok := tmpResponse.Data.NodesMap[holderInfo.ID]; ok {
//					holder.Info = info
//				}
//				stockGraphItems = append(stockGraphItems, holder)
//			}
//		} else if direct == "OUT" {
//			for _, investor := range tree.InvestorList {
//				var holder = &StockGraphItem{
//					Ratio: investor,
//				}
//				if info, ok := tmpResponse.Data.NodesMap[investor.ID]; ok {
//					holder.Info = info
//				}
//				stockGraphItems = append(stockGraphItems, holder)
//			}
//		}
//
//	}
//	return stockGraphItems, nil
//}

type ShareholderItem struct {
	Name    string  `json:"name"`    //控股人/企业名称
	Percent float64 `json:"percent"` //控股比例
	Amount  float64 `json:"amount"`  //出资份额
	Id      int     `json:"id"`      //控股人/企业ID
}

func (t *TianYanCha) getShareholder(gid string, page, size int) ([]*ShareholderItem, int, error) {
	var postData = map[string]string{
		"gid":          gid,
		"pageSize":     strconv.Itoa(size),
		"pageNum":      strconv.Itoa(page),
		"percentLevel": "-100",
		"sortField":    "capitalAmount",
		"sortType":     "-100",
	}
	bytesBody, err := json.Marshal(postData)
	if err != nil {
		return nil, 0, err
	}
	request, _ := http.NewRequest("POST", getShareholderUrl, bytes.NewReader(bytesBody))
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("Version", "TYC-Web")
	request.Header.Set("X-Auth-Token", t.token)
	response, err := t.http.Do(request)
	if err != nil {
		return nil, 0, err
	}
	var tmpResponse struct {
		State      string `json:"state"`
		Message    string `json:"message"`
		Special    string `json:"special"`
		VipMessage string `json:"vipMessage"`
		IsLogin    int    `json:"isLogin"`
		ErrorCode  int    `json:"errorCode"`
		Data       struct {
			PageNum      int `json:"pageNum"`
			Total        int `json:"total"`
			PageSize     int `json:"pageSize"`
			HistoryCount int `json:"historyCount"`
			Result       []struct {
				TagList []struct {
					Name       string      `json:"name"`
					Type       int         `json:"type"`
					Color      interface{} `json:"color"`
					Background interface{} `json:"background"`
					Title      interface{} `json:"title"`
					Value      interface{} `json:"value"`
					Sort       interface{} `json:"sort"`
					ExtraInfo  interface{} `json:"extraInfo"`
				} `json:"tagList"`
				Toco    int     `json:"toco"`
				Amount  float64 `json:"amount"`
				Name    string  `json:"name"`
				Capital []struct {
					Amomon  string      `json:"amomon"`
					Payment interface{} `json:"payment"`
					Time    string      `json:"time"`
					Percent string      `json:"percent"`
				} `json:"capital"`
				CapitalActl []struct {
					Amomon  string      `json:"amomon"`
					Payment interface{} `json:"payment"`
					Time    string      `json:"time"`
					Percent interface{} `json:"percent"`
				} `json:"capitalActl"`
				Logo               interface{} `json:"logo"`
				ID                 int         `json:"id"`
				Type               int         `json:"type"`
				ShareHolderType    string      `json:"shareHolderType"`
				Percent            float64     `json:"percent"`
				Hcgid              int         `json:"hcgid"`
				FinalBenefitShares string      `json:"finalBenefitShares"`
				Position           string      `json:"position"`
				JigouName          interface{} `json:"jigouName"`
				JigouLogo          interface{} `json:"jigouLogo"`
				JigouID            interface{} `json:"jigouId"`
				ProductID          interface{} `json:"productId"`
				ProductName        interface{} `json:"productName"`
				ProductLogo        interface{} `json:"productLogo"`
				ExistHoldingPath   bool        `json:"existHoldingPath"`
				ExistBenefitDetail bool        `json:"existBenefitDetail"`
				ServiceType        int         `json:"serviceType"`
				ServiceCount       int         `json:"serviceCount"`
			} `json:"result"`
			ShareHolderTypes interface{} `json:"shareHolderTypes"`
			PercentList      []struct {
				Key   string `json:"key"`
				Value int    `json:"value"`
			} `json:"percentList"`
			ListedHolder interface{} `json:"listedHolder"`
			SortField    string      `json:"sortField"`
			SortType     int         `json:"sortType"`
			BannerModel  interface{} `json:"bannerModel"`
		} `json:"data"`
	}
	body, err := ghttp.GetResponseBody(response.Body)
	if err != nil {
		return nil, 0, err
	}
	err = json.Unmarshal(body, &tmpResponse)
	if err != nil {
		return nil, 0, err
	}
	if tmpResponse.ErrorCode != 0 {
		return nil, 0, errors.New(tmpResponse.Message)
	}
	var result = make([]*ShareholderItem, 0)
	for _, item := range tmpResponse.Data.Result {
		var tmp = &ShareholderItem{
			Name:    item.Name,
			Percent: item.Percent,
			Amount:  item.Amount,
			Id:      item.ID,
		}
		result = append(result, tmp)
	}
	return result, tmpResponse.Data.Total, nil
}

func (t *TianYanCha) GetShareholder(gid string) ([]*ShareholderItem, error) {
	shareholderInfo, total, err := t.getShareholder(gid, 1, 1)
	if err != nil {
		return nil, err
	}
	if total > 1 {
		shareholderInfo, _, err = t.getShareholder(gid, 1, total)
		if err != nil {
			return nil, err
		}
	}
	if len(shareholderInfo) == 0 {
		return make([]*ShareholderItem, 0), nil
	}
	return shareholderInfo, nil
}

type InvestmentItem struct {
	Name            string  `json:"name"`            //企业名称
	RegStatus       string  `json:"regStatus"`       //经营状态
	Percent         float64 `json:"percent"`         //控股比例
	Id              int     `json:"id"`              //企业ID
	EstiblishTime   string  `json:"estiblishTime"`   //成立时间日期
	LegalPersonName string  `json:"legalPersonName"` //法人姓名
	Amount          string  `json:"amount"`          //投资数额
}

func (t *TianYanCha) getInvestment(gid string, page, size int) ([]*InvestmentItem, int, error) {
	var postData = map[string]interface{}{
		"gid":          gid,
		"pageSize":     strconv.Itoa(size),
		"pageNum":      strconv.Itoa(page),
		"province":     "-100",
		"percentLevel": "-100",
		"category":     "-100",
	}
	bytesBody, err := json.Marshal(postData)
	if err != nil {
		return nil, 0, err
	}
	request, _ := http.NewRequest("POST", getInvesteeUrl, bytes.NewReader(bytesBody))
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("Version", "TYC-Web")
	request.Header.Set("X-Auth-Token", t.token)
	response, err := t.http.Do(request)
	if err != nil {
		return nil, 0, err
	}
	var tmpResponse struct {
		State      string `json:"state"`
		Message    string `json:"message"`
		Special    string `json:"special"`
		VipMessage string `json:"vipMessage"`
		IsLogin    int    `json:"isLogin"`
		ErrorCode  int    `json:"errorCode"`
		Data       struct {
			Items []*struct {
				Name             string      `json:"name"`
				PersonType       int         `json:"personType"`
				ServiceType      interface{} `json:"serviceType"`
				RegStatus        string      `json:"regStatus"`
				Percent          string      `json:"percent"`
				LegalPersonTitle string      `json:"legalPersonTitle"`
				LegalPersonName  string      `json:"legalPersonName"`
				Logo             string      `json:"logo"`
				Alias            string      `json:"alias"`
				ID               int         `json:"id"`
				Amount           string      `json:"amount"`
				EstiblishTime    int64       `json:"estiblishTime"`
				LegalPersonID    int         `json:"legalPersonId"`
				ServiceCount     interface{} `json:"serviceCount"`
				LegalAlias       interface{} `json:"legalAlias"`
				LegalLogo        interface{} `json:"legalLogo"`
				JigouName        interface{} `json:"jigouName"`
				JigouLogo        interface{} `json:"jigouLogo"`
				JigouID          interface{} `json:"jigouId"`
				ProductName      string      `json:"productName"`
				ProductLogo      string      `json:"productLogo"`
				ProductID        string      `json:"productId"`
			} `json:"result"`
			Total int `json:"total"`
		} `json:"data"`
	}
	body, err := ghttp.GetResponseBody(response.Body)
	if err != nil {
		return nil, 0, err
	}
	err = json.Unmarshal(body, &tmpResponse)
	if err != nil {
		return nil, 0, err
	}
	if tmpResponse.ErrorCode != 0 {
		return nil, 0, errors.New(tmpResponse.Message)
	}
	var result = make([]*InvestmentItem, 0)
	for _, item := range tmpResponse.Data.Items {
		var strPercent = ""
		if strings.HasSuffix(item.Percent, "%") {
			strPercent = item.Percent[:len(item.Percent)-1]
		}
		var percent, _ = strconv.ParseFloat(strPercent, 64)
		var tmp = &InvestmentItem{
			Name:            item.Name,
			RegStatus:       item.RegStatus,
			Percent:         float64(percent) / 100,
			Id:              item.ID,
			EstiblishTime:   time.Unix(item.EstiblishTime/1000, 0).UTC().Format("2006-01-02"),
			LegalPersonName: item.LegalPersonName,
			Amount:          item.Amount,
		}
		result = append(result, tmp)
	}
	return result, tmpResponse.Data.Total, nil
}

func (t *TianYanCha) GetInvestment(gid string, ratio float64) ([]*InvestmentItem, error) {
	items, total, err := t.getInvestment(gid, 1, 1)
	if err != nil {
		return nil, err
	}
	if total > 1 {
		items, _, err = t.getInvestment(gid, 1, total)
		if err != nil {
			return nil, err
		}
	}
	var tmpItems = make([]*InvestmentItem, 0)
	for _, item := range items {
		if item.RegStatus != "注销" && item.Percent >= ratio {
			tmpItems = append(tmpItems, item)
		}
	}
	return tmpItems, nil
}

type SubsidiaryItem struct {
	ServiceType      int    `json:"serviceType"`
	RegStatus        string `json:"regStatus"`        //经营状态
	EstiblishTime    string `json:"estiblishTime"`    //成立日期
	Type             int    `json:"type"`             //
	LegalPersonAlias any    `json:"legalPersonAlias"` //法人姓名别名
	LegalPersonName  string `json:"legalPersonName"`  //法人姓名
	LegalPersonID    int    `json:"legalPersonId"`    //
	Toco             int    `json:"toco"`             //
	CompanyID        int    `json:"companyId"`        //企业ID
	ServiceCount     int    `json:"serviceCount"`     //
	LegalLogo        string `json:"legalLogo"`        //
	Name             string `json:"name"`             //企业名称
	Alias            string `json:"alias"`            //企业名称别名
	Logo             string `json:"logo"`             //企业Logo
	ID               int    `json:"id"`               //数据ID
	PersonType       int    `json:"personType"`       //
}

func (t *TianYanCha) getSubsidiary(gid string, page, size int) ([]*SubsidiaryItem, int, error) {
	var req *http.Request
	var params = url2.Values{}
	params.Set("gid", gid)
	params.Set("pageNum", strconv.Itoa(page))
	params.Set("pageSize", strconv.Itoa(size))
	req, _ = http.NewRequest("GET", getSubsidiaryUrl+"/?"+params.Encode(), nil)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Version", "TYC-Web")
	req.Header.Set("X-Auth-Token", t.token)
	resp, err := t.http.Do(req)
	if err != nil {
		return nil, 0, err
	}
	body, err := ghttp.GetResponseBody(resp.Body)
	if err != nil {
		return nil, 0, err
	}
	if resp.StatusCode != 200 {
		return nil, 0, fmt.Errorf("服务器返回响应码：%d,response body:%s", resp.StatusCode, string(body))
	}
	var tmpResponse struct {
		State      string `json:"state"`
		Message    string `json:"message"`
		Special    string `json:"special"`
		VipMessage string `json:"vipMessage"`
		IsLogin    int    `json:"isLogin"`
		ErrorCode  int    `json:"errorCode"`
		Data       struct {
			Items    []*SubsidiaryItem `json:"result"`
			Total    int               `json:"total"`
			PageSize int               `json:"pageSize"`
			PageNum  int               `json:"pageNum"`
		} `json:"data"`
	}
	err = json.Unmarshal(body, &tmpResponse)
	if err != nil {
		return nil, 0, err
	}
	if tmpResponse.ErrorCode != 0 {
		return nil, 0, errors.New(tmpResponse.Message)
	}
	return tmpResponse.Data.Items, tmpResponse.Data.Total, nil
}

func (t *TianYanCha) GetSubsidiary(gid string) ([]*SubsidiaryItem, error) {
	items, total, err := t.getSubsidiary(gid, 1, 1)
	if err != nil {
		return nil, err
	}
	if total > 1 {
		items, _, err = t.getSubsidiary(gid, 1, total)
		if err != nil {
			return nil, err
		}
	}
	var tmpItems []*SubsidiaryItem
	for _, item := range items {
		if item.RegStatus != "注销" {
			tmpItems = append(tmpItems, item)
		}
	}
	if len(tmpItems) == 0 {
		return make([]*SubsidiaryItem, 0), nil
	}
	return tmpItems, nil
}

type WeiboItem struct {
	Ico  string   `json:"ico"`
	Name string   `json:"name"`
	Href string   `json:"href"`
	Info string   `json:"info"`
	Tags []string `json:"tags"`
}

func (t *TianYanCha) getWeibo(gid string, page, size int) ([]*WeiboItem, int, error) {
	var req *http.Request
	var params = url2.Values{}
	params.Set("graphId", gid)
	params.Set("pageNum", strconv.Itoa(page))
	params.Set("pageSize", strconv.Itoa(size))
	req, _ = http.NewRequest("GET", getWeiboUrl+"?"+params.Encode(), nil)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Version", "TYC-Web")
	req.Header.Set("X-Auth-Token", t.token)
	resp, err := t.http.Do(req)
	if err != nil {
		return nil, 0, err
	}
	body, err := ghttp.GetResponseBody(resp.Body)
	if err != nil {
		return nil, 0, err
	}
	if resp.StatusCode != 200 {
		return nil, 0, errors.New("server return non 200 status Code,response body:" + string(body))
	}
	var tmpResponse struct {
		State      string `json:"state"`
		Message    string `json:"message"`
		Special    string `json:"special"`
		VipMessage string `json:"vipMessage"`
		IsLogin    int    `json:"isLogin"`
		ErrorCode  int    `json:"errorCode"`
		Data       struct {
			PageNum  int          `json:"pageNum"`
			PageSize int          `json:"pageSize"`
			Total    int          `json:"total"`
			Items    []*WeiboItem `json:"result"`
		} `json:"data"`
	}
	err = json.Unmarshal(body, &tmpResponse)
	if err != nil {
		return nil, 0, err
	}
	if tmpResponse.ErrorCode != 0 {
		return nil, 0, errors.New(tmpResponse.Message)
	}
	return tmpResponse.Data.Items, tmpResponse.Data.Total, nil
}

func (t *TianYanCha) GetWeibo(gid string) ([]*WeiboItem, error) {
	items, total, err := t.getWeibo(gid, 1, 1)
	if err != nil {
		return nil, err
	}
	if total > 0 {
		items, total, err = t.getWeibo(gid, 1, total)
		if err != nil {
			return nil, err
		}
	}
	return items, nil
}

type AppItem struct {
	Brief      string `json:"brief"`
	Classes    string `json:"classes"`
	Icon       string `json:"icon"`
	Name       string `json:"name"`
	FilterName string `json:"filterName"`
	BusinessID string `json:"businessId"`
	ID         int    `json:"id"`
	Type       string `json:"type"`
	UUID       string `json:"uuid"`
}

func (t *TianYanCha) getApp(gid string, page, size int) ([]*AppItem, int, error) {
	var req *http.Request
	var params = url2.Values{}
	params.Set("id", gid)
	params.Set("pageNum", strconv.Itoa(page))
	params.Set("pageSize", strconv.Itoa(size))
	req, _ = http.NewRequest("GET", getAppUrl+"?"+params.Encode(), nil)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Version", "TYC-Web")
	req.Header.Set("X-Auth-Token", t.token)
	resp, err := t.http.Do(req)
	if err != nil {
		return nil, 0, err
	}
	body, err := ghttp.GetResponseBody(resp.Body)
	if err != nil {
		return nil, 0, err
	}
	if resp.StatusCode != 200 {
		return nil, 0, errors.New("server return non 200 status Code,response body:" + string(body))
	}
	var tmpResponse struct {
		State      string `json:"state"`
		Message    string `json:"message"`
		Special    string `json:"special"`
		VipMessage string `json:"vipMessage"`
		IsLogin    int    `json:"isLogin"`
		ErrorCode  int    `json:"errorCode"`
		Data       struct {
			Count int        `json:"count"`
			Items []*AppItem `json:"items"`
		} `json:"data"`
	}
	err = json.Unmarshal(body, &tmpResponse)
	if err != nil {
		return nil, 0, err
	}
	if tmpResponse.ErrorCode != 0 {
		return nil, 0, errors.New(tmpResponse.Message)
	}
	return tmpResponse.Data.Items, tmpResponse.Data.Count, nil
}

func (t *TianYanCha) GetApp(gid string) ([]*AppItem, error) {
	items, total, err := t.getApp(gid, 1, 1)
	if err != nil {
		return nil, err
	}
	if total > 0 {
		items, total, err = t.getApp(gid, 1, total)
		if err != nil {
			return nil, err
		}
	}
	if len(items) == 0 {
		return make([]*AppItem, 0), nil
	}
	return items, nil
}

type SupplierItem struct {
	Summary          int    `json:"summary"`
	AnnouncementDate any    `json:"announcement_date"`
	Amt              string `json:"amt"`
	CompanyURL       string `json:"companyUrl"`
	Source           string `json:"source"`
	SupplierGraphID  int64  `json:"supplier_graphId"`
	Logo             string `json:"logo"`
	Alias            string `json:"alias"`
	SupplierName     string `json:"supplier_name"`
	Relationship     string `json:"relationship"`
	Category         string `json:"category"`
	ClientName       string `json:"client_name"`
	DataSource       string `json:"dataSource"`
	SourceName       string `json:"source_name"`
	SourceSeq        int    `json:"source_seq"`
	Ratio            string `json:"ratio"`
}

func (t *TianYanCha) getSupplier(gid string, page, size int) ([]*SupplierItem, int, error) {
	var req *http.Request
	var params = url2.Values{}
	params.Set("gid", gid)
	params.Set("pageNum", strconv.Itoa(page))
	params.Set("pageSize", strconv.Itoa(size)) //最大分页只能20
	params.Set("year", "-100")
	req, _ = http.NewRequest("GET", getSupplierUrl+"?"+params.Encode(), nil)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Version", "TYC-Web")
	req.Header.Set("X-Auth-Token", t.token)
	resp, err := t.http.Do(req)
	if err != nil {
		return nil, 0, err
	}
	body, err := ghttp.GetResponseBody(resp.Body)
	if err != nil {
		return nil, 0, err
	}
	if resp.StatusCode != 200 {
		return nil, 0, errors.New("server return non 200 status Code,response body:" + string(body))
	}
	var tmpResponse struct {
		State      string `json:"state"`
		Message    string `json:"message"`
		Special    string `json:"special"`
		VipMessage string `json:"vipMessage"`
		IsLogin    int    `json:"isLogin"`
		ErrorCode  int    `json:"errorCode"`
		Data       struct {
			SuppliesYear []struct {
				Title string `json:"title"`
				Value string `json:"value"`
			} `json:"suppliesYear"`
			PageBean struct {
				PageNum  int             `json:"pageNum"`
				PageSize int             `json:"pageSize"`
				Total    int             `json:"total"`
				Items    []*SupplierItem `json:"result"`
			} `json:"pageBean"`
		} `json:"data"`
	}
	err = json.Unmarshal(body, &tmpResponse)
	if err != nil {
		return nil, 0, err
	}
	if tmpResponse.ErrorCode != 0 {
		return nil, 0, errors.New(tmpResponse.Message)
	}
	for i := 0; i < len(tmpResponse.Data.PageBean.Items); i++ {
		if value, ok := tmpResponse.Data.PageBean.Items[i].AnnouncementDate.(float64); ok {
			tmpResponse.Data.PageBean.Items[i].AnnouncementDate = time.Unix(int64(value/1000), 0).UTC().Format("2006-01-02")
		}
	}
	return tmpResponse.Data.PageBean.Items, tmpResponse.Data.PageBean.Total, nil
}

func (t *TianYanCha) GetSupplier(gid string) ([]*SupplierItem, error) {
	items, total, err := t.getSupplier(gid, 1, 20)
	if err != nil {
		return nil, err
	}
	var maxPage = int(math.Ceil(float64(total) / 20))
	for page := 2; page <= maxPage; page++ {
		tmpItems, _, err2 := t.getSupplier(gid, page, 20)
		if err2 != nil {
			return nil, err2
		}
		items = append(items, tmpItems...)
	}
	if len(items) == 0 {
		return make([]*SupplierItem, 0), nil
	}
	return items, nil
}

type WechatItem struct {
	PublicNum   string `json:"publicNum"`
	CodeImg     string `json:"codeImg"`
	Recommend   string `json:"recommend"`
	Title       string `json:"title"`
	TitleImgURL string `json:"titleImgURL"`
}

func (t *TianYanCha) getWechat(gid string, page, size int) ([]*WechatItem, int, error) {
	var req *http.Request
	var params = url2.Values{}
	params.Set("graphId", gid)
	params.Set("pageNum", strconv.Itoa(page))
	params.Set("pageSize", strconv.Itoa(size))
	req, _ = http.NewRequest("GET", getWechatUrl+"?"+params.Encode(), nil)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Version", "TYC-Web")
	req.Header.Set("X-Auth-Token", t.token)
	resp, err := t.http.Do(req)
	if err != nil {
		return nil, 0, err
	}
	body, err := ghttp.GetResponseBody(resp.Body)
	if err != nil {
		return nil, 0, err
	}
	if resp.StatusCode != 200 {
		return nil, 0, errors.New("server return non 200 status Code,response body:" + string(body))
	}
	var tmpResponse struct {
		State      string `json:"state"`
		Message    string `json:"message"`
		Special    string `json:"special"`
		VipMessage string `json:"vipMessage"`
		IsLogin    int    `json:"isLogin"`
		ErrorCode  int    `json:"errorCode"`
		Data       struct {
			Count int           `json:"count"`
			Items []*WechatItem `json:"resultList"`
		} `json:"data"`
	}
	err = json.Unmarshal(body, &tmpResponse)
	if err != nil {
		return nil, 0, err
	}
	if tmpResponse.ErrorCode != 0 {
		return nil, 0, errors.New(tmpResponse.Message)
	}
	return tmpResponse.Data.Items, tmpResponse.Data.Count, nil
}

func (t *TianYanCha) GetWechat(gid string) ([]*WechatItem, error) {
	items, total, err := t.getWechat(gid, 1, 1)
	if err != nil {
		return nil, err
	}
	if total > 0 {
		items, total, err = t.getWechat(gid, 1, total)
		if err != nil {
			return nil, err
		}
	}
	if len(items) == 0 {
		return make([]*WechatItem, 0), nil
	}
	return items, nil
}
