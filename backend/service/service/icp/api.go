package icp

import (
	"bytes"
	"crypto/md5"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fine/backend/logger"
	"fine/backend/service/model/icp"
	"fine/backend/service/service"
	"fmt"
	"github.com/google/uuid"
	"github.com/tidwall/gjson"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"
)

var (
	referer       string // 请求头必须要有该字段
	getTokenUrl   string // getTokenUrl 获取token的url，会返回一个token(bussiness)和refreshToken(refresh)
	queryUrl      string // queryUrl 查询的url
	getImageUrl   string
	checkImageUrl string
)

func init() {
	var t1, _ = base64.StdEncoding.DecodeString("aHR0cHM6Ly9iZWlhbi5taWl0Lmdvdi5jbi8=")
	referer = string(t1)
	var t2, _ = base64.StdEncoding.DecodeString("aHR0cHM6Ly9obHdpY3Bmd2MubWlpdC5nb3YuY24=")
	var host = string(t2)
	getTokenUrl = host + "/icpproject_query/api/auth"
	queryUrl = host + "/icpproject_query/api/icpAbbreviateInfo/queryByCondition"
	getImageUrl = host + "/icpproject_query/api/image/getCheckImagePoint"
	checkImageUrl = host + "/icpproject_query/api/image/checkImage"
}

type ICP struct {
	Http      *http.Client
	page      int
	size      int
	token     string
	expireIn  int64
	clientUid string
	uuid      string
	secretKey string
	sign      string
}

type Struct2 struct {
	Name string
}

type Result struct {
	Page  int         `json:"page"`
	Size  int         `json:"size"`
	Total int         `json:"total"`
	Items []*icp.Item `json:"items"`
}

//type Image struct {
//	BigImage   string `json:"bigImage"`
//	SmallImage string `json:"smallImage"`
//	UUID       string `json:"uuid"`
//	SecretKey  string `json:"secretKey"`
//	WordCount  int    `json:"wordCount"`
//}
//type Item struct {
//	//ContentTypeName  string `json:"contentTypeName"`
//	Domain           string `json:"domain"`
//	DomainID         int    `json:"domainId"`
//	LeaderName       string `json:"leaderName"`
//	LimitAccess      string `json:"limitAccess"`
//	MainID           int    `json:"mainId"`
//	MainLicence      string `json:"mainLicence"`
//	NatureName       string `json:"natureName"`
//	ServiceID        int    `json:"serviceId"`
//	ServiceLicence   string `json:"serviceLicence"`
//	UnitName         string `json:"unitName"`
//	UpdateRecordTime string `json:"updateRecordTime"`
//}

func NewClient() *ICP {
	return &ICP{
		Http: &http.Client{},
	}
}

func (i *ICP) IsSignExpired() bool {
	//提前3s判断
	return time.Now().UnixMilli()-3000 > i.expireIn || i.sign == ""
}

func (i *ICP) getToken() (string, error) {
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
	response, err := i.Http.Do(req)
	if err != nil {
		logger.Info(err.Error())
		return "", err
	}
	body, err := io.ReadAll(response.Body)
	if err != nil {
		logger.Info(err.Error())
		return "", err
	}
	// 被ban或者服务器出错
	if response.StatusCode != 200 {
		return "", errors.New(fmt.Sprintf("响应状态码：%v，响应体：%v", response.StatusCode, string(body)))
	}
	var stringBody = string(body)
	var code = gjson.Get(stringBody, "code").Int()
	if code != 200 {
		return "", errors.New(fmt.Sprintf("响应状态码：%v，响应体：%v", response.StatusCode, stringBody))
	}
	i.expireIn = timeStampInt + gjson.Get(stringBody, "params.expire").Int()
	return gjson.Get(stringBody, "params.bussiness").String(), nil
}

func (i *ICP) GetTokenFromRemote() (string, error) {
	token, err := i.getToken()
	if err != nil {
		logger.Info(err.Error())
		return "", errors.New("获取token失败 " + err.Error())
	}
	return token, nil
}

func (i *ICP) SetTokenFromRemote() error {
	token, err := i.GetTokenFromRemote()
	if err != nil {
		logger.Info(err.Error())
		return err
	}
	i.token = token
	strings.Fields("")
	return nil
}

//func (i *ICP) RefreshToken(token string, refreshToken string) (*AuthToken, error) {
//	auth, err := i.getToken(true, token, refreshToken)
//	if err != nil {
//		return nil, errors.New("刷新token失败 " + err.Error())
//	}
//	return auth, nil
//}

func (i *ICP) Page(page int) *ICP {
	i.page = page
	return i
}

func (i *ICP) PageSize(size int) *ICP {
	i.size = size
	return i
}

