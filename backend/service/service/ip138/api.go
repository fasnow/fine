package ip138

import (
	"encoding/json"
	"errors"
	"fine/backend/utils"
	"fmt"
	"github.com/buger/jsonparser"
	"golang.org/x/net/html"
	"io"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"time"
)

type domain struct {
	client *IP138
}

type ip struct {
	client *IP138
}
type IPItem struct {
	IP             string `json:"ip"`
	LocationOrDate string `json:"locationOrDate"`
}

type DomainItem struct {
	Domain string `json:"domain"`
	Date   string `json:"date"`
}

func (r *IP138) getToken() (string, error) {
	var token string
	url1 := fmt.Sprintf("%s%s/", Ip138BaseURL, r.domain)
	request, err := http.NewRequest("GET", url1, nil)

	// User-Agent必须为空,不然可能会出现302
	request.Header.Set("User-Agent", "")
	if err != nil {
		return "", err
	}
	response, err := r.http.Do(request)
	if err != nil {
		return "", err
	}
	defer response.Body.Close()
	if response.StatusCode != 200 {
		return "", errors.New("maybe banned")
	}
	body, err := io.ReadAll(response.Body)
	if err != nil {
		return "", err
	}

	// 创建正则表达式模式
	pattern := `var\s+_TOKEN\s+=\s+'(\w+)';`
	regex := regexp.MustCompile(pattern)

	// 使用正则表达式查找匹配项
	match := regex.FindStringSubmatch(string(body))
	if len(match) < 2 {
		return "", errors.New("get token error")
	}

	// 提取目标值
	token = match[1]
	return token, nil
}

// GetCurrentIP
//
//	@Description: 获取当前域名解析的IP地址
//	@return []*IPItem IP列表
//	@return string 额外信息
//	@return error 错误信息
func (d *domain) GetCurrentIP(domain string) ([]*IPItem, string, error) {
	// 第一次i.read()结果为[],需要进行i.write()操作,再次执行i.read()后还是为[]表示成功但没有结果
	d.client.domain = domain
	ips, err := d.read()
	if err != nil {
		return nil, "", err
	}
	if len(ips) == 0 {
		code, err2 := d.client.Domain.write()
		if err2 != nil {
			return nil, "", err2
		}
		if code == 21001 {
			return nil, "", errors.New("获取token时出现错误")
		} else if code == 21002 {
			return nil, "禁止查询该域名", nil
		} else if code == 0 {
			ips, err = d.read()
		}
	}
	var items = make([]*IPItem, 0)
	for ip2, sign := range ips {
		location, err3 := d.getLocation(ip2, sign)
		if err3 != nil {
			return nil, "", err3
		}
		items = append(items, &IPItem{
			IP:             ip2,
			LocationOrDate: location,
		})
		time.Sleep(200 * time.Millisecond)
	}
	return items, "", nil
}

// GetHistoryIP
//
//	@Description: 获取当前域名的历史解析记录
//	@return []*IPItem ip列表
//	@return error 错误信息
func (d *domain) GetHistoryIP(domain string) ([]*IPItem, error) {
	url1 := fmt.Sprintf("%s%s", Ip138BaseURL, domain)
	request, err := http.NewRequest("GET", url1, nil)
	// User-Agent必须为空,不然可能会出现302,read和write的User-Agent必须一致
	request.Header.Set("User-Agent", "")
	if err != nil {
		return nil, err
	}
	response, err := d.client.http.Do(request)
	if err != nil {
		return nil, err
	}
	if response.StatusCode == 502 {
		return nil, errors.New("可能被ban了")
	}
	body, err := io.ReadAll(response.Body)
	if err != nil {
		return nil, err
	}
	doc, err := html.Parse(strings.NewReader(string(body)))
	if err != nil {
		return nil, err
	}
	return d.findElements(doc), nil
}

func (d *domain) read() (map[string]string, error) {
	ips := map[string]string{}
	params := url.Values{}
	params.Set("domain", d.client.domain)
	//params.Set("time", fmt.Sprint(time.Now().UnixNano()/int64(time.Millisecond)))

	url1 := fmt.Sprintf("%s?%s", Ip138BaseReadURL, params.Encode())
	request, err := http.NewRequest("GET", url1, nil)
	// User-Agent必须为空,不然可能会出现302,read和write的User-Agent必须一致
	request.Header.Set("User-Agent", "")
	if err != nil {
		return nil, err
	}
	response, err := d.client.http.Do(request)
	if err != nil {
		return nil, err
	}
	if response.StatusCode == 502 {
		return nil, errors.New("可能被ban了")
	}
	body, err := io.ReadAll(response.Body)
	if err != nil {
		return nil, err
	}
	var result Response
	err = json.Unmarshal(body, &result)
	if err != nil {
		return nil, err
	}
	if err != nil {
		return nil, err
	}
	if result.Status {
		for _, entry := range result.Data {
			ips[entry.IP] = entry.Sign
		}
	}
	return ips, nil
}

// 0成功；
// 21001 token和域名不匹配；
// 21002 禁止查询该域名
func (d *domain) write() (int, error) {
	token, err := d.client.getToken()
	if err != nil {
		return -1, err
	}
	params := url.Values{}
	params.Set("type", "domain")
	params.Set("input", d.client.domain)
	params.Set("token", token)
	//params.Set("time", fmt.Sprint(time.Now().UnixNano()/int64(time.Millisecond)))

	url1 := fmt.Sprintf("%s?%s", Ip138BaseWriteURL, params.Encode())
	request, err := http.NewRequest("GET", url1, nil)
	if err != nil {
		return -1, err
	}
	request.Header.Set("User-Agent", "") // User-Agent必须为空,不然可能会出现302,read和write的User-Agent必须一致
	response, err := d.client.http.Do(request)
	if err != nil {
		return -1, err
	}
	body, err := io.ReadAll(response.Body)
	if err != nil {
		return -1, err
	}
	code, err := jsonparser.GetInt(body, "code")
	if err != nil {
		return -1, err
	}
	return int(code), nil
}

