package db

import (
	"database/sql"
	"fine-server/config"
	"fine-server/sdk/fofa"
	"fine-server/sdk/hunter"
	"fine-server/sdk/quake"
	"fine-server/sdk/zone"
	"fmt"
	"github.com/goccy/go-json"
	_ "github.com/mattn/go-sqlite3"
	"os"
	"path/filepath"
	"sync"
)

var database *Database
var initError error
var once sync.Once

type Database struct {
	db *sql.DB
}

func Get() (*Database, error) {
	once.Do(func() {
		db, err := sql.Open("sqlite3", filepath.Join(config.GetDataBaseDir(), "data.db"))
		if err != nil {
			initError = err
			return
		}
		database = &Database{
			db: db,
		}
	})
	if initError != nil {
		return nil, initError
	}
	err := database.init()
	if err != nil {
		return nil, err
	}
	return database, nil
}

func (d *Database) init() error {
	// 检查数据库文件是否存在，如果存在则删除
	if _, err := os.Stat(filepath.Join(config.GetDataBaseDir(), "data.db")); err == nil {
		fmt.Println("Database file already exists. Deleting...")
		if err2 := os.Remove(filepath.Join(config.GetDataBaseDir(), "data.db")); err2 != nil {
			return err2
		}
	}
	_, err := d.db.Exec(creatFofaExportTable)
	if err != nil {
		return err
	}
	_, err = d.db.Exec(creatHunterExportTable)
	if err != nil {
		return err
	}
	_, err = d.db.Exec(creatQuakeExportTable)
	if err != nil {
		return err
	}
	_, err = d.db.Exec(creatZoneSiteExportTable)
	if err != nil {
		return err
	}
	_, err = d.db.Exec(creatZoneApkExportTable)
	if err != nil {
		return err
	}
	_, err = d.db.Exec(creatZoneMemberExportTable)
	if err != nil {
		return err
	}
	_, err = d.db.Exec(creatZoneDomainExportTable)
	if err != nil {
		return err
	}
	_, err = d.db.Exec(creatZoneEmailExportTable)
	if err != nil {
		return err
	}
	_, err = d.db.Exec(creatZoneCodeExportTable)
	if err != nil {
		return err
	}
	_, err = d.db.Exec(creatZoneDarknetExportTable)
	if err != nil {
		return err
	}
	_, err = d.db.Exec(creatZoneAimExportTable)
	if err != nil {
		return err
	}
	return nil
}

func (d *Database) FofaExportDataInsert(token string, items []*fofa.Item) error {
	const insertSQL = "INSERT INTO fofa_export (token,ip,port,protocol,country,country_name,region,city,longitude,latitude,as_number,as_organization,host,domain,os,server,icp,title,jarm,header,banner,cert,base_protocol,link,product,product_category,version,lastupdatetime,cname,icon_hash,certs_valid,cname_domain,body,icon,fid,structinfo) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
	tx, err := d.db.Begin()
	if err != nil {
		return err
	}
	stmt, err := tx.Prepare(insertSQL)
	if err != nil {
		return err
	}
	defer stmt.Close()
	for _, item := range items {
		_, err = stmt.Exec(token, item.Ip, item.Port, item.Protocol, item.Country, item.CountryName, item.Region, item.City, item.Longitude, item.Latitude, item.AsNumber, item.AsOrganization, item.Host, item.Domain, item.Os, item.Server, item.Icp, item.Title, item.Jarm, item.Header, item.Banner, item.Cert, item.BaseProtocol, item.Link, item.Product, item.ProductCategory, item.Version, item.LastUpdateTime, item.Cname, item.IconHash, item.CertsValid, item.CnameDomain, item.Body, item.Icon, item.Fid, item.Structinfo)
		if err != nil {
			// 回滚事务以撤销之前的操作
			if rollbackErr := tx.Rollback(); rollbackErr != nil {
				return rollbackErr
			}
			return err
		}
	}
	err = tx.Commit()
	if err != nil {
		// 回滚事务以撤销之前的操作
		if rollbackErr := tx.Rollback(); rollbackErr != nil {
			return rollbackErr
		}
		return err
	}
	return nil
}

