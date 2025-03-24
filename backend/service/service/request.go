package service

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/url"
	"strings"
)

type BodyParams struct {
	url.Values
}

// Decorate 转为 Content-Type 为 application/x-www-form-urlencoded 对应的请求体
func (r *BodyParams) Decorate(req *Request) {
	if req.BodyParams == nil {
		return
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Body = strings.NewReader(req.BodyParams.Encode())
}

type BodyMap map[string]any

// Decorate 转为 Content-Type 为 application/json 对应的请求体
func (r *BodyMap) Decorate(req *Request) {
	if req.BodyMap == nil {
		return
	}
	bt, _ := json.Marshal(&req.BodyMap)
	req.Header.Set("Content-Type", "application/json")
	req.Body = bytes.NewReader(bt)
}

type Request struct {
	Method      string
	Header      http.Header
	Path        string
	QueryParams url.Values
	Body        io.Reader
	BodyParams  *BodyParams
	BodyMap     BodyMap
	url         string
}

func NewRequest() *Request {
	return &Request{
		Header:      make(http.Header),
		QueryParams: make(url.Values),
		BodyParams:  &BodyParams{},
		BodyMap:     make(BodyMap),
	}
}

// BuildURL 构建完整的 URL，包含查询参数
func (r *Request) BuildURL(baseURL string) (string, error) {
	// 解析基础 URL
	u, err := url.Parse(baseURL)
	if err != nil {
		return "", err
	}

	// 设置路径
	u.Path += r.Path

	// 设置查询参数
	query := u.Query()
	for key, values := range r.QueryParams {
		for _, value := range values {
			query.Add(key, value)
		}
	}
	u.RawQuery = query.Encode()
	r.url = u.String()

	return r.url, nil
}

func (r *Request) GetFullUrl() string {
	return r.url
}

func (r *Request) Fetch(httpClient *http.Client, baseURL string, conditionFunc func(response *http.Response) error) ([]byte, error) {
	response, err := r.Do(httpClient, baseURL)
	if err != nil {
		return nil, err
	}
	if conditionFunc != nil {
		data, _ := io.ReadAll(response.Body)
		if err := conditionFunc(response); err != nil {
			return nil, err
		}

		// 避免 conditionFunc 中读取了 body 导致下文无法重新读取
		response.Body = io.NopCloser(bytes.NewReader(data))
	}
	bt, err := io.ReadAll(response.Body)
	if err != nil {
		return nil, err
	}
	return bt, nil
}

func (r *Request) Do(httpClient *http.Client, baseURL string) (*http.Response, error) {
	u, err := r.BuildURL(baseURL)
	if err != nil {
		return nil, err
	}
	request, err2 := http.NewRequest(r.Method, u, r.Body)
	if err2 != nil {
		return nil, err2
	}
	request.Header = r.Header
	return httpClient.Do(request)
}
