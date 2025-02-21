package icp

import (
	"bytes"
	"crypto/md5"
	"encoding/json"
	"errors"
	"fine/backend/service/model/icp"
	"fine/backend/utils"
	"fmt"
	"github.com/tidwall/gjson"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"
)

func (r *ICP) SetTokenFromRemote() error {
	var req *http.Request
	timeStampInt := time.Now().UnixMilli()
	timeStampStr := strconv.FormatInt(timeStampInt, 10)
	authKey := fmt.Sprintf("%x", md5.Sum([]byte("testtest"+timeStampStr)))
	postData := url.Values{}
	postData.Set("authKey", authKey)
	postData.Set("timeStamp", timeStampStr)
	req, _ = http.NewRequest("POST", getTokenUrl, strings.NewReader(postData.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8")
	req.Header.Set("Referer", referer)
	req.Header.Set("Cookie", "__jsluid_s = 6452684553c30942fcb8cff8d5aa5a5b")
	response, err := r.http.Do(req)
	if err != nil {
		return err
	}
	body, err := io.ReadAll(response.Body)
	if err != nil {
		return err
	}
	// 被ban或者服务器出错
	if response.StatusCode != 200 {
		return errors.New(fmt.Sprintf("%v\n%v", response.StatusCode, string(body)))
	}
	var stringBody = string(body)
	var code = gjson.Get(stringBody, "code").Int()
	if code != 200 {
		return errors.New(fmt.Sprintf("%v\n%v", response.StatusCode, string(body)))
	}
	r.expireIn = timeStampInt + gjson.Get(stringBody, "params.expire").Int()
	r.token = gjson.Get(stringBody, "params.bussiness").String()
	r.refreshToken = gjson.Get(stringBody, "params.refresh").String()
	return nil
}

func (r *ICP) PageNum(page int) *ICP {
	r.page = page
	return r
}

func (r *ICP) PageSize(size int) *ICP {
	r.size = size
	return r
}

func (r *ICP) ServiceType(serviceType string) *ICP {
	r.serviceType = serviceType
	return r
}

func (r *ICP) Query(unitName string) (*Result, error) {
	unitName = strings.TrimSpace(unitName)
	if unitName == "" {
		return nil, errors.New("查询内容不能为空")
	}
	if r.page <= 0 {
		r.page = 1
	}
	if r.size <= 0 {
		r.size = 40
	}
	postData := map[string]string{
		"pageNum":     strconv.Itoa(r.page),
		"pageSize":    strconv.Itoa(r.size),
		"unitName":    unitName,
		"serviceType": r.serviceType,
	}
	bytesData, _ := json.Marshal(postData)
	req, err := http.NewRequest("POST", queryUrl, bytes.NewReader(bytesData))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Token", r.token)
	req.Header.Set("Sign", r.sign)
	req.Header.Set("Referer", referer)
	req.Header.Set("Cookie", "__jsluid_s=8e209cf6c7c40f530a300ac8dd0eb6c7")
	response, err := r.http.Do(req)
	if err != nil {
		return nil, err
	}
	body, err := io.ReadAll(response.Body)
	if err != nil {
		return nil, err
	}
	if response.StatusCode != 200 {
		return nil, errors.New(response.Status)
	}
	bodyStr := string(body)
	code := gjson.Get(bodyStr, "code").Int()

	//{ "success": false, "code": 401, "msg": "请求非法,验证码不匹配!!" }
	//{ "success": false, "code": 401, "msg": "token过期,请及时刷新页面" }
	//{ "success": false, "code": 401, "msg": "请求非法,已阻止,请及时刷新页面" }
	msg := gjson.Get(bodyStr, "msg").String()
	if code != 200 {
		return nil, errors.New(msg)
	}

	pageNum := gjson.Get(bodyStr, "params.pageNum").Int()
	pageSize := gjson.Get(bodyStr, "params.pageSize").Int()
	total := gjson.Get(bodyStr, "params.total").Int()
	list := gjson.Get(bodyStr, "params.list").Array()

	serviceTypeName := ""
	if r.serviceType == "1" {
		serviceTypeName = "网站"
	} else if r.serviceType == "6" {
		serviceTypeName = "APP"
	} else if r.serviceType == "7" {
		serviceTypeName = "小程序"
	} else if r.serviceType == "8" {
		serviceTypeName = "快应用"
	}
	items := make([]*icp.Item, 0)
	for _, item := range list {
		itemStr := item.String()
		serviceName := ""
		if r.serviceType == "1" {
			serviceName = gjson.Get(itemStr, "domain").String()
		} else {
			serviceName = gjson.Get(itemStr, "serviceName").String()
		}
		t := &icp.Item{
			ServiceName:      serviceName,
			LeaderName:       gjson.Get(itemStr, "leaderName").String(),
			NatureName:       gjson.Get(itemStr, "natureName").String(),
			ServiceLicence:   gjson.Get(itemStr, "serviceLicence").String(),
			UnitName:         gjson.Get(itemStr, "unitName").String(),
			UpdateRecordTime: gjson.Get(itemStr, "updateRecordTime").String(),
			ServiceType:      serviceTypeName,
		}
		items = append(items, t)
	}

	return &Result{
		PageNum:  int(pageNum),
		PageSize: int(pageSize),
		Items:    items,
		Total:    int(total),
	}, nil
}

func (r *ICP) Export(items []*icp.Item, filename string) error {
	var data [][]any
	headers := append([]any{"序号"}, []any{"企业名称", "备案内容",
		"备案号", "备案类型", "备案法人", "单位性质", "审核日期"}...)
	data = append(data, headers)
	for index, item := range items {
		var tmpItem = []any{
			index + 1,
			item.UnitName,
			item.ServiceName,
			item.ServiceLicence,
			item.ServiceType,
			item.LeaderName,
			item.NatureName,
			item.UpdateRecordTime}
		data = append(data, tmpItem)
	}
	if err := utils.SaveToExcel(data, filename); err != nil {
		return err
	}
	return nil
}