func (d *Database) FofaExportDataGet(token string) ([]*fofa.Item, error) {
	rows, err := d.db.Query("SELECT ip,port,protocol,country,country_name,region,city,longitude,latitude,as_number,as_organization,host,domain,os,server,icp,title,jarm,header,banner,cert,base_protocol,link,product,product_category,version,lastupdatetime,cname,icon_hash,certs_valid,cname_domain,body,icon,fid,structinfo FROM fofa_export WHERE token = ?", token)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var re []*fofa.Item
	for rows.Next() {
		var tmp = &fofa.Item{}
		err2 := rows.Scan(
			&tmp.Ip, &tmp.Port, &tmp.Protocol, &tmp.Country, &tmp.CountryName, &tmp.Region, &tmp.City, &tmp.Longitude, &tmp.Latitude, &tmp.AsNumber, &tmp.AsOrganization, &tmp.Host, &tmp.Domain, &tmp.Os, &tmp.Server, &tmp.Icp, &tmp.Title, &tmp.Jarm, &tmp.Header, &tmp.Banner, &tmp.Cert, &tmp.BaseProtocol, &tmp.Link, &tmp.Product, &tmp.ProductCategory, &tmp.Version, &tmp.LastUpdateTime, &tmp.Cname, &tmp.IconHash, &tmp.CertsValid, &tmp.CnameDomain, &tmp.Body, &tmp.Icon, &tmp.Fid, &tmp.Structinfo,
		)
		if err2 != nil {
			return nil, err2
		}
		re = append(re, tmp)
	}
	return re, nil
}

func (d *Database) HunterExportDataInsert(token string, items []*hunter.Item) error {
	const insertSQL = "INSERT INTO hunter_export (token ,domain,port,ip,url,protocol,title,status_code,company,components,icp,os,banner,is_risk,is_web,country,province,city,as_org,isp,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
	tx, err := d.db.Begin()
	if err != nil {
		return err
	}
	stmt, err := tx.Prepare(insertSQL)
	if err != nil {
		return err
	}
	defer stmt.Close()
	for _, item := range items {
		marshalComp, err2 := json.Marshal(item.Component)
		if err2 != nil {
			return err2
		}
		_, err = stmt.Exec(token, item.Domain, item.Port, item.IP, item.URL, item.Protocol, item.WebTitle, item.StatusCode, item.Company, string(marshalComp), item.Number, item.Os, item.Banner, item.IsRiskProtocol, item.IsWeb, item.Country, item.Province, item.City, item.AsOrg, item.Isp, item.UpdatedAt)
		if err != nil {
			// 回滚事务以撤销之前的操作
			if rollbackErr := tx.Rollback(); rollbackErr != nil {
				return rollbackErr
			}
			return err
		}
	}
	err = tx.Commit()
	if err != nil {
		// 回滚事务以撤销之前的操作
		if rollbackErr := tx.Rollback(); rollbackErr != nil {
			return rollbackErr
		}
		return err
	}
	return nil
}

func (d *Database) HunterExportDataGet(token string) ([]*hunter.Item, error) {
	rows, err := d.db.Query("SELECT domain,port,ip,url,protocol,title,status_code,company,components,icp,os,banner,is_risk,is_web,country,province,city,as_org,isp,updated_at FROM hunter_export WHERE token = ?", token)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []*hunter.Item
	for rows.Next() {
		var tmp = &hunter.Item{}
		var stringComp string
		err2 := rows.Scan(&tmp.Domain, &tmp.Port, &tmp.IP, &tmp.URL, &tmp.Protocol, &tmp.WebTitle, &tmp.StatusCode, &tmp.Company, &stringComp, &tmp.Number, &tmp.Os, &tmp.Banner, &tmp.IsRiskProtocol, &tmp.IsWeb, &tmp.Country, &tmp.Province, &tmp.City, &tmp.AsOrg, &tmp.Isp, &tmp.UpdatedAt)
		if err2 != nil {
			return nil, err2
		}
		var tmpComps []hunter.Component
		err2 = json.Unmarshal([]byte(stringComp), &tmpComps)
		if err2 != nil {
			return nil, err2
		}
		tmp.Component = tmpComps
		items = append(items, tmp)
	}
	return items, nil
}