func (d *domain) getLocation(ip, sign string) (string, error) {
	//?ip=104.21.53.119&oid=5&mid=5&from=siteFront&datatype=json&sign=e42751019ebb86b656608094f965b2b4
	params := url.Values{}
	params.Set("ip", ip)
	params.Set("oid", "5")
	params.Set("mid", "5")
	params.Set("from", "siteFront")
	params.Set("datatype", "json")
	params.Set("sign", sign)
	url1 := fmt.Sprintf("%s?%s", Ip138BaseLocateURL, params.Encode())
	request, err := http.NewRequest("GET", url1, nil)
	request.Header.Set("User-Agent", "") // User-Agent必须为空,不然可能会出现302
	if err != nil {
		return "", err
	}
	response, err := d.client.http.Do(request)
	if err != nil {
		return "", err
	}
	if response.StatusCode == 500 {
		return "", errors.New("可能被ban了")
	}
	body, err := io.ReadAll(response.Body)
	if err != nil {
		return "", err
	}
	var resp struct {
		Ret  string   `json:"ret"`
		IP   string   `json:"ip"`
		Data []string `json:"data"`
	}
	err = json.Unmarshal(body, &resp)
	if err != nil {
		return "", errors.New("返回了非预期数据")
	}
	return utils.RemoveEmptyAndDuplicateAndJoinStrings(resp.Data, " "), nil
}

func (d *domain) findElements(n *html.Node) []*IPItem {
	var items = make([]*IPItem, 0)
	if n.Type == html.ElementNode && n.Data == "div" && utils.HtmlHasID(n, "J_ip_history") {
		for c := n.FirstChild; c != nil; c = c.NextSibling {
			if c.Type == html.ElementNode && c.Data == "p" {
				span, a := d.extractElements(c)
				if span != "" && a != "" {
					items = append(items, &IPItem{
						IP:             a,
						LocationOrDate: span,
					})
				}
			}
		}
	}

	for c := n.FirstChild; c != nil; c = c.NextSibling {
		items = append(items, d.findElements(c)...)
	}
	return items
}

func (d *domain) extractElements(n *html.Node) (string, string) {
	span := ""
	a := ""

	for c := n.FirstChild; c != nil; c = c.NextSibling {
		if c.Type == html.ElementNode && c.Data == "span" && c.FirstChild != nil {
			span = c.FirstChild.Data
		}
		if c.Type == html.ElementNode && c.Data == "a" && c.FirstChild != nil {
			a = c.FirstChild.Data
		}
	}

	return span, a
}

func (i *ip) GetCurrentDomain(ip string) ([]*DomainItem, error) {
	url1 := fmt.Sprintf("%s%s/", Ip138BaseURL, ip)
	request, err := http.NewRequest("GET", url1, nil)
	// User-Agent必须为空,不然可能会出现302
	request.Header.Set("User-Agent", "")
	if err != nil {
		return nil, err
	}
	response, err := i.client.http.Do(request)
	if err != nil {
		return nil, err
	}
	if response.StatusCode == 502 {
		return nil, errors.New("可能被ban了")
	}
	body, err := io.ReadAll(response.Body)
	if err != nil {
		return nil, err
	}
	if err != nil {
		return nil, err
	}
	doc, err := html.Parse(strings.NewReader(string(body)))
	if err != nil {
		return nil, err
	}
	var items = make([]*DomainItem, 0)
	var traverse func(*html.Node)
	traverse = func(n *html.Node) {
		if n.Type == html.ElementNode && n.Data == "ul" {
			for _, attr := range n.Attr {
				if attr.Key == "id" && attr.Val == "list" {
					for c := n.FirstChild; c != nil; c = c.NextSibling {
						if c.Type == html.ElementNode && c.Data == "li" {
							liCount := 0
							for li := c; li != nil; li = li.NextSibling {
								if li.Type == html.ElementNode && li.Data == "li" {
									liCount++
									if liCount >= 3 {
										a := i.findChildByTag(li, "a")
										span := i.findChildByTag(li, "span")
										if a != nil && span != nil {
											var aText, spanText string
											i.traverseText(a, &aText)
											i.traverseText(span, &spanText)
											items = append(items, &DomainItem{
												Domain: aText,
												Date:   spanText,
											})
										}
									}
								}
							}
							break
						}
					}
					break
				}
			}
			return
		}
		for c := n.FirstChild; c != nil; c = c.NextSibling {
			traverse(c)
		}
	}

	traverse(doc)

	return items, nil

}

func (i *ip) findChildByTag(n *html.Node, tag string) *html.Node {
	for c := n.FirstChild; c != nil; c = c.NextSibling {
		if c.Type == html.ElementNode && c.Data == tag {
			return c
		}
	}
	return nil
}

func (i *ip) traverseText(n *html.Node, text *string) {
	if n.Type == html.TextNode {
		*text += n.Data
	}
	for c := n.FirstChild; c != nil; c = c.NextSibling {
		i.traverseText(c, text)
	}
}
