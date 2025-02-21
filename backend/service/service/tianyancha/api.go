package tianyancha

import (
	"bytes"
	"encoding/json"
	"errors"
	"github.com/tidwall/gjson"
	"io"
	"net/http"
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

func (r *TianYanCha) GetIndustryList() ([]IndustryNode, error) {
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

func (r *TianYanCha) GetAreaList() ([]AreaNode, error) {
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

type Item struct {
	ID                   int64    `json:"id"`
	Name                 string   `json:"name"`
	Type                 int      `json:"type"`
	MatchType            any      `json:"matchType"`
	Base                 string   `json:"base"`
	LegalPersonName      string   `json:"legalPersonName"`
	EstiblishTime        string   `json:"estiblishTime"`
	RegCapital           string   `json:"regCapital"`
	RegStatus            string   `json:"regStatus"`
	Score                string   `json:"score"`
	OrginalScore         string   `json:"orginalScore"`
	BonusScore           string   `json:"bonusScore"`
	CompanyScore         string   `json:"companyScore"`
	HistoryNames         string   `json:"historyNames"`
	CategoryCode         string   `json:"categoryCode"`
	Industry             any      `json:"industry"`
	HumanNames           any      `json:"humanNames"`
	Trademarks           any      `json:"trademarks"`
	TmList               any      `json:"tmList"`
	ProductList          any      `json:"productList"`
	UsedBondName         any      `json:"usedBondName"`
	BondName             any      `json:"bondName"`
	BondNum              any      `json:"bondNum"`
	BondType             any      `json:"bondType"`
	NewtestName          any      `json:"newtestName"`
	RegNumber            string   `json:"regNumber"`
	OrgNumber            string   `json:"orgNumber"`
	CreditCode           string   `json:"creditCode"`
	BusinessScope        string   `json:"businessScope"`
	RegLocation          string   `json:"regLocation"`
	Phone                any      `json:"phone"`
	PhoneList            []string `json:"phoneList"`
	PhoneInfoList        any      `json:"phoneInfoList"`
	BusinessItemList     any      `json:"businessItemList"`
	PhoneNum             string   `json:"phoneNum"`
	Logo                 string   `json:"logo"`
	City                 string   `json:"city"`
	District             any      `json:"district"`
	Emails               any      `json:"emails"`
	EmailList            []string `json:"emailList"`
	Websites             string   `json:"websites"`
	HiddenPhones         any      `json:"hiddenPhones"`
	Abbr                 any      `json:"abbr"`
	TagList              any      `json:"tagList"`
	CompanyType          int      `json:"companyType"`
	CompanyOrgType       any      `json:"companyOrgType"`
	LabelList            any      `json:"labelList"`
	MatchField           any      `json:"matchField"`
	Latitude             any      `json:"latitude"`
	Longitude            any      `json:"longitude"`
	LegalPersonID        string   `json:"legalPersonId"`
	LegalPersonType      string   `json:"legalPersonType"`
	Distance             any      `json:"distance"`
	CategoryStr          any      `json:"categoryStr"`
	IsClaimed            int      `json:"isClaimed"`
	ClaimPkgType         any      `json:"claimPkgType"`
	RealClaimPkgType     any      `json:"realClaimPkgType"`
	BaiduURL             any      `json:"baiduUrl"`
	IsBranch             int      `json:"isBranch"`
	Alias                string   `json:"alias"`
	ClaimInfo            any      `json:"claimInfo"`
	Hidden               int      `json:"hidden"`
	LegalPersonShowStr   string   `json:"legalPersonShowStr"`
	RegCapitalShowStr    string   `json:"regCapitalShowStr"`
	EstiblishTimeShowStr string   `json:"estiblishTimeShowStr"`
	MultiMatchField      []struct {
		Field   string `json:"field"`
		Display string `json:"display"`
		Content string `json:"content"`
		JumpURL string `json:"jumpUrl,omitempty"`
		IsLink  int    `json:"isLink,omitempty"`
	} `json:"multiMatchField"`
	LabelListV2                any    `json:"labelListV2"`
	LabelJSONList              any    `json:"labelJsonList"`
	TaxCode                    string `json:"taxCode"`
	SocialSecurityStaffNum     string `json:"socialSecurityStaff_num"`
	CategoryCodeStd            any    `json:"categoryCodeStd"`
	HasMorePhone               any    `json:"hasMorePhone"`
	HasVideo                   any    `json:"hasVideo"`
	VideoID                    any    `json:"videoId"`
	IsRecommend                any    `json:"isRecommend"`
	EnglishName                any    `json:"englishName"`
	FirstPositionShowStr       string `json:"firstPositionShowStr"`
	SecondPositionShowStr      string `json:"secondPositionShowStr"`
	FirstPositionValue         string `json:"firstPositionValue"`
	SecondPositionValue        string `json:"secondPositionValue"`
	BizType                    string `json:"bizType"`
	DocFeature                 string `json:"docFeature"`
	CompanyNum                 any    `json:"companyNum"`
	Department                 string `json:"department"`
	IllegalType                string `json:"illegalType"`
	TargetGid                  string `json:"targetGid"`
	TargetName                 string `json:"targetName"`
	ChangeTime                 string `json:"changeTime"`
	IsIn                       string `json:"isIn"`
	MainID                     string `json:"mainId"`
	TargetRegCapitalAmount     string `json:"targetRegCapitalAmount"`
	TargetRegCapitalCurrency   string `json:"targetRegCapitalCurrency"`
	LegalPerson                string `json:"legalPerson"`
	GidForB                    string `json:"gidForB"`
	GeoLocation                any    `json:"geoLocation"`
	WebsiteFilingCount         int    `json:"websiteFilingCount"`
	RepCurrency                any    `json:"repCurrency"`
	Province                   any    `json:"province"`
	AreaCodes                  any    `json:"areaCodes"`
	Address                    any    `json:"address"`
	EstablishmentTime          string `json:"establishmentTime"`
	Icps                       any    `json:"icps"`
	Icp                        string `json:"icp"`
	ChangeRatio                string `json:"changeRatio"`
	AfterRatio                 string `json:"afterRatio"`
	ChangeAmt                  string `json:"changeAmt"`
	RegisterInstitute          string `json:"registerInstitute"`
	CompanyScale               any    `json:"companyScale"`
	AbstractsBaseInfo          string `json:"abstractsBaseInfo"`
	FinancingRound             string `json:"financingRound"`
	StaffNumReportYear         int    `json:"staffNumReportYear"`
	CategoryCode2017List       any    `json:"categoryCode2017List"`
	InstitutionTypeList        any    `json:"institutionTypeList"`
	CompanyBrandInfo           any    `json:"companyBrandInfo"`
	CompanyGroupInfo           any    `json:"companyGroupInfo"`
	ContantMap                 any    `json:"contantMap"`
	CompanyPhoneBook           any    `json:"companyPhoneBook"`
	CompanyQuestions           any    `json:"companyQuestions"`
	SelfRiskCount              int    `json:"selfRiskCount"`
	LegalPersonLogo            any    `json:"legalPersonLogo"`
	LegalPersonAlias           any    `json:"legalPersonAlias"`
	RelatedRiskCount           int    `json:"relatedRiskCount"`
	HistoryRiskCount           int    `json:"historyRiskCount"`
	FollowLabel                string `json:"followLabel"`
	ContentType                int    `json:"contentType"`
	NormalWord                 any    `json:"normalWord"`
	SuggestWordList            any    `json:"suggestWordList"`
	CompanyHumanInfo           any    `json:"companyHumanInfo"`
	PhoneType                  int    `json:"phoneType"`
	PhoneTips                  string `json:"phoneTips"`
	PublicSentimentNewsInfo    any    `json:"publicSentimentNewsInfo"`
	EnterpriseServiceGoodsInfo any    `json:"enterpriseServiceGoodsInfo"`
	QfLabels                   any    `json:"qfLabels"`
	ProductShowMore            any    `json:"productShowMore"`
	GoodsAndProducts           any    `json:"goodsAndProducts"`
	ShortVideoList             any    `json:"shortVideoList"`
	FocusCompanyList           any    `json:"focusCompanyList"`
	IsBrandArea                int    `json:"isBrandArea"`
	AreaType                   int    `json:"areaType"`
	CustomizedImagePath        string `json:"customizedImagePath"`
	IsBrandAreaControlGroup    int    `json:"isBrandAreaControlGroup"`
	AdsFlag                    any    `json:"adsFlag"`
	IsCooperationShow          any    `json:"isCooperationShow"`
	CooperationURL             string `json:"cooperationUrl"`
	AlbumHeadImgPath           any    `json:"albumHeadImgPath"`
	AlbumCount                 any    `json:"albumCount"`
	WebsiteURL                 any    `json:"websiteUrl"`
	WebsiteRiskType            int    `json:"websiteRiskType"`
	HotMsg                     any    `json:"hotMsg"`
	HotType                    any    `json:"hotType"`
	CompetitorName             any    `json:"competitorName"`
	BrandInstitutionGroupCard  any    `json:"brandInstitutionGroupCard"`
	PublishDemandCard          any    `json:"publishDemandCard"`
	AppDynamicCompanyCard      any    `json:"appDynamicCompanyCard"`
	EmptyRecommendTextCard     any    `json:"emptyRecommendTextCard"`
	EmptyRecommendCompanyCard  any    `json:"emptyRecommendCompanyCard"`
	RecommendScene             any    `json:"recommendScene"`
	CompanyBrand               struct {
		ID      string `json:"id"`
		Name    string `json:"name"`
		Primary bool   `json:"primary"`
		URL     string `json:"url"`
	} `json:"companyBrand"`
	CompanyGroup struct {
		ID      string `json:"id"`
		Name    string `json:"name"`
		Type    int    `json:"type"`
		Primary bool   `json:"primary"`
	} `json:"companyGroup"`
	InstitutionCard           any              `json:"institutionCard"`
	VerticalCard              any              `json:"verticalCard"`
	PhoneTagType              int              `json:"phoneTagType"`
	AladdinCompanyCard        any              `json:"aladdinCompanyCard"`
	IllegalSocialOrganization any              `json:"illegalSocialOrganization"`
	LabelListV3               []LabelListV3    `json:"labelListV3"`
	RegStatusLabel            []RegStatusLabel `json:"regStatusLabel"`
	NewlyCompanyCard          any              `json:"newlyCompanyCard"`
	DeepSearchCard            any              `json:"deepSearchCard"`
	LegalPersonForList        string           `json:"legalPersonForList"`
	RegCapitalForList         string           `json:"regCapitalForList"`
	ProvinceName              string           `json:"provinceName"`
	CityName                  string           `json:"cityName"`
	DistrictName              string           `json:"districtName"`
	CategoryNameLv1           string           `json:"categoryNameLv1"`
	CategoryNameLv2           string           `json:"categoryNameLv2"`
	CategoryNameLv3           string           `json:"categoryNameLv3"`
	CategoryNameLv4           string           `json:"categoryNameLv4"`
	OrgType                   string           `json:"orgType"`
	ApproveDate               string           `json:"approveDate"`
	BusinessTerm              string           `json:"businessTerm"`
	SocialSecurityStaffNum0   string           `json:"socialSecurityStaffNum"`
	CompanyScaleInfo          struct {
		Name     string `json:"name"`
		IconType string `json:"iconType"`
	} `json:"companyScaleInfo"`
	FollowInfo struct {
		Status  int `json:"status"`
		TagID   any `json:"tagId"`
		TagName any `json:"tagName"`
	} `json:"followInfo"`
	LegalPersonList []struct {
		Hid  int    `json:"hid"`
		Cid  int64  `json:"cid"`
		Type int    `json:"type"`
		Name string `json:"name"`
	} `json:"legalPersonList"`
	EnglishNameForTab string `json:"englishNameForTab"`
}

type RecommendItem struct {
	ID                       int      `json:"id"`
	Name                     string   `json:"name"`
	Type                     int      `json:"type"`
	MatchType                any      `json:"matchType"`
	Base                     string   `json:"base"`
	LegalPersonName          string   `json:"legalPersonName"`
	EstiblishTime            string   `json:"estiblishTime"`
	RegCapital               string   `json:"regCapital"`
	RegStatus                string   `json:"regStatus"`
	Score                    string   `json:"score"`
	OrginalScore             string   `json:"orginalScore"`
	BonusScore               string   `json:"bonusScore"`
	CompanyScore             string   `json:"companyScore"`
	HistoryNames             string   `json:"historyNames"`
	CategoryCode             string   `json:"categoryCode"`
	Industry                 any      `json:"industry"`
	HumanNames               string   `json:"humanNames"`
	Trademarks               any      `json:"trademarks"`
	TmList                   any      `json:"tmList"`
	ProductList              any      `json:"productList"`
	UsedBondName             any      `json:"usedBondName"`
	BondName                 any      `json:"bondName"`
	BondNum                  any      `json:"bondNum"`
	BondType                 string   `json:"bondType"`
	NewtestName              any      `json:"newtestName"`
	RegNumber                string   `json:"regNumber"`
	OrgNumber                string   `json:"orgNumber"`
	CreditCode               string   `json:"creditCode"`
	BusinessScope            string   `json:"businessScope"`
	RegLocation              string   `json:"regLocation"`
	Phone                    string   `json:"phone"`
	PhoneList                any      `json:"phoneList"`
	PhoneInfoList            []any    `json:"phoneInfoList"`
	BusinessItemList         any      `json:"businessItemList"`
	PhoneNum                 any      `json:"phoneNum"`
	Logo                     string   `json:"logo"`
	City                     string   `json:"city"`
	District                 string   `json:"district"`
	Emails                   string   `json:"emails"`
	EmailList                []string `json:"emailList"`
	Websites                 string   `json:"websites"`
	HiddenPhones             any      `json:"hiddenPhones"`
	Abbr                     string   `json:"abbr"`
	TagList                  any      `json:"tagList"`
	CompanyType              int      `json:"companyType"`
	CompanyOrgType           string   `json:"companyOrgType"`
	LabelList                any      `json:"labelList"`
	MatchField               any      `json:"matchField"`
	Latitude                 any      `json:"latitude"`
	Longitude                any      `json:"longitude"`
	LegalPersonID            string   `json:"legalPersonId"`
	LegalPersonType          string   `json:"legalPersonType"`
	Distance                 any      `json:"distance"`
	CategoryStr              string   `json:"categoryStr"`
	IsClaimed                int      `json:"isClaimed"`
	ClaimPkgType             any      `json:"claimPkgType"`
	RealClaimPkgType         any      `json:"realClaimPkgType"`
	BaiduURL                 any      `json:"baiduUrl"`
	IsBranch                 int      `json:"isBranch"`
	Alias                    string   `json:"alias"`
	ClaimInfo                any      `json:"claimInfo"`
	Hidden                   int      `json:"hidden"`
	LegalPersonShowStr       string   `json:"legalPersonShowStr"`
	RegCapitalShowStr        string   `json:"regCapitalShowStr"`
	EstiblishTimeShowStr     string   `json:"estiblishTimeShowStr"`
	MultiMatchField          []any    `json:"multiMatchField"`
	LabelListV2              []string `json:"labelListV2"`
	LabelJSONList            []string `json:"labelJsonList"`
	TaxCode                  string   `json:"taxCode"`
	SocialSecurityStaffNum   string   `json:"socialSecurityStaff_num"`
	CategoryCodeStd          string   `json:"categoryCodeStd"`
	HasMorePhone             any      `json:"hasMorePhone"`
	HasVideo                 any      `json:"hasVideo"`
	VideoID                  any      `json:"videoId"`
	IsRecommend              int      `json:"isRecommend"`
	EnglishName              string   `json:"englishName"`
	FirstPositionShowStr     string   `json:"firstPositionShowStr"`
	SecondPositionShowStr    string   `json:"secondPositionShowStr"`
	FirstPositionValue       string   `json:"firstPositionValue"`
	SecondPositionValue      string   `json:"secondPositionValue"`
	BizType                  string   `json:"bizType"`
	DocFeature               any      `json:"docFeature"`
	CompanyNum               any      `json:"companyNum"`
	Department               string   `json:"department"`
	IllegalType              string   `json:"illegalType"`
	TargetGid                string   `json:"targetGid"`
	TargetName               string   `json:"targetName"`
	ChangeTime               string   `json:"changeTime"`
	IsIn                     string   `json:"isIn"`
	MainID                   string   `json:"mainId"`
	TargetRegCapitalAmount   string   `json:"targetRegCapitalAmount"`
	TargetRegCapitalCurrency string   `json:"targetRegCapitalCurrency"`
	LegalPerson              string   `json:"legalPerson"`
	GidForB                  string   `json:"gidForB"`
	GeoLocation              any      `json:"geoLocation"`
	WebsiteFilingCount       int      `json:"websiteFilingCount"`
	RepCurrency              any      `json:"repCurrency"`
	Province                 string   `json:"province"`
	AreaCodes                []string `json:"areaCodes"`
	Address                  any      `json:"address"`
	EstablishmentTime        string   `json:"establishmentTime"`
	Icps                     any      `json:"icps"`
	Icp                      string   `json:"icp"`
	ChangeRatio              string   `json:"changeRatio"`
	AfterRatio               string   `json:"afterRatio"`
	ChangeAmt                string   `json:"changeAmt"`
	RegisterInstitute        string   `json:"registerInstitute"`
	CompanyScale             string   `json:"companyScale"`
	AbstractsBaseInfo        string   `json:"abstractsBaseInfo"`
	FinancingRound           string   `json:"financingRound"`
	StaffNumReportYear       int      `json:"staffNumReportYear"`
	CategoryCode2017List     []string `json:"categoryCode2017List"`
	InstitutionTypeList      []string `json:"institutionTypeList"`
	CompanyBrandInfo         any      `json:"companyBrandInfo"`
	CompanyGroupInfo         any      `json:"companyGroupInfo"`
	ContantMap               struct {
		RecallSrc         string `json:"recallSrc"`
		ParamRegCapital   string `json:"param_reg_capital"`
		EstablishTimeLong string `json:"establish_time_long"`
	} `json:"contantMap,omitempty"`
	CompanyPhoneBook           any              `json:"companyPhoneBook"`
	CompanyQuestions           any              `json:"companyQuestions"`
	SelfRiskCount              int              `json:"selfRiskCount"`
	LegalPersonLogo            any              `json:"legalPersonLogo"`
	LegalPersonAlias           any              `json:"legalPersonAlias"`
	RelatedRiskCount           int              `json:"relatedRiskCount"`
	HistoryRiskCount           int              `json:"historyRiskCount"`
	FollowLabel                any              `json:"followLabel"`
	ContentType                int              `json:"contentType"`
	NormalWord                 any              `json:"normalWord"`
	SuggestWordList            any              `json:"suggestWordList"`
	CompanyHumanInfo           any              `json:"companyHumanInfo"`
	PhoneType                  any              `json:"phoneType"`
	PhoneTips                  any              `json:"phoneTips"`
	PublicSentimentNewsInfo    any              `json:"publicSentimentNewsInfo"`
	EnterpriseServiceGoodsInfo any              `json:"enterpriseServiceGoodsInfo"`
	QfLabels                   any              `json:"qfLabels"`
	ProductShowMore            any              `json:"productShowMore"`
	GoodsAndProducts           any              `json:"goodsAndProducts"`
	ShortVideoList             any              `json:"shortVideoList"`
	FocusCompanyList           any              `json:"focusCompanyList"`
	IsBrandArea                int              `json:"isBrandArea"`
	AreaType                   int              `json:"areaType"`
	CustomizedImagePath        string           `json:"customizedImagePath"`
	IsBrandAreaControlGroup    int              `json:"isBrandAreaControlGroup"`
	AdsFlag                    any              `json:"adsFlag"`
	IsCooperationShow          any              `json:"isCooperationShow"`
	CooperationURL             string           `json:"cooperationUrl"`
	AlbumHeadImgPath           any              `json:"albumHeadImgPath"`
	AlbumCount                 any              `json:"albumCount"`
	WebsiteURL                 any              `json:"websiteUrl"`
	WebsiteRiskType            int              `json:"websiteRiskType"`
	HotMsg                     any              `json:"hotMsg"`
	HotType                    any              `json:"hotType"`
	CompetitorName             any              `json:"competitorName"`
	BrandInstitutionGroupCard  any              `json:"brandInstitutionGroupCard"`
	PublishDemandCard          any              `json:"publishDemandCard"`
	AppDynamicCompanyCard      any              `json:"appDynamicCompanyCard"`
	EmptyRecommendTextCard     any              `json:"emptyRecommendTextCard"`
	EmptyRecommendCompanyCard  any              `json:"emptyRecommendCompanyCard"`
	RecommendScene             any              `json:"recommendScene"`
	CompanyBrand               any              `json:"companyBrand"`
	CompanyGroup               any              `json:"companyGroup"`
	InstitutionCard            any              `json:"institutionCard"`
	VerticalCard               any              `json:"verticalCard"`
	PhoneTagType               any              `json:"phoneTagType"`
	AladdinCompanyCard         any              `json:"aladdinCompanyCard"`
	IllegalSocialOrganization  any              `json:"illegalSocialOrganization"`
	LabelListV3                []LabelListV3    `json:"labelListV3"`
	RegStatusLabel             []RegStatusLabel `json:"regStatusLabel"`
	NewlyCompanyCard           any              `json:"newlyCompanyCard"`
	DeepSearchCard             any              `json:"deepSearchCard"`
	LegalPersonForList         any              `json:"legalPersonForList"`
	RegCapitalForList          any              `json:"regCapitalForList"`
	ProvinceName               any              `json:"provinceName"`
	CityName                   any              `json:"cityName"`
	DistrictName               any              `json:"districtName"`
	CategoryNameLv1            any              `json:"categoryNameLv1"`
	CategoryNameLv2            any              `json:"categoryNameLv2"`
	CategoryNameLv3            any              `json:"categoryNameLv3"`
	CategoryNameLv4            any              `json:"categoryNameLv4"`
	OrgType                    any              `json:"orgType"`
	ApproveDate                any              `json:"approveDate"`
	BusinessTerm               any              `json:"businessTerm"`
	SocialSecurityStaffNum0    any              `json:"socialSecurityStaffNum"`
	CompanyScaleInfo           any              `json:"companyScaleInfo"`
	FollowInfo                 struct {
		Status  int `json:"status"`
		TagID   any `json:"tagId"`
		TagName any `json:"tagName"`
	} `json:"followInfo"`
	LegalPersonList []struct {
		Hid  int    `json:"hid"`
		Cid  int    `json:"cid"`
		Type int    `json:"type"`
		Name string `json:"name"`
	} `json:"legalPersonList"`
	EnglishNameForTab string `json:"englishNameForTab"`
	ContantMap0       struct {
		RecallSrc         string `json:"recallSrc"`
		EstablishTimeLong string `json:"establish_time_long"`
	} `json:"contantMap,omitempty"`
}

type CompanyItem struct {
	ID                         int64    `json:"id"`
	Name                       string   `json:"name"`
	Type                       int      `json:"type"`
	MatchType                  any      `json:"matchType"`
	Base                       string   `json:"base"`
	LegalPersonName            string   `json:"legalPersonName"`
	EstiblishTime              string   `json:"estiblishTime"`
	RegCapital                 string   `json:"regCapital"`
	RegStatus                  string   `json:"regStatus"`
	Score                      string   `json:"score"`
	OrginalScore               string   `json:"orginalScore"`
	BonusScore                 string   `json:"bonusScore"`
	CompanyScore               string   `json:"companyScore"`
	HistoryNames               string   `json:"historyNames"`
	CategoryCode               string   `json:"categoryCode"`
	Industry                   any      `json:"industry"`
	HumanNames                 any      `json:"humanNames"`
	Trademarks                 any      `json:"trademarks"`
	TmList                     any      `json:"tmList"`
	ProductList                any      `json:"productList"`
	UsedBondName               any      `json:"usedBondName"`
	BondName                   any      `json:"bondName"`
	BondNum                    any      `json:"bondNum"`
	BondType                   any      `json:"bondType"`
	NewtestName                any      `json:"newtestName"`
	RegNumber                  string   `json:"regNumber"`
	OrgNumber                  string   `json:"orgNumber"`
	CreditCode                 string   `json:"creditCode"`
	BusinessScope              string   `json:"businessScope"`
	RegLocation                string   `json:"regLocation"`
	Phone                      any      `json:"phone"`
	PhoneList                  []string `json:"phoneList"`
	PhoneInfoList              any      `json:"phoneInfoList"`
	BusinessItemList           any      `json:"businessItemList"`
	PhoneNum                   string   `json:"phoneNum"`
	Logo                       string   `json:"logo"`
	City                       string   `json:"city"`
	District                   any      `json:"district"`
	Emails                     any      `json:"emails"`
	EmailList                  []string `json:"emailList"`
	Websites                   string   `json:"websites"`
	HiddenPhones               any      `json:"hiddenPhones"`
	Abbr                       any      `json:"abbr"`
	TagList                    any      `json:"tagList"`
	CompanyType                int      `json:"companyType"`
	CompanyOrgType             any      `json:"companyOrgType"`
	LabelList                  any      `json:"labelList"`
	MatchField                 any      `json:"matchField"`
	Latitude                   any      `json:"latitude"`
	Longitude                  any      `json:"longitude"`
	LegalPersonID              string   `json:"legalPersonId"`
	LegalPersonType            string   `json:"legalPersonType"`
	Distance                   any      `json:"distance"`
	CategoryStr                any      `json:"categoryStr"`
	IsClaimed                  int      `json:"isClaimed"`
	ClaimPkgType               any      `json:"claimPkgType"`
	RealClaimPkgType           any      `json:"realClaimPkgType"`
	BaiduURL                   any      `json:"baiduUrl"`
	IsBranch                   int      `json:"isBranch"`
	Alias                      string   `json:"alias"`
	ClaimInfo                  any      `json:"claimInfo"`
	Hidden                     int      `json:"hidden"`
	LegalPersonShowStr         string   `json:"legalPersonShowStr"`
	RegCapitalShowStr          string   `json:"regCapitalShowStr"`
	EstiblishTimeShowStr       string   `json:"estiblishTimeShowStr"`
	MultiMatchField            []any    `json:"multiMatchField"`
	LabelListV2                any      `json:"labelListV2"`
	LabelJSONList              any      `json:"labelJsonList"`
	TaxCode                    string   `json:"taxCode"`
	SocialSecurityStaffNum     string   `json:"socialSecurityStaff_num"`
	CategoryCodeStd            any      `json:"categoryCodeStd"`
	HasMorePhone               any      `json:"hasMorePhone"`
	HasVideo                   any      `json:"hasVideo"`
	VideoID                    any      `json:"videoId"`
	IsRecommend                any      `json:"isRecommend"`
	EnglishName                any      `json:"englishName"`
	FirstPositionShowStr       string   `json:"firstPositionShowStr"`
	SecondPositionShowStr      string   `json:"secondPositionShowStr"`
	FirstPositionValue         string   `json:"firstPositionValue"`
	SecondPositionValue        string   `json:"secondPositionValue"`
	BizType                    string   `json:"bizType"`
	DocFeature                 string   `json:"docFeature"`
	CompanyNum                 any      `json:"companyNum"`
	Department                 string   `json:"department"`
	IllegalType                string   `json:"illegalType"`
	TargetGid                  string   `json:"targetGid"`
	TargetName                 string   `json:"targetName"`
	ChangeTime                 string   `json:"changeTime"`
	IsIn                       string   `json:"isIn"`
	MainID                     string   `json:"mainId"`
	TargetRegCapitalAmount     string   `json:"targetRegCapitalAmount"`
	TargetRegCapitalCurrency   string   `json:"targetRegCapitalCurrency"`
	LegalPerson                string   `json:"legalPerson"`
	GidForB                    string   `json:"gidForB"`
	GeoLocation                any      `json:"geoLocation"`
	WebsiteFilingCount         int      `json:"websiteFilingCount"`
	RepCurrency                any      `json:"repCurrency"`
	Province                   any      `json:"province"`
	AreaCodes                  any      `json:"areaCodes"`
	Address                    any      `json:"address"`
	EstablishmentTime          string   `json:"establishmentTime"`
	Icps                       any      `json:"icps"`
	Icp                        string   `json:"icp"`
	ChangeRatio                string   `json:"changeRatio"`
	AfterRatio                 string   `json:"afterRatio"`
	ChangeAmt                  string   `json:"changeAmt"`
	RegisterInstitute          string   `json:"registerInstitute"`
	CompanyScale               any      `json:"companyScale"`
	AbstractsBaseInfo          string   `json:"abstractsBaseInfo"`
	FinancingRound             string   `json:"financingRound"`
	StaffNumReportYear         int      `json:"staffNumReportYear"`
	CategoryCode2017List       any      `json:"categoryCode2017List"`
	InstitutionTypeList        any      `json:"institutionTypeList"`
	CompanyBrandInfo           any      `json:"companyBrandInfo"`
	CompanyGroupInfo           any      `json:"companyGroupInfo"`
	ContantMap                 any      `json:"contantMap"`
	CompanyPhoneBook           any      `json:"companyPhoneBook"`
	CompanyQuestions           any      `json:"companyQuestions"`
	SelfRiskCount              int      `json:"selfRiskCount"`
	LegalPersonLogo            any      `json:"legalPersonLogo"`
	LegalPersonAlias           any      `json:"legalPersonAlias"`
	RelatedRiskCount           int      `json:"relatedRiskCount"`
	HistoryRiskCount           int      `json:"historyRiskCount"`
	FollowLabel                string   `json:"followLabel"`
	ContentType                int      `json:"contentType"`
	NormalWord                 any      `json:"normalWord"`
	SuggestWordList            any      `json:"suggestWordList"`
	CompanyHumanInfo           any      `json:"companyHumanInfo"`
	PhoneType                  any      `json:"phoneType"`
	PhoneTips                  any      `json:"phoneTips"`
	PublicSentimentNewsInfo    any      `json:"publicSentimentNewsInfo"`
	EnterpriseServiceGoodsInfo any      `json:"enterpriseServiceGoodsInfo"`
	QfLabels                   any      `json:"qfLabels"`
	ProductShowMore            any      `json:"productShowMore"`
	GoodsAndProducts           any      `json:"goodsAndProducts"`
	ShortVideoList             any      `json:"shortVideoList"`
	FocusCompanyList           any      `json:"focusCompanyList"`
	IsBrandArea                int      `json:"isBrandArea"`
	AreaType                   int      `json:"areaType"`
	CustomizedImagePath        string   `json:"customizedImagePath"`
	IsBrandAreaControlGroup    int      `json:"isBrandAreaControlGroup"`
	AdsFlag                    any      `json:"adsFlag"`
	IsCooperationShow          any      `json:"isCooperationShow"`
	CooperationURL             string   `json:"cooperationUrl"`
	AlbumHeadImgPath           any      `json:"albumHeadImgPath"`
	AlbumCount                 any      `json:"albumCount"`
	WebsiteURL                 any      `json:"websiteUrl"`
	WebsiteRiskType            int      `json:"websiteRiskType"`
	HotMsg                     any      `json:"hotMsg"`
	HotType                    any      `json:"hotType"`
	CompetitorName             any      `json:"competitorName"`
	BrandInstitutionGroupCard  any      `json:"brandInstitutionGroupCard"`
	PublishDemandCard          any      `json:"publishDemandCard"`
	AppDynamicCompanyCard      any      `json:"appDynamicCompanyCard"`
	EmptyRecommendTextCard     any      `json:"emptyRecommendTextCard"`
	EmptyRecommendCompanyCard  any      `json:"emptyRecommendCompanyCard"`
	RecommendScene             any      `json:"recommendScene"`
	CompanyBrand               struct {
		ID      string `json:"id"`
		Name    string `json:"name"`
		Primary bool   `json:"primary"`
		URL     string `json:"url"`
	} `json:"companyBrand"`
	CompanyGroup struct {
		ID      string `json:"id"`
		Name    string `json:"name"`
		Type    int    `json:"type"`
		Primary bool   `json:"primary"`
	} `json:"companyGroup"`
	InstitutionCard           any              `json:"institutionCard"`
	VerticalCard              any              `json:"verticalCard"`
	PhoneTagType              int              `json:"phoneTagType"`
	AladdinCompanyCard        any              `json:"aladdinCompanyCard"`
	IllegalSocialOrganization any              `json:"illegalSocialOrganization"`
	LabelListV3               []LabelListV3    `json:"labelListV3"`
	RegStatusLabel            []RegStatusLabel `json:"regStatusLabel"`
	NewlyCompanyCard          any              `json:"newlyCompanyCard"`
	DeepSearchCard            any              `json:"deepSearchCard"`
	LegalPersonForList        string           `json:"legalPersonForList"`
	RegCapitalForList         string           `json:"regCapitalForList"`
	ProvinceName              string           `json:"provinceName"`
	CityName                  string           `json:"cityName"`
	DistrictName              string           `json:"districtName"`
	CategoryNameLv1           string           `json:"categoryNameLv1"`
	CategoryNameLv2           string           `json:"categoryNameLv2"`
	CategoryNameLv3           string           `json:"categoryNameLv3"`
	CategoryNameLv4           string           `json:"categoryNameLv4"`
	OrgType                   string           `json:"orgType"`
	ApproveDate               string           `json:"approveDate"`
	BusinessTerm              string           `json:"businessTerm"`
	SocialSecurityStaffNum0   string           `json:"socialSecurityStaffNum"`
	CompanyScaleInfo          struct {
		Name     string `json:"name"`
		IconType string `json:"iconType"`
	} `json:"companyScaleInfo"`
	FollowInfo struct {
		Status  int `json:"status"`
		TagID   any `json:"tagId"`
		TagName any `json:"tagName"`
	} `json:"followInfo"`
	LegalPersonList []struct {
		Hid  int    `json:"hid"`
		Cid  int64  `json:"cid"`
		Type int    `json:"type"`
		Name string `json:"name"`
	} `json:"legalPersonList"`
	EnglishNameForTab string `json:"englishNameForTab"`
}

type RightsInfo struct {
	PageNum          int    `json:"pageNum"`
	PageNumRights    any    `json:"pageNumRights"`
	TopOpenText      any    `json:"topOpenText"`
	TopPayPointID    any    `json:"topPayPointId"`
	BottomShowText   string `json:"bottomShowText"`
	BottomOpenText   string `json:"bottomOpenText"`
	BottomPayPointID string `json:"bottomPayPointId"`
	ListPayPointID   any    `json:"listPayPointId"`
}

type Result struct {
	State     string `json:"state"`
	Message   string `json:"message"`
	Special   string `json:"special"`
	ErrorCode string `json:"errorCode"`
	Data      struct {
		BrandAndAgencyInfo struct {
			Count    int    `json:"count"`
			PageSize int    `json:"pageSize"`
			Word     string `json:"word"`
			PageNum  int    `json:"pageNum"`
			Items    []any  `json:"items"`
		} `json:"brandAndAgencyInfo"`
		HasRight               int             `json:"hasRight"`
		SessionNo              any             `json:"sessionNo"`
		RecommendList          []RecommendItem `json:"recommendList"`
		SearchResultSign       string          `json:"searchResultSign"`
		CompanyList            []CompanyItem   `json:"companyList"`
		CompanyTotalPage       int             `json:"companyTotalPage"`
		BrandCount             int             `json:"brandCount"`
		AgencyCount            int             `json:"agencyCount"`
		CompanyTotal           int             `json:"companyTotal"`
		SessionType            int             `json:"sessionType"`
		MatchedContentTypeList []int           `json:"matchedContentTypeList"`
		SearchContent          string          `json:"searchContent"`
		TraceID                string          `json:"traceId"`
		CompanyCount           int             `json:"companyCount"`
		CompanyHumanCount      int             `json:"companyHumanCount"`
		BrandAndAgencyTotal    int             `json:"brandAndAgencyTotal"`
		SessionID              string          `json:"sessionId"`
		CompanyTotalStr        string          `json:"companyTotalStr"`
		DeepSearchInfo         any             `json:"deepSearchInfo"`
		HumanCount             int             `json:"humanCount"`
		BrandTotal             int             `json:"brandTotal"`
		AgencyTotal            int             `json:"agencyTotal"`
		ModifiedQuery          any             `json:"modifiedQuery"`
		QueryIntent            string          `json:"queryIntent"`
		RightsInfo             RightsInfo      `json:"rightsInfo"`
		SearchVersion          string          `json:"searchVersion"`
		AdviceQuery            any             `json:"adviceQuery"`
	} `json:"data"`
}

func (r *TianYanCha) Search(key string) (*Result, error) {
	data := map[string]any{
		"filterJson": "{\"economicTypeMethod\":{\"key\":\"economicTypeMethod\",\"items\":[{\"value\":\"1\"}]},\"institutionTypeMethod\":{\"key\":\"institutionTypeMethod\",\"items\":[{\"value\":\"1\"}]},\"word\":{\"key\":\"word\",\"items\":[{\"value\":\"" + key + "\"}]}}",
		"searchType": 1,
		"pageNum":    1,
		"pageSize":   20,
	}
	bs, _ := json.Marshal(data)
	request, _ := http.NewRequest("POST", "https://capi.tianyancha.com/cloud-tempest/web/searchCompanyV4", bytes.NewReader(bs))
	request.Header.Add("version", "TYC-Web")
	request.Header.Add("X-AUTH-TOKEN", r.token)
	request.Header.Add("Content-Type", "application/json")
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
	tt := strings.ReplaceAll(string(t), "<em>", "")
	tt = strings.ReplaceAll(tt, "</em>", "")
	var result Result
	err = json.Unmarshal([]byte(tt), &result)
	if err != nil {
		return nil, err
	}
	return &result, nil
}

type SuggestItem struct {
	ID            int64  `json:"id"`
	GraphID       string `json:"graphId"`
	Type          int    `json:"type"`
	MatchType     string `json:"matchType"`
	ComName       string `json:"comName"`
	Name          string `json:"name"`
	Alias         string `json:"alias"`
	Logo          string `json:"logo"`
	RegStatus     int    `json:"regStatus"`
	TaxCode       string `json:"taxCode"`
	PromptContent any    `json:"promptContent"`
	Label         any    `json:"label"`
	SourceName    any    `json:"sourceName"`
	SourceURL     any    `json:"sourceUrl"`
}

func (r *TianYanCha) Suggest(key string) ([]SuggestItem, error) {
	data := map[string]any{
		"keyword": key,
	}
	bs, _ := json.Marshal(data)
	request, _ := http.NewRequest("POST", "https://capi.tianyancha.com/cloud-tempest/search/suggest/company/main", bytes.NewReader(bs))
	request.Header.Add("version", "TYC-Web")
	request.Header.Add("Content-Type", "application/json")
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
	tt := strings.ReplaceAll(string(t), "<em>", "")
	tt = strings.ReplaceAll(tt, "</em>", "")
	var state = gjson.Get(tt, "state").String()
	if state != "ok" {
		var message = gjson.Get(tt, "message").String()
		return nil, errors.New(message)
	}
	var suggestItem = make([]SuggestItem, 0)
	var companySuggestList = gjson.Get(tt, "data.companySuggestList").Array()
	for _, company := range companySuggestList {
		var item SuggestItem
		err := json.Unmarshal([]byte(company.Raw), &item)
		if err != nil {
			continue
		}
		suggestItem = append(suggestItem, item)
	}
	return suggestItem, nil
}

type PenetrationItem struct {
	Ratio              float64 `json:"ratio"`
	AmountStr          string  `json:"amountStr"`
	ID                 string  `json:"id"`
	EntityType         int     `json:"entityType"`
	CompanyID          int     `json:"companyId"`
	HumanNameID        int     `json:"humanNameId"`
	Name               string  `json:"name"`
	Logo               string  `json:"logo"`
	IsActualController bool    `json:"isActualController"`
	IsFinalBeneficial  bool    `json:"isFinalBeneficial"`
	IsBigHolder        bool    `json:"isBigHolder"`
	HasHolder          bool    `json:"hasHolder"`
	HasInvestor        bool    `json:"hasInvestor"`
	//TagList            []struct {
	//	TagID           int    `json:"tagId"`
	//	Name            string `json:"name"`
	//	Title           string `json:"title"`
	//	FontColor       string `json:"fontColor"`
	//	BackgroundColor string `json:"backgroundColor"`
	//	TagLogoURL      string `json:"tagLogoUrl"`
	//} `json:"tagList"`
	StatusTag struct {
		TagID           int    `json:"tagId"`
		Name            string `json:"name"`
		Title           string `json:"title"`
		FontColor       string `json:"fontColor"`
		BackgroundColor string `json:"backgroundColor"`
		TagLogoURL      string `json:"tagLogoUrl"`
	} `json:"statusTag"`
	IsValid   bool `json:"isValid"`
	Industry  any  `json:"industry"`
	EntityTag struct {
		TagID           int    `json:"tagId"`
		Name            string `json:"name"`
		Title           string `json:"title"`
		FontColor       string `json:"fontColor"`
		BackgroundColor string `json:"backgroundColor"`
		TagLogoURL      string `json:"tagLogoUrl"`
	} `json:"entityTag"`
	BeneficiaryShareholdingRatio any    `json:"beneficiaryShareholdingRatio"`
	Alias                        string `json:"alias"`
	TotalShareholdingRatio       any    `json:"totalShareholdingRatio"`
	IsShellCompany               bool   `json:"isShellCompany"`
}

func (r *TianYanCha) GetInvestee(id string) ([]PenetrationItem, error) {
	return r.getPenetration(id, "OUT")
}

func (r *TianYanCha) GetHolder(id string) ([]PenetrationItem, error) {
	return r.getPenetration(id, "IN")
}

func (r *TianYanCha) getPenetration(id, direct string) ([]PenetrationItem, error) {
	data := map[string]any{
		"idList":     []string{id},
		"direct":     direct,
		"centerId":   id,
		"entityType": "2",
		"signature":  "960pTzrf7qMYaVGwzr2ZTt1SdBeM7vRIMJ1YNjy93PY=",
	}

	bs, _ := json.Marshal(data)
	request, _ := http.NewRequest("POST", "https://capi.tianyancha.com/tyc-enterprise-graph/ei/get/penetration/slow/graph/single", bytes.NewReader(bs))
	request.Header.Add("eventId", "i9")
	request.Header.Add("version", "TYC-Web")
	request.Header.Add("Content-Type", "application/json")
	request.Header.Add("X-AUTH-TOKEN", r.token)
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
	tt := strings.ReplaceAll(string(t), "<em>", "")
	tt = strings.ReplaceAll(tt, "</em>", "")
	var state = gjson.Get(tt, "state").String()
	if state != "ok" {
		var message = gjson.Get(tt, "message").String()
		return nil, errors.New(message)
	}
	var items = make([]PenetrationItem, 0)
	var nodesMap = gjson.Get(tt, "data.nodesMap").Map()
	for _, company := range nodesMap {
		var item PenetrationItem
		err := json.Unmarshal([]byte(company.Raw), &item)
		if err != nil {
			continue
		}
		if item.ID != id {
			items = append(items, item)
		}
	}

	// 构建 map 以便快速查找 items
	itemMap := make(map[string]*PenetrationItem)
	for i := range items {
		itemMap[items[i].ID] = &items[i]
	}

	var name = ""
	if direct == "OUT" {
		name = "investorList"
	} else if direct == "IN" {
		name = "holderList"
	}
	var treeList = gjson.Get(tt, "data.treeList.0."+name).Array()

	// 快速更新 items
	for _, company := range treeList {
		id := gjson.Get(company.Raw, "id").String()
		ratio := gjson.Get(company.Raw, "ratio").Float()
		amountStr := gjson.Get(company.Raw, "amountStr").String()

		// 使用 map 快速查找并更新
		if item, exists := itemMap[id]; exists {
			item.AmountStr = amountStr
			item.Ratio = ratio
		}
	}
	return items, nil
}

type SearchCompanyV4Item struct {
	ID                         int64            `json:"id"`
	Name                       string           `json:"name"`
	Type                       int              `json:"type"`
	MatchType                  any              `json:"matchType"`
	Base                       string           `json:"base"`
	LegalPersonName            string           `json:"legalPersonName"`
	EstiblishTime              string           `json:"estiblishTime"`
	RegCapital                 string           `json:"regCapital"`
	RegStatus                  string           `json:"regStatus"`
	Score                      any              `json:"score"`
	OrginalScore               any              `json:"orginalScore"`
	BonusScore                 any              `json:"bonusScore"`
	CompanyScore               any              `json:"companyScore"`
	HistoryNames               string           `json:"historyNames"`
	CategoryCode               string           `json:"categoryCode"`
	Industry                   any              `json:"industry"`
	HumanNames                 any              `json:"humanNames"`
	Trademarks                 any              `json:"trademarks"`
	TmList                     any              `json:"tmList"`
	ProductList                any              `json:"productList"`
	UsedBondName               any              `json:"usedBondName"`
	BondName                   any              `json:"bondName"`
	BondNum                    any              `json:"bondNum"`
	BondType                   any              `json:"bondType"`
	NewtestName                any              `json:"newtestName"`
	RegNumber                  string           `json:"regNumber"`
	OrgNumber                  string           `json:"orgNumber"`
	CreditCode                 string           `json:"creditCode"`
	BusinessScope              string           `json:"businessScope"`
	RegLocation                string           `json:"regLocation"`
	Phone                      any              `json:"phone"`
	PhoneList                  []string         `json:"phoneList"`
	PhoneInfoList              any              `json:"phoneInfoList"`
	BusinessItemList           any              `json:"businessItemList"`
	PhoneNum                   string           `json:"phoneNum"`
	Logo                       string           `json:"logo"`
	City                       string           `json:"city"`
	District                   any              `json:"district"`
	Emails                     any              `json:"emails"`
	EmailList                  any              `json:"emailList"`
	Websites                   string           `json:"websites"`
	HiddenPhones               any              `json:"hiddenPhones"`
	Abbr                       any              `json:"abbr"`
	TagList                    any              `json:"tagList"`
	CompanyType                int              `json:"companyType"`
	CompanyOrgType             any              `json:"companyOrgType"`
	LabelList                  any              `json:"labelList"`
	MatchField                 any              `json:"matchField"`
	Latitude                   any              `json:"latitude"`
	Longitude                  any              `json:"longitude"`
	LegalPersonID              string           `json:"legalPersonId"`
	LegalPersonType            string           `json:"legalPersonType"`
	Distance                   any              `json:"distance"`
	CategoryStr                any              `json:"categoryStr"`
	IsClaimed                  int              `json:"isClaimed"`
	ClaimPkgType               any              `json:"claimPkgType"`
	RealClaimPkgType           any              `json:"realClaimPkgType"`
	BaiduURL                   any              `json:"baiduUrl"`
	IsBranch                   int              `json:"isBranch"`
	Alias                      string           `json:"alias"`
	ClaimInfo                  any              `json:"claimInfo"`
	Hidden                     int              `json:"hidden"`
	LegalPersonShowStr         string           `json:"legalPersonShowStr"`
	RegCapitalShowStr          string           `json:"regCapitalShowStr"`
	EstiblishTimeShowStr       string           `json:"estiblishTimeShowStr"`
	MultiMatchField            []any            `json:"multiMatchField"`
	LabelListV2                any              `json:"labelListV2"`
	LabelJSONList              any              `json:"labelJsonList"`
	TaxCode                    string           `json:"taxCode"`
	SocialSecurityStaffNum     any              `json:"socialSecurityStaff_num"`
	CategoryCodeStd            any              `json:"categoryCodeStd"`
	HasMorePhone               any              `json:"hasMorePhone"`
	HasVideo                   any              `json:"hasVideo"`
	VideoID                    any              `json:"videoId"`
	IsRecommend                any              `json:"isRecommend"`
	EnglishName                any              `json:"englishName"`
	FirstPositionShowStr       string           `json:"firstPositionShowStr"`
	SecondPositionShowStr      string           `json:"secondPositionShowStr"`
	FirstPositionValue         string           `json:"firstPositionValue"`
	SecondPositionValue        string           `json:"secondPositionValue"`
	BizType                    string           `json:"bizType"`
	DocFeature                 string           `json:"docFeature"`
	CompanyNum                 any              `json:"companyNum"`
	Department                 string           `json:"department"`
	IllegalType                string           `json:"illegalType"`
	TargetGid                  string           `json:"targetGid"`
	TargetName                 string           `json:"targetName"`
	ChangeTime                 string           `json:"changeTime"`
	IsIn                       string           `json:"isIn"`
	MainID                     string           `json:"mainId"`
	TargetRegCapitalAmount     string           `json:"targetRegCapitalAmount"`
	TargetRegCapitalCurrency   string           `json:"targetRegCapitalCurrency"`
	LegalPerson                string           `json:"legalPerson"`
	GidForB                    string           `json:"gidForB"`
	GeoLocation                any              `json:"geoLocation"`
	WebsiteFilingCount         int              `json:"websiteFilingCount"`
	RepCurrency                any              `json:"repCurrency"`
	Province                   any              `json:"province"`
	AreaCodes                  any              `json:"areaCodes"`
	Address                    any              `json:"address"`
	EstablishmentTime          string           `json:"establishmentTime"`
	Icps                       any              `json:"icps"`
	Icp                        string           `json:"icp"`
	ChangeRatio                string           `json:"changeRatio"`
	AfterRatio                 string           `json:"afterRatio"`
	ChangeAmt                  string           `json:"changeAmt"`
	RegisterInstitute          string           `json:"registerInstitute"`
	CompanyScale               any              `json:"companyScale"`
	AbstractsBaseInfo          string           `json:"abstractsBaseInfo"`
	FinancingRound             string           `json:"financingRound"`
	StaffNumReportYear         any              `json:"staffNumReportYear"`
	CategoryCode2017List       any              `json:"categoryCode2017List"`
	InstitutionTypeList        any              `json:"institutionTypeList"`
	CompanyBrandInfo           any              `json:"companyBrandInfo"`
	CompanyGroupInfo           any              `json:"companyGroupInfo"`
	ContantMap                 any              `json:"contantMap"`
	CompanyPhoneBook           any              `json:"companyPhoneBook"`
	CompanyQuestions           any              `json:"companyQuestions"`
	SelfRiskCount              any              `json:"selfRiskCount"`
	LegalPersonLogo            any              `json:"legalPersonLogo"`
	LegalPersonAlias           any              `json:"legalPersonAlias"`
	RelatedRiskCount           any              `json:"relatedRiskCount"`
	HistoryRiskCount           any              `json:"historyRiskCount"`
	FollowLabel                any              `json:"followLabel"`
	ContentType                int              `json:"contentType"`
	NormalWord                 any              `json:"normalWord"`
	SuggestWordList            any              `json:"suggestWordList"`
	CompanyHumanInfo           any              `json:"companyHumanInfo"`
	PhoneType                  any              `json:"phoneType"`
	PhoneTips                  any              `json:"phoneTips"`
	PublicSentimentNewsInfo    any              `json:"publicSentimentNewsInfo"`
	EnterpriseServiceGoodsInfo any              `json:"enterpriseServiceGoodsInfo"`
	QfLabels                   any              `json:"qfLabels"`
	ProductShowMore            any              `json:"productShowMore"`
	GoodsAndProducts           any              `json:"goodsAndProducts"`
	ShortVideoList             any              `json:"shortVideoList"`
	FocusCompanyList           any              `json:"focusCompanyList"`
	IsBrandArea                int              `json:"isBrandArea"`
	AreaType                   int              `json:"areaType"`
	CustomizedImagePath        string           `json:"customizedImagePath"`
	IsBrandAreaControlGroup    int              `json:"isBrandAreaControlGroup"`
	AdsFlag                    any              `json:"adsFlag"`
	IsCooperationShow          any              `json:"isCooperationShow"`
	CooperationURL             string           `json:"cooperationUrl"`
	AlbumHeadImgPath           any              `json:"albumHeadImgPath"`
	AlbumCount                 any              `json:"albumCount"`
	WebsiteURL                 any              `json:"websiteUrl"`
	WebsiteRiskType            int              `json:"websiteRiskType"`
	HotMsg                     any              `json:"hotMsg"`
	HotType                    any              `json:"hotType"`
	CompetitorName             any              `json:"competitorName"`
	BrandInstitutionGroupCard  any              `json:"brandInstitutionGroupCard"`
	PublishDemandCard          any              `json:"publishDemandCard"`
	AppDynamicCompanyCard      any              `json:"appDynamicCompanyCard"`
	EmptyRecommendTextCard     any              `json:"emptyRecommendTextCard"`
	EmptyRecommendCompanyCard  any              `json:"emptyRecommendCompanyCard"`
	RecommendScene             any              `json:"recommendScene"`
	CompanyBrand               any              `json:"companyBrand"`
	CompanyGroup               any              `json:"companyGroup"`
	InstitutionCard            any              `json:"institutionCard"`
	VerticalCard               any              `json:"verticalCard"`
	PhoneTagType               int              `json:"phoneTagType"`
	AladdinCompanyCard         any              `json:"aladdinCompanyCard"`
	IllegalSocialOrganization  any              `json:"illegalSocialOrganization"`
	LabelListV3                []LabelListV3    `json:"labelListV3"`
	RegStatusLabel             []RegStatusLabel `json:"regStatusLabel"`
	NewlyCompanyCard           any              `json:"newlyCompanyCard"`
	DeepSearchCard             any              `json:"deepSearchCard"`
	LegalPersonForList         string           `json:"legalPersonForList"`
	RegCapitalForList          string           `json:"regCapitalForList"`
	ProvinceName               string           `json:"provinceName"`
	CityName                   string           `json:"cityName"`
	DistrictName               string           `json:"districtName"`
	CategoryNameLv1            any              `json:"categoryNameLv1"`
	CategoryNameLv2            any              `json:"categoryNameLv2"`
	CategoryNameLv3            any              `json:"categoryNameLv3"`
	CategoryNameLv4            any              `json:"categoryNameLv4"`
	OrgType                    string           `json:"orgType"`
	ApproveDate                string           `json:"approveDate"`
	BusinessTerm               string           `json:"businessTerm"`
	SocialSecurityStaffNum0    string           `json:"socialSecurityStaffNum"`
	CompanyScaleInfo           any              `json:"companyScaleInfo"`
	FollowInfo                 struct {
		Status  int `json:"status"`
		TagID   any `json:"tagId"`
		TagName any `json:"tagName"`
	} `json:"followInfo"`
	//LegalPersonList []struct {
	//	Hid  int    `json:"hid"`
	//	Cid  int64  `json:"cid"`
	//	Type int    `json:"type"`
	//	Name string `json:"name"`
	//} `json:"legalPersonList"`
	EnglishNameForTab string `json:"englishNameForTab"`
}

type LabelListV3 struct {
	CompanyID            int64  `json:"companyId"`
	ProfileTagID         int    `json:"profileTagId"`
	ProfileTagTypeID     int    `json:"profileTagTypeId"`
	ProfileTagNameOnPage string `json:"profileTagNameOnPage"`
	ProfileTagLogo       string `json:"profileTagLogo"`
	BorderTransparency   string `json:"borderTransparency"`
	GuideTransparency    string `json:"guideTransparency"`
	BorderWidth          string `json:"borderWidth"`
	BorderColor          string `json:"borderColor"`
	GuideColor           string `json:"guideColor"`
	FontSize             int    `json:"fontSize"`
	FontFamily           string `json:"fontFamily"`
	Color                string `json:"color"`
	Background           string `json:"background"`
}

type RegStatusLabel struct {
	CompanyID            int64  `json:"companyId"`
	ProfileTagID         int    `json:"profileTagId"`
	ProfileTagTypeID     int    `json:"profileTagTypeId"`
	ProfileTagNameOnPage string `json:"profileTagNameOnPage"`
	ProfileTagLogo       string `json:"profileTagLogo"`
	BorderTransparency   string `json:"borderTransparency"`
	GuideTransparency    string `json:"guideTransparency"`
	BorderWidth          string `json:"borderWidth"`
	BorderColor          string `json:"borderColor"`
	GuideColor           string `json:"guideColor"`
	FontSize             int    `json:"fontSize"`
	FontFamily           string `json:"fontFamily"`
	Color                string `json:"color"`
	Background           string `json:"background"`
}

func (r *TianYanCha) SearchCompanyV4() ([]SearchCompanyV4Item, error) {
	return make([]SearchCompanyV4Item, 0), nil
}