func (d *Database) QuakeExportDataInsert(token string, items []*quake.RealtimeServiceItem) error {
	const insertSQL = "INSERT INTO quake_export (token ,components,org,ip,os_version,is_ipv6,transport,hostname,port,service,domain,os_name,location,time,asn) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
	tx, err := d.db.Begin()
	if err != nil {
		return err
	}
	stmt, err := tx.Prepare(insertSQL)
	if err != nil {
		return err
	}
	defer stmt.Close()
	for _, item := range items {
		marshalComp, err2 := json.Marshal(item.Components)
		if err2 != nil {
			return err2
		}
		marshalService, err2 := json.Marshal(item.Service)
		if err2 != nil {
			return err2
		}
		marshalLocation, err2 := json.Marshal(item.Location)
		if err2 != nil {
			return err2
		}
		var isIpv6 = 0
		if item.IsIpv6 {
			isIpv6 = 1
		}
		_, err = stmt.Exec(token, string(marshalComp), item.Org, item.IP, item.OsVersion, isIpv6, item.Transport, item.Hostname, item.Port, string(marshalService), item.Domain, item.OsName, marshalLocation, item.Time, item.Asn)
		if err != nil {
			// 回滚事务以撤销之前的操作
			if rollbackErr := tx.Rollback(); rollbackErr != nil {
				return rollbackErr
			}
			return err
		}
	}
	err = tx.Commit()
	if err != nil {
		// 回滚事务以撤销之前的操作
		if rollbackErr := tx.Rollback(); rollbackErr != nil {
			return rollbackErr
		}
		return err
	}
	return nil
}

func (d *Database) QuakeExportDataGet(token string) ([]*quake.RealtimeServiceItem, error) {
	rows, err := d.db.Query("SELECT components,org,ip,os_version,is_ipv6,transport,hostname,port,service,domain,os_name,location,time,asn FROM quake_export WHERE token = ?", token)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []*quake.RealtimeServiceItem
	for rows.Next() {
		var tmp = &quake.RealtimeServiceItem{}
		var stringComp string
		var intIsIpv6 int
		var stringService string
		var stringLocation string
		err2 := rows.Scan(&stringComp, &tmp.Org, &tmp.IP, &tmp.OsVersion, &intIsIpv6, &tmp.Transport, &tmp.Hostname, &tmp.Port, &stringService, &tmp.Domain, &tmp.OsName, &stringLocation, &tmp.Time, &tmp.Asn)
		if err2 != nil {
			return nil, err2
		}
		var components []quake.Component
		err2 = json.Unmarshal([]byte(stringComp), &components)
		if err2 != nil {
			return nil, err2
		}
		var isIpv6 bool
		if intIsIpv6 == 1 {
			isIpv6 = true
		}
		var service quake.ServiceItem
		err2 = json.Unmarshal([]byte(stringService), &service)
		if err2 != nil {
			return nil, err2
		}
		var location quake.Location
		err2 = json.Unmarshal([]byte(stringLocation), &location)
		if err2 != nil {
			return nil, err2
		}
		tmp.Components = components
		tmp.Location = location
		tmp.IsIpv6 = isIpv6
		tmp.Service = service
		items = append(items, tmp)
	}
	return items, nil
}

func (d *Database) ZoneExportSiteDataInsert(token string, items []*zone.SiteItem) error {
	const insertSQL = "INSERT INTO zone_site_export (token ,ip,port,url,title,status_code,cms,continent,country,province,city,operator,banner,html_banner,'group',beian,is_cdn,ssl_certificate,service) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
	tx, err := d.db.Begin()
	if err != nil {
		return err
	}
	stmt, err := tx.Prepare(insertSQL)
	if err != nil {
		return err
	}
	defer stmt.Close()
	for _, item := range items {
		_, err = stmt.Exec(token, item.IP, item.Port, item.URL, item.Title, item.StatusCode, item.Cms, item.Continent, item.Country, item.Province, item.City, item.Operator, item.Banner, item.HTMLBanner, item.Group, item.Beian, item.IsCdn, item.SslCertificate, item.Service)
		if err != nil {
			// 回滚事务以撤销之前的操作
			if rollbackErr := tx.Rollback(); rollbackErr != nil {
				return rollbackErr
			}
			return err
		}
	}
	err = tx.Commit()
	if err != nil {
		// 回滚事务以撤销之前的操作
		if rollbackErr := tx.Rollback(); rollbackErr != nil {
			return rollbackErr
		}
		return err
	}
	return nil
}