func (i *ICP) Query(unitName string) (*Result, error) {
	unitName = strings.TrimSpace(unitName)
	if unitName == "" {
		return nil, service.UnexpectedQueryStatementError
	}
	if i.page <= 0 {
		i.page = 1
	}
	if i.size <= 0 {
		i.size = 40
	}
	postData := map[string]string{
		"pageNum":     strconv.Itoa(i.page),
		"pageSize":    strconv.Itoa(i.size),
		"unitName":    unitName,
		"serviceType": "1",
	}
	bytesData, err := json.Marshal(postData)
	if err != nil {
		logger.Info(err.Error())
		return nil, err
	}
	req, err := http.NewRequest("POST", queryUrl, bytes.NewReader(bytesData))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Token", i.token)
	req.Header.Set("UUID", i.uuid)
	req.Header.Set("Sign", i.sign)
	req.Header.Set("Referer", referer)
	req.Header.Set("Cookie", "__jsluid_s=8e209cf6c7c40f530a300ac8dd0eb6c7")
	response, err := i.Http.Do(req)
	if err != nil {
		logger.Info(err.Error())
		return nil, err
	}
	body, err := io.ReadAll(response.Body)
	if err != nil {
		return nil, err
	}

	// 被ban或者服务器出错
	if response.StatusCode != 200 {
		return nil, errors.New(string(body))
	}

	var tmpResponse struct {
		Code   int    `json:"code"`
		Msg    string `json:"msg"`
		Params struct {
			EndRow           int         `json:"endRow"`
			FirstPage        int         `json:"firstPage"`
			HasNextPage      bool        `json:"hasNextPage"`
			HasPreviousPage  bool        `json:"hasPreviousPage"`
			IsFirstPage      bool        `json:"isFirstPage"`
			IsLastPage       bool        `json:"isLastPage"`
			LastPage         int         `json:"lastPage"`
			List             []*icp.Item `json:"list"`
			NavigatePages    int         `json:"navigatePages"`
			NavigatepageNums []int       `json:"navigatepageNums"`
			NextPage         int         `json:"nextPage"`
			PageNum          int         `json:"pageNum"`
			PageSize         int         `json:"pageSize"`
			Pages            int         `json:"pages"`
			PrePage          int         `json:"prePage"`
			Size             int         `json:"size"`
			StartRow         int         `json:"startRow"`
			Total            int         `json:"total"`
		} `json:"params"`
		Success bool `json:"success"`
	}
	err = json.Unmarshal(body, &tmpResponse)
	if err != nil {
		return nil, err
	}
	if tmpResponse.Code != 200 {
		return nil, errors.New(tmpResponse.Msg)
	}
	return &Result{
		Page:  tmpResponse.Params.PageNum,
		Size:  tmpResponse.Params.PageSize,
		Items: tmpResponse.Params.List,
		Total: tmpResponse.Params.Total,
	}, nil
}

func (i *ICP) GetImage() (*icp.Image, error) {
	clientUid := "point-" + uuid.New().String()
	if i.IsSignExpired() {
		err := i.SetTokenFromRemote()
		if err != nil {
			return nil, err
		}
	}
	i.uuid = ""
	i.secretKey = ""
	i.sign = ""
	i.clientUid = clientUid
	req, _ := http.NewRequest("POST", getImageUrl, strings.NewReader(fmt.Sprintf("{\"clientUid\":\"%s\"}", clientUid)))
	req.Header.Set("Token", i.token)
	req.Header.Set("Referer", referer)
	req.Header.Set("Content-Type", "application/json")
	resp, err := i.Http.Do(req)
	if err != nil {
		return nil, err
	}
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	var tmpResponse struct {
		Code    int        `json:"code"`
		Msg     string     `json:"msg"`
		Params  *icp.Image `json:"params"`
		Success bool       `json:"success"`
	}
	err = json.Unmarshal(body, &tmpResponse)
	if err != nil {
		return nil, err
	}
	if tmpResponse.Code != 200 {
		return nil, fmt.Errorf(tmpResponse.Msg)
	}
	i.uuid = tmpResponse.Params.UUID
	i.secretKey = tmpResponse.Params.SecretKey
	return tmpResponse.Params, nil
}

// CheckImage pointJson由前端加密后传过来，golang我实在加密不出来
func (i *ICP) CheckImage(pointJson string) (sign, smallImage string, err error) {
	data := strings.NewReader(
		fmt.Sprintf("{\"token\":\"%s\",\"clientUid\":\"%s\",\"secretKey\":\"%s\",\"pointJson\":\"%s\"}",
			i.uuid, i.clientUid, i.secretKey, pointJson),
	)
	req, _ := http.NewRequest("POST", checkImageUrl, data)
	req.Header.Set("Token", i.token)
	req.Header.Set("Referer", referer)
	req.Header.Set("Content-Type", "application/json")
	resp, err := i.Http.Do(req)
	if err != nil {
		return "", "", err
	}
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", "", err
	}
	var stringBody = string(body)
	var code = gjson.Get(stringBody, "code").Int()
	var msg = gjson.Get(stringBody, "msg").String()
	if code != 200 {
		return "", "", fmt.Errorf(msg)
	}
	smallImage = gjson.Get(stringBody, "params.smallImage").String()
	sign = gjson.Get(stringBody, "params.sign").String()
	i.sign = sign
	return sign, smallImage, nil
}
