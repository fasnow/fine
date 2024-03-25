package zone

import (
	"encoding/json"
	"errors"
	"fine/backend/logger"
	"fine/backend/service/model/zone"
	"github.com/buger/jsonparser"
	"github.com/fasnow/ghttp"
	"net/http"
	"strconv"
	"strings"
)

const (
	ZoneApiUrl = "https://0.zone/api/data/"
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
	zoneClient := &Zone{
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
	zoneClient.Site.client = zoneClient
	zoneClient.Apk.client = zoneClient
	zoneClient.Domain.client = zoneClient
	zoneClient.Email.client = zoneClient
	zoneClient.Member.client = zoneClient
	zoneClient.Darknet.client = zoneClient
	zoneClient.Code.client = zoneClient
	zoneClient.AIM.client = zoneClient
	return zoneClient
}

func (z *Zone) SetAuth(key string) {
	z.key = key
}

func (z *Zone) analyze(req *GetDataReq) (int, int, int64, []byte, error) {
	bytePostData, err := json.Marshal(req.req.Body)
	if err != nil {
		logger.Info(err.Error())
		return 0, 0, 0, nil, err
	}
	postData := strings.NewReader(string(bytePostData))
	request, err := http.NewRequest("POST", ZoneApiUrl, postData)
	if err != nil {
		logger.Info(err.Error())
		return 0, 0, 0, nil, err
	}
	request.Header.Set("Content-Type", "application/json")
	response, err := z.http.Do(request)
	if err != nil {
		logger.Info(err.Error())
		return 0, 0, 0, nil, err
	}
	body, err := ghttp.GetResponseBody(response.Body)
	if err != nil {
		logger.Info(err.Error())
		return 0, 0, 0, nil, err
	}
	message, err := jsonparser.GetString(body, "message")
	if err != nil {
		logger.Info(err.Error())
		return 0, 0, 0, nil, err
	}
	if message != "success" {
		return 0, 0, 0, nil, errors.New(message)
	}
	page, err := jsonparser.GetInt(body, "page")
	if err != nil {
		logger.Info(err.Error())
		return 0, 0, 0, nil, err
	}
	size, err := jsonparser.GetInt(body, "pagesize")
	if err != nil {
		logger.Info(err.Error())
		return 0, 0, 0, nil, err
	}
	var total = 0
	var tmpTotalStr = ""
	var tmpTotalInt = int64(0)
	if req.req.Body.QueryType == zone.DarknetType {
		tmpTotalInt, err = jsonparser.GetInt(body, "total")
		if err != nil {
			logger.Info(err.Error())
			return 0, 0, 0, nil, err
		}
		total = int(tmpTotalInt)
	} else {
		tmpTotalStr, err = jsonparser.GetString(body, "total")
		if err != nil {
			logger.Info(err.Error())
			return 0, 0, 0, nil, err
		}
		total, err = strconv.Atoi(tmpTotalStr)
	}
	if err != nil {
		logger.Info(err.Error())
		return 0, 0, 0, nil, err
	}
	if total == 0 {
		logger.Info(err.Error())
		return 0, 0, 0, nil, err
	}
	dataList, _, _, err := jsonparser.Get(body, "data")
	if err != nil {
		logger.Info(err.Error())
		return 0, 0, 0, nil, err
	}
	return int(page), int(size), int64(total), dataList, nil
}