func (d *Database) ZoneExportSiteDataGet(token string) ([]*zone.SiteItem, error) {
	rows, err := d.db.Query("SELECT ip,port,url,title,status_code,cms,continent,country,province,city,operator,banner,html_banner,'group',beian,is_cdn,ssl_certificate,service FROM zone_site_export WHERE token = ?", token)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []*zone.SiteItem
	for rows.Next() {
		var tmp = &zone.SiteItem{}
		err2 := rows.Scan(&tmp.IP, &tmp.Port, &tmp.URL, &tmp.Title, &tmp.StatusCode, &tmp.Cms, &tmp.Continent, &tmp.Country, &tmp.Province, &tmp.City, &tmp.Operator, &tmp.Banner, &tmp.HTMLBanner, &tmp.Group, &tmp.Beian, &tmp.IsCdn, &tmp.SslCertificate, &tmp.Service)
		if err2 != nil {
			return nil, err2
		}
		items = append(items, tmp)
	}
	return items, nil
}

func (d *Database) ZoneExportApkDataInsert(token string, items []*zone.ApkItem) error {
	const insertSQL = "INSERT INTO zone_apk_export (token,title,company,type,source,timestamp,msg) VALUES (?,?,?,?,?,?,?)"
	tx, err := d.db.Begin()
	if err != nil {
		return err
	}
	stmt, err := tx.Prepare(insertSQL)
	if err != nil {
		return err
	}
	defer stmt.Close()
	for _, item := range items {
		marshalMsg, err2 := json.Marshal(item.Msg)
		if err2 != nil {
			return err2
		}
		_, err = stmt.Exec(token, item.Title, item.Company, item.Type, item.Source, item.Timestamp, string(marshalMsg))
		if err != nil {
			// 回滚事务以撤销之前的操作
			if rollbackErr := tx.Rollback(); rollbackErr != nil {
				return rollbackErr
			}
			return err
		}
	}
	err = tx.Commit()
	if err != nil {
		// 回滚事务以撤销之前的操作
		if rollbackErr := tx.Rollback(); rollbackErr != nil {
			return rollbackErr
		}
		return err
	}
	return nil
}

func (d *Database) ZoneExportApkDataGet(token string) ([]*zone.ApkItem, error) {
	rows, err := d.db.Query("SELECT title,company,type,source,timestamp,msg FROM zone_apk_export WHERE token = ?", token)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []*zone.ApkItem
	for rows.Next() {
		var tmp = &zone.ApkItem{}
		var stringMsg string
		err2 := rows.Scan(&tmp.Title, &tmp.Company, &tmp.Type, &tmp.Source, &tmp.Timestamp, &stringMsg)
		if err2 != nil {
			return nil, err2
		}
		var msg any
		err2 = json.Unmarshal([]byte(stringMsg), &msg)
		if err2 != nil {
			return nil, err2
		}
		tmp.Msg = msg
		items = append(items, tmp)
	}
	return items, nil
}

func (d *Database) ZoneExportMemberDataInsert(token string, items []*zone.MemberItem) error {
	const insertSQL = "INSERT INTO zone_member_export (token,name,position,introduction,source,timestamp,company) VALUES (?,?,?,?,?,?,?)"
	tx, err := d.db.Begin()
	if err != nil {
		return err
	}
	stmt, err := tx.Prepare(insertSQL)
	if err != nil {
		return err
	}
	defer stmt.Close()
	for _, item := range items {
		marshalPosition, err2 := json.Marshal(item.Position)
		if err2 != nil {
			return err2
		}
		_, err = stmt.Exec(token, item.Name, string(marshalPosition), item.Introduction, item.Source, item.Timestamp, item.Company)
		if err != nil {
			// 回滚事务以撤销之前的操作
			if rollbackErr := tx.Rollback(); rollbackErr != nil {
				return rollbackErr
			}
			return err
		}
	}
	err = tx.Commit()
	if err != nil {
		// 回滚事务以撤销之前的操作
		if rollbackErr := tx.Rollback(); rollbackErr != nil {
			return rollbackErr
		}
		return err
	}
	return nil
}

func (d *Database) ZoneExportMemberDataGet(token string) ([]*zone.MemberItem, error) {
	rows, err := d.db.Query("SELECT name,position,introduction,source,timestamp,company FROM zone_member_export WHERE token = ?", token)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []*zone.MemberItem
	for rows.Next() {
		var tmp = &zone.MemberItem{}
		var stringPosition string
		err2 := rows.Scan(&tmp.Name, &stringPosition, &tmp.Introduction, &tmp.Source, &tmp.Timestamp, &tmp.Company)
		if err2 != nil {
			return nil, err2
		}
		var position []string
		err2 = json.Unmarshal([]byte(stringPosition), &position)
		if err2 != nil {
			return nil, err2
		}
		tmp.Position = position
		items = append(items, tmp)
	}
	return items, nil
}

