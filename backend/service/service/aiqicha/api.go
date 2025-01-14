package aiqicha

import (
	"encoding/json"
	"errors"
	"fine/backend/logger"
	"github.com/tidwall/gjson"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
)

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

func (r *AiQiCha) GetIndustryList() ([]IndustryNode, error) {
	var request, _ = http.NewRequest("GET", "https://static.tianyancha.com/static/pro/industry_level4_v2017.json", nil)
	response, err := r.http.Do(request)
	if err != nil {
		return nil, err
	}
	if response.StatusCode != 200 {
		return nil, errors.New(strconv.Itoa(response.StatusCode))
	}
	bytes, err := io.ReadAll(response.Body)
	if err != nil {
		return nil, err
	}
	var t struct {
		State   string
		Special string
		Data    []IndustryNode
	}
	err = json.Unmarshal(bytes, &t)
	if err != nil {
		return nil, err
	}
	if t.State != "ok" {
		return nil, errors.New(t.Special)
	}
	if t.Data != nil {
		return t.Data, nil
	}
	return make([]IndustryNode, 0), nil
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

func (r *AiQiCha) GetAreaList() ([]AreaNode, error) {
	request, _ := http.NewRequest("GET", "https://static.tianyancha.com/static/pro/area_level3_v2020.json", nil)
	response, err := r.http.Do(request)
	if err != nil {
		return nil, err
	}
	if response.StatusCode != 200 {
		return nil, errors.New(strconv.Itoa(response.StatusCode))
	}
	bytes, err := io.ReadAll(response.Body)
	if err != nil {
		return nil, err
	}
	var t struct {
		State   string     `json:"state"`
		Special string     `json:"special"`
		Message string     `json:"message"`
		Data    []AreaNode `json:"data"`
	}
	err = json.Unmarshal(bytes, &t)
	if err != nil {
		return nil, err
	}
	if t.State != "ok" {
		return nil, errors.New(t.Special)
	}
	if t.Data != nil {
		return t.Data, nil
	}
	return make([]AreaNode, 0), nil
}

type SuggestItem struct {
	Pid         string `json:"pid"`
	LegalPerson string `json:"legalPerson"`
	ResultStr   string `json:"resultStr"`
	Name        string `json:"name"`
}

func (r *AiQiCha) Suggest(key string) ([]SuggestItem, error) {
	params := url.Values{}
	params.Set("q", key)
	request, _ := http.NewRequest("POST", "https://aiqicha.baidu.com/index/suggest", strings.NewReader(params.Encode()))
	request.Header.Add("Content-Type", "application/x-www-form-urlencoded")
	request.Header.Add("Cookie", r.cookie)
	response, err := r.http.Do(request)
	if err != nil {
		return nil, err
	}
	if response.StatusCode != 200 {
		return nil, errors.New(response.Status)
	}
	t, err := io.ReadAll(response.Body)
	if err != nil {
		return nil, err
	}
	tt := string(t)
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
			logger.Info(err.Error() + ": " + company.Raw)
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
	params := url.Values{}
	params.Set("pid", pid)
	params.Set("drill", drill)
	request, _ := http.NewRequest("GET", "https://aiqicha.baidu.com/stockchart/stockchartAjax?"+params.Encode(), nil)
	request.Header.Add("Cookie", r.cookie)
	request.Header.Add("Referer", "https://aiqicha.baidu.com/")
	response, err := r.http.Do(request)
	if err != nil {
		return nil, err
	}
	if response.StatusCode != 200 {
		return nil, errors.New(response.Status)
	}
	t, err := io.ReadAll(response.Body)
	if err != nil {
		return nil, err
	}
	tt := string(t)
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
			logger.Info(err.Error() + ": " + shareholder.Raw)
			continue
		}
		shareholders = append(shareholders, item)
	}
	var investRecords = make([]InvestRecord, 0)
	for _, investRecord := range gjson.Get(tt, "data.investRecordData.list").Array() {
		var item InvestRecord
		err := json.Unmarshal([]byte(investRecord.Raw), &item)
		if err != nil {
			logger.Info(err.Error() + ": " + investRecord.Raw)
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
