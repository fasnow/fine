package quake

import (
	"github.com/fasnow/ghttp"
)

type QueryType string

const (
	Service            QueryType = "service" //1
	Host                         = "host"
	AggregationService           = "aggregationService"
	AggregationHost              = "aggregationHost"
	DeepService                  = "deepService"
	DeepHost                     = "deepHost"
)

type realtimeData struct {
	client *Quake
}

type deepData struct {
	client *Quake
}

type aggregationData struct {
	client *Quake
}

type faviconSimilarityData struct {
	client *Quake
}

type filterField struct {
	client *Quake
}

type Quake struct {
	key      string
	http     *ghttp.Client
	Realtime *realtimeData
	DeepData *deepData
	Field    *filterField
}

func NewClient(key string) *Quake {
	client := &Quake{
		key:      key,
		http:     &ghttp.Client{},
		Realtime: &realtimeData{},
		DeepData: &deepData{},
		Field:    &filterField{},
	}
	client.Realtime.client = client
	client.DeepData.client = client
	client.Field.client = client
	return client
}
func (q *Quake) SetHttpClient(client *ghttp.Client) {
	q.http = client
}