func (d *Database) ZoneExportDomainDataInsert(token string, items []*zone.DomainItem) error {
	const insertSQL = "INSERT INTO zone_domain_export (token,ip,icp,company,url) VALUES (?,?,?,?,?)"
	tx, err := d.db.Begin()
	if err != nil {
		return err
	}
	stmt, err := tx.Prepare(insertSQL)
	if err != nil {
		return err
	}
	defer stmt.Close()
	for _, item := range items {
		_, err = stmt.Exec(token, item.IP, item.Icp, item.Company, item.URL)
		if err != nil {
			// 回滚事务以撤销之前的操作
			if rollbackErr := tx.Rollback(); rollbackErr != nil {
				return rollbackErr
			}
			return err
		}
	}
	err = tx.Commit()
	if err != nil {
		// 回滚事务以撤销之前的操作
		if rollbackErr := tx.Rollback(); rollbackErr != nil {
			return rollbackErr
		}
		return err
	}
	return nil
}

func (d *Database) ZoneExportDomainDataGet(token string) ([]*zone.DomainItem, error) {
	rows, err := d.db.Query("SELECT ip,icp,company,url FROM zone_domain_export WHERE token = ?", token)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []*zone.DomainItem
	for rows.Next() {
		var tmp = &zone.DomainItem{}
		err2 := rows.Scan(&tmp.IP, &tmp.Icp, &tmp.Company, &tmp.URL)
		if err2 != nil {
			return nil, err2
		}
		items = append(items, tmp)
	}
	return items, nil
}

func (d *Database) ZoneExportEmailDataInsert(token string, items []*zone.EmailItem) error {
	const insertSQL = "INSERT INTO zone_email_export (token,email,email_type,'group',source,timestamp) VALUES (?,?,?,?,?,?)"
	tx, err := d.db.Begin()
	if err != nil {
		return err
	}
	stmt, err := tx.Prepare(insertSQL)
	if err != nil {
		return err
	}
	defer stmt.Close()
	for _, item := range items {
		marshalSource, err2 := json.Marshal(item.Source)
		if err2 != nil {
			return err2
		}
		_, err = stmt.Exec(token, item.Email, item.EmailType, item.Group, string(marshalSource), item.Timestamp)
		if err != nil {
			// 回滚事务以撤销之前的操作
			if rollbackErr := tx.Rollback(); rollbackErr != nil {
				return rollbackErr
			}
			return err
		}
	}
	err = tx.Commit()
	if err != nil {
		// 回滚事务以撤销之前的操作
		if rollbackErr := tx.Rollback(); rollbackErr != nil {
			return rollbackErr
		}
		return err
	}
	return nil
}

func (d *Database) ZoneExportEmailDataGet(token string) ([]*zone.EmailItem, error) {
	rows, err := d.db.Query("SELECT email,email_type,'group',source,timestamp FROM zone_email_export WHERE token = ?", token)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []*zone.EmailItem
	for rows.Next() {
		var tmp = &zone.EmailItem{}
		var stringSource string
		err2 := rows.Scan(&tmp.Email, &tmp.EmailType, &tmp.Group, &stringSource, &tmp.Timestamp)
		if err2 != nil {
			return nil, err2
		}
		var source []string
		err2 = json.Unmarshal([]byte(stringSource), &source)
		if err2 != nil {
			return nil, err2
		}
		tmp.Source = source
		items = append(items, tmp)
	}
	return items, nil
}

