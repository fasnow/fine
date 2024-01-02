package zone

import (
	"encoding/json"
	"errors"
	"fine-server/sdk"
	"github.com/buger/jsonparser"
	"github.com/fasnow/ghttp"
	"net/http"
	"strconv"
	"strings"
)

type QueryType string

type apkType string

const (
	SiteType    QueryType = "site"
	ApkType     QueryType = "apk"
	MemberType  QueryType = "member"
	EmailType   QueryType = "email"
	DomainType  QueryType = "domain"
	CodeType    QueryType = "code"
	DarknetType QueryType = "darknet"
	AIMType     QueryType = "telegram"
)

const (
	miniProgram apkType = "微信小程序"
	wechat1     apkType = "微信公众号"
	wechat2     apkType = "微信公众号(含小程序)"
	androidApk  apkType = "安卓APK"
)

type Zone struct {
	key     string
	http    *ghttp.Client
	Site    *site
	Apk     *apk
	Domain  *domain
	Email   *email
	Member  *member
	Darknet *darknet
	Code    *code
	AIM     *aim
}

type apk struct {
	client *Zone
}
type domain struct {
	client *Zone
}
type email struct {
	client *Zone
}
type darknet struct {
	client *Zone
}
type code struct {
	client *Zone
}
type member struct {
	client *Zone
}
type site struct {
	client *Zone
}

type aim struct {
	client *Zone
}

func NewClient(key string) *Zone {
	client := &Zone{
		key:     key,
		http:    &ghttp.Client{},
		Site:    &site{},
		Apk:     &apk{},
		Domain:  &domain{},
		Email:   &email{},
		Member:  &member{},
		Darknet: &darknet{},
		Code:    &code{},
		AIM:     &aim{},
	}
	client.Site.client = client
	client.Apk.client = client
	client.Domain.client = client
	client.Email.client = client
	client.Member.client = client
	client.Darknet.client = client
	client.Code.client = client
	client.AIM.client = client
	return client
}

func (z *Zone) SetHttpClient(client *ghttp.Client) {
	z.http = client
}

func (z *Zone) analyze(req *GetDataReq) (int, int, int64, []byte, error) {
	bytePostData, err := json.Marshal(req.req.Body)
	if err != nil {
		return 0, 0, 0, nil, err
	}
	postData := strings.NewReader(string(bytePostData))
	request, err := http.NewRequest("POST", sdk.ZoneApiUrl, postData)
	if err != nil {
		return 0, 0, 0, nil, err
	}
	request.Header.Set("Content-Type", "application/json")
	response, err := z.http.Do(request)
	if err != nil {
		return 0, 0, 0, nil, err
	}
	body, err := ghttp.GetResponseBody(response.Body)
	if err != nil {
		return 0, 0, 0, nil, err
	}
	message, err := jsonparser.GetString(body, "message")
	if err != nil {
		return 0, 0, 0, nil, err
	}
	if message != "success" {
		return 0, 0, 0, nil, errors.New(message)
	}
	page, err := jsonparser.GetInt(body, "page")
	if err != nil {
		return 0, 0, 0, nil, err
	}
	size, err := jsonparser.GetInt(body, "pagesize")
	if err != nil {
		return 0, 0, 0, nil, err
	}
	var total = 0
	var tmpTotalStr = ""
	var tmpTotalInt = int64(0)
	if req.req.Body.QueryType == DarknetType {
		tmpTotalInt, err = jsonparser.GetInt(body, "total")
		if err != nil {
			return 0, 0, 0, nil, err
		}
		total = int(tmpTotalInt)
	} else {
		tmpTotalStr, err = jsonparser.GetString(body, "total")
		if err != nil {
			return 0, 0, 0, nil, err
		}
		total, err = strconv.Atoi(tmpTotalStr)
	}
	if err != nil {
		return 0, 0, 0, nil, err
	}
	if total == 0 {
		return 0, 0, 0, nil, err
	}
	dataList, _, _, err := jsonparser.Get(body, "data")
	if err != nil {
		return 0, 0, 0, nil, err
	}
	return int(page), int(size), int64(total), dataList, nil
}