func (d *Database) ZoneExportCodeDataInsert(token string, items []*zone.CodeItem) error {
	const insertSQL = "INSERT INTO zone_code_export (token,_id,name,path,url,sha,keyword,tags,file_extension,source,code_detail,score,type,created_time,timestamp,owner,repository,detail_parsing,timestamp_update,related_company) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
	tx, err := d.db.Begin()
	if err != nil {
		return err
	}
	stmt, err := tx.Prepare(insertSQL)
	if err != nil {
		return err
	}
	defer stmt.Close()
	for _, item := range items {
		marshalKeyword, err2 := json.Marshal(item.Keyword)
		if err2 != nil {
			return err2
		}
		marshalTags, err2 := json.Marshal(item.Tags)
		if err2 != nil {
			return err2
		}
		marshalOwner, err2 := json.Marshal(item.Owner)
		if err2 != nil {
			return err2
		}
		marshalRepository, err2 := json.Marshal(item.Repository)
		if err2 != nil {
			return err2
		}
		marshalDetailParsing, err2 := json.Marshal(item.DetailParsing)
		if err2 != nil {
			return err2
		}
		marshalRelatedCompany, err2 := json.Marshal(item.RelatedCompany)
		if err2 != nil {
			return err2
		}
		marshalScore, err2 := json.Marshal(item.Score)
		if err2 != nil {
			return err2
		}
		_, err = stmt.Exec(token, item.ID, item.Name, item.Path, item.URL, item.Sha, string(marshalKeyword), string(marshalTags), item.FileExtension, item.Source, item.CodeDetail, string(marshalScore), item.Type, item.CreatedTime, item.Timestamp, string(marshalOwner), string(marshalRepository), string(marshalDetailParsing), item.TimestampUpdate, string(marshalRelatedCompany))
		if err != nil {
			// 回滚事务以撤销之前的操作
			if rollbackErr := tx.Rollback(); rollbackErr != nil {
				return rollbackErr
			}
			return err
		}
	}
	err = tx.Commit()
	if err != nil {
		// 回滚事务以撤销之前的操作
		if rollbackErr := tx.Rollback(); rollbackErr != nil {
			return rollbackErr
		}
		return err
	}
	return nil
}

func (d *Database) ZoneExportCodeDataGet(token string) ([]*zone.CodeItem, error) {
	rows, err := d.db.Query("SELECT _id,name,path,url,sha,keyword,tags,file_extension,source,code_detail,score,type,created_time,timestamp,owner,repository,detail_parsing,timestamp_update,related_company FROM zone_code_export WHERE token = ?", token)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []*zone.CodeItem
	for rows.Next() {
		var tmp = &zone.CodeItem{}
		var stringKeyword string
		var stringTags string
		var stringOwner string
		var stringRepository string
		var stringDetailParsing string
		var stringRelatedCompany string
		var stringScore string
		err2 := rows.Scan(&tmp.ID, &tmp.Name, &tmp.Path, &tmp.URL, &tmp.Sha, &stringKeyword, &stringTags, &tmp.FileExtension, &tmp.Source, &tmp.CodeDetail, &stringScore, &tmp.Type, &tmp.CreatedTime, &tmp.Timestamp, &stringOwner, &stringRepository, &stringDetailParsing, &tmp.TimestampUpdate, &stringRelatedCompany)
		if err2 != nil {
			return nil, err2
		}
		var keyword any
		err2 = json.Unmarshal([]byte(stringKeyword), &keyword)
		if err2 != nil {
			return nil, err2
		}
		var tags []string
		err2 = json.Unmarshal([]byte(stringTags), &tags)
		if err2 != nil {
			return nil, err2
		}
		var owner zone.CodeOwner
		err2 = json.Unmarshal([]byte(stringOwner), &owner)
		if err2 != nil {
			return nil, err2
		}
		var repository zone.Repository
		err2 = json.Unmarshal([]byte(stringRepository), &repository)
		if err2 != nil {
			return nil, err2
		}
		var detailParsing zone.DetailParsing
		err2 = json.Unmarshal([]byte(stringDetailParsing), &detailParsing)
		if err2 != nil {
			return nil, err2
		}
		var relatedCompany []string
		err2 = json.Unmarshal([]byte(stringRelatedCompany), &relatedCompany)
		if err2 != nil {
			return nil, err2
		}
		var Score any
		err2 = json.Unmarshal([]byte(stringScore), &Score)
		if err2 != nil {
			return nil, err2
		}
		tmp.Keyword = keyword
		tmp.Tags = tags
		tmp.Owner = owner
		tmp.Repository = repository
		tmp.DetailParsing = detailParsing
		tmp.RelatedCompany = relatedCompany
		tmp.Score = Score
		items = append(items, tmp)
	}
	return items, nil
}

func (d *Database) ZoneExportDarknetDataInsert(token string, items []*zone.DarknetItem) error {
	const insertSQL = "INSERT INTO zone_darknet_export (token,_id,body_md5,msg,status_code,regions,org,page_type,root_domain,detail_parsing,to_new,description,industry,language,source,title,hot,url,tags,path,update_time,toplv_domain,user_id,event,timestamp) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
	tx, err := d.db.Begin()
	if err != nil {
		return err
	}
	stmt, err := tx.Prepare(insertSQL)
	if err != nil {
		return err
	}
	defer stmt.Close()
	for _, item := range items {
		marshalMsg, err2 := json.Marshal(item.Msg)
		if err2 != nil {
			return err2
		}
		marshalRegions, err2 := json.Marshal(item.Regions)
		if err2 != nil {
			return err2
		}
		marshalOrg, err2 := json.Marshal(item.Org)
		if err2 != nil {
			return err2
		}
		marshalPageType, err2 := json.Marshal(item.PageType)
		if err2 != nil {
			return err2
		}
		marshalDetailParsing, err2 := json.Marshal(item.DetailParsing)
		if err2 != nil {
			return err2
		}
		marshalIndustry, err2 := json.Marshal(item.Industry)
		if err2 != nil {
			return err2
		}
		marshalLanguage, err2 := json.Marshal(item.Language)
		if err2 != nil {
			return err2
		}
		marshalTags, err2 := json.Marshal(item.Tags)
		if err2 != nil {
			return err2
		}
		marshalUserID, err2 := json.Marshal(item.UserID)
		if err2 != nil {
			return err2
		}
		marshalEvent, err2 := json.Marshal(item.Event)
		if err2 != nil {
			return err2
		}
		marshalTimestamp, err2 := json.Marshal(item.Timestamp)
		if err2 != nil {
			return err2
		}
		_, err = stmt.Exec(token, item.ID, item.BodyMd5, string(marshalMsg), item.StatusCode, string(marshalRegions), string(marshalOrg), string(marshalPageType), item.RootDomain, string(marshalDetailParsing), item.ToNew, item.Description, string(marshalIndustry), string(marshalLanguage), item.Source, item.Title, item.Hot, item.URL, string(marshalTags), item.Path, item.UpdateTime, item.ToplvDomain, string(marshalUserID), string(marshalEvent), string(marshalTimestamp))
		if err != nil {
			// 回滚事务以撤销之前的操作
			if rollbackErr := tx.Rollback(); rollbackErr != nil {
				return rollbackErr
			}
			return err
		}
	}
	err = tx.Commit()
	if err != nil {
		// 回滚事务以撤销之前的操作
		if rollbackErr := tx.Rollback(); rollbackErr != nil {
			return rollbackErr
		}
		return err
	}
	return nil
}

func (d *Database) ZoneExportDarknetDataGet(token string) ([]*zone.DarknetItem, error) {
	rows, err := d.db.Query("SELECT _id,body_md5,msg,status_code,regions,org,page_type,root_domain,detail_parsing,to_new,description,industry,language,source,title,hot,url,tags,path,update_time,toplv_domain,user_id,event,timestamp FROM zone_darknet_export WHERE token = ?", token)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []*zone.DarknetItem
	for rows.Next() {
		var tmp = &zone.DarknetItem{}
		var stringMsg string
		var stringRegions string
		var stringOrg string
		var stringPageType string
		var stringDetailParsing string
		var stringIndustry string
		var stringLanguage string
		var stringTags string
		var stringUserID string
		var stringEvent string
		var stringTimestamp string
		err2 := rows.Scan(&tmp.ID, &tmp.BodyMd5, &stringMsg, &tmp.StatusCode, &stringRegions, &stringOrg, &stringPageType, &tmp.RootDomain, &stringDetailParsing, &tmp.ToNew, &tmp.Description, &stringIndustry, &stringLanguage, &tmp.Source, &tmp.Title, &tmp.Hot, &tmp.URL, &stringTags, &tmp.Path, &tmp.UpdateTime, &tmp.ToplvDomain, &stringUserID, &stringEvent, &stringTimestamp)
		if err2 != nil {
			return nil, err2
		}
		var msg zone.DarknetMsg
		var regions []zone.Regions
		var org []string
		var pageType []string
		var detailParsing zone.DetailParsing
		var industry []string
		var language []string
		var tags []string
		var userId any
		var event []string
		var timestamp any
		err2 = json.Unmarshal([]byte(stringMsg), &msg)
		if err2 != nil {
			return nil, err2
		}
		err2 = json.Unmarshal([]byte(stringRegions), &regions)
		if err2 != nil {
			return nil, err2
		}
		err2 = json.Unmarshal([]byte(stringOrg), &org)
		if err2 != nil {
			return nil, err2
		}
		err2 = json.Unmarshal([]byte(stringPageType), &pageType)
		if err2 != nil {
			return nil, err2
		}
		err2 = json.Unmarshal([]byte(stringDetailParsing), &detailParsing)
		if err2 != nil {
			return nil, err2
		}
		err2 = json.Unmarshal([]byte(stringIndustry), &industry)
		if err2 != nil {
			return nil, err2
		}
		err2 = json.Unmarshal([]byte(stringLanguage), &language)
		if err2 != nil {
			return nil, err2
		}
		err2 = json.Unmarshal([]byte(stringTags), &tags)
		if err2 != nil {
			return nil, err2
		}
		err2 = json.Unmarshal([]byte(stringMsg), &userId)
		if err2 != nil {
			return nil, err2
		}
		err2 = json.Unmarshal([]byte(stringMsg), &timestamp)
		if err2 != nil {
			return nil, err2
		}
		tmp.Msg = msg
		tmp.Regions = regions
		tmp.Org = org
		tmp.PageType = pageType
		tmp.Industry = industry
		tmp.Language = language
		tmp.Tags = tags
		tmp.UserID = userId
		tmp.Event = event
		tmp.Timestamp = timestamp
		items = append(items, tmp)
	}
	return items, nil
}

func (d *Database) ZoneExportAimDataInsert(token string, items []*zone.AimItem) error {
	const insertSQL = "INSERT INTO zone_aim_export (token,_index,_type,_id,_score,_ignored,_source,sort) VALUES (?,?,?,?,?,?,?,?)"
	tx, err := d.db.Begin()
	if err != nil {
		return err
	}
	stmt, err := tx.Prepare(insertSQL)
	if err != nil {
		return err
	}
	defer stmt.Close()
	for _, item := range items {
		marshalScore, err2 := json.Marshal(item.Score)
		if err2 != nil {
			return err2
		}
		marshalIgnored, err2 := json.Marshal(item.Ignored)
		if err2 != nil {
			return err2
		}
		marshalSource, err2 := json.Marshal(item.Source)
		if err2 != nil {
			return err2
		}
		marshalSort, err2 := json.Marshal(item.Sort)
		if err2 != nil {
			return err2
		}
		_, err = stmt.Exec(token, item.Index, item.Type, item.ID, string(marshalScore), string(marshalIgnored), string(marshalSource), string(marshalSort))
		if err != nil {
			// 回滚事务以撤销之前的操作
			if rollbackErr := tx.Rollback(); rollbackErr != nil {
				return rollbackErr
			}
			return err
		}
	}
	err = tx.Commit()
	if err != nil {
		// 回滚事务以撤销之前的操作
		if rollbackErr := tx.Rollback(); rollbackErr != nil {
			return rollbackErr
		}
		return err
	}
	return nil
}

func (d *Database) ZoneExportAimDataGet(token string) ([]*zone.AimItem, error) {
	rows, err := d.db.Query("SELECT _index,_type,_id,_score,_ignored,_source,sort FROM zone_aim_export WHERE token = ?", token)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []*zone.AimItem
	for rows.Next() {
		var tmp = &zone.AimItem{}
		var stringScore string
		var stringIgnored string
		var stringSource string
		var stringSort string

		err2 := rows.Scan(&tmp.Index, &tmp.Type, &tmp.ID, &stringScore, &stringIgnored, &stringSource, &stringSort)
		if err2 != nil {
			return nil, err2
		}
		var score any
		var ignored []string
		var source zone.AimSource
		var sort []int64
		err2 = json.Unmarshal([]byte(stringScore), &score)
		if err2 != nil {
			return nil, err2
		}
		err2 = json.Unmarshal([]byte(stringIgnored), &ignored)
		if err2 != nil {
			return nil, err2
		}
		err2 = json.Unmarshal([]byte(stringSource), &source)
		if err2 != nil {
			return nil, err2
		}
		err2 = json.Unmarshal([]byte(stringSort), &sort)
		if err2 != nil {
			return nil, err2
		}
		tmp.Source = source
		tmp.Ignored = ignored
		tmp.Source = source
		tmp.Sort = sort
		items = append(items, tmp)
	}
	return items, nil
}
