package shodan

import (
	"gorm.io/datatypes"
)

type Count struct {
	Count int    `json:"count"`
	Value string `json:"value"`
}

type Facets struct {
	ASN                   datatypes.JSONSlice[Count] `json:"asn"`
	BitcoinIP             datatypes.JSONSlice[Count] `json:"bitcoin.ip"`
	BitcoinIPCount        datatypes.JSONSlice[Count] `json:"bitcoin.ip_count"`
	BitcoinPort           datatypes.JSONSlice[Count] `json:"bitcoin.port"`
	BitcoinUserAgent      datatypes.JSONSlice[Count] `json:"bitcoin.user_agent"`
	BitcoinVersion        datatypes.JSONSlice[Count] `json:"bitcoin.version"`
	City                  datatypes.JSONSlice[Count] `json:"city"`
	CloudProvider         datatypes.JSONSlice[Count] `json:"cloud.provider"`
	CloudRegion           datatypes.JSONSlice[Count] `json:"cloud.region"`
	CloudService          datatypes.JSONSlice[Count] `json:"cloud.service"`
	Country               datatypes.JSONSlice[Count] `json:"country"`
	CPE                   datatypes.JSONSlice[Count] `json:"cpe"`
	Device                datatypes.JSONSlice[Count] `json:"device"`
	Domain                datatypes.JSONSlice[Count] `json:"domain"`
	HasScreenshot         datatypes.JSONSlice[Count] `json:"has_screenshot"`
	Hash                  datatypes.JSONSlice[Count] `json:"hash"`
	HTTPComponent         datatypes.JSONSlice[Count] `json:"http.component"`
	HTTPComponentCategory datatypes.JSONSlice[Count] `json:"http.component_category"`
	HTTPFaviconHash       datatypes.JSONSlice[Count] `json:"http.favicon.hash"`
	HTTPHeadersHash       datatypes.JSONSlice[Count] `json:"http.headers_hash"`
	HTMLHash              datatypes.JSONSlice[Count] `json:"http.html_hash"`
	HTTPRobotsHash        datatypes.JSONSlice[Count] `json:"http.robots_hash"`
	HTTPStatus            datatypes.JSONSlice[Count] `json:"http.status"`
	HTTPTitle             datatypes.JSONSlice[Count] `json:"http.title"`
	HTTPWAF               datatypes.JSONSlice[Count] `json:"http.waf"`
	IP                    datatypes.JSONSlice[Count] `json:"ip"`
	ISP                   datatypes.JSONSlice[Count] `json:"isp"`
	Link                  datatypes.JSONSlice[Count] `json:"link"`
	MongoDBDatabaseName   datatypes.JSONSlice[Count] `json:"mongodb.database.name"`
	NTPIP                 datatypes.JSONSlice[Count] `json:"ntp.ip"`
	NTPIPCount            datatypes.JSONSlice[Count] `json:"ntp.ip_count"`
	NTPMore               datatypes.JSONSlice[Count] `json:"ntp.more"`
	NTPPort               datatypes.JSONSlice[Count] `json:"ntp.port"`
	Org                   datatypes.JSONSlice[Count] `json:"org"`
	OS                    datatypes.JSONSlice[Count] `json:"os"`
	Port                  datatypes.JSONSlice[Count] `json:"port"`
	Postal                datatypes.JSONSlice[Count] `json:"postal"`
	Product               datatypes.JSONSlice[Count] `json:"product"`
	RedisKey              datatypes.JSONSlice[Count] `json:"redis.key"`
	Region                datatypes.JSONSlice[Count] `json:"region"`
	RsyncModule           datatypes.JSONSlice[Count] `json:"rsync.module"`
	ScreenshotHash        datatypes.JSONSlice[Count] `json:"screenshot.hash"`
	ScreenshotLabel       datatypes.JSONSlice[Count] `json:"screenshot.label"`
	SNMPContact           datatypes.JSONSlice[Count] `json:"snmp.contact"`
	SNMPLocation          datatypes.JSONSlice[Count] `json:"snmp.location"`
	SNMPName              datatypes.JSONSlice[Count] `json:"snmp.name"`
	SSHCipher             datatypes.JSONSlice[Count] `json:"ssh.cipher"`
	SSHFingerprint        datatypes.JSONSlice[Count] `json:"ssh.fingerprint"`
	SSHHassh              datatypes.JSONSlice[Count] `json:"ssh.hassh"`
	SSHMAC                datatypes.JSONSlice[Count] `json:"ssh.mac"`
	SSHType               datatypes.JSONSlice[Count] `json:"ssh.type"`
	SSLALPN               datatypes.JSONSlice[Count] `json:"ssl.alpn"`
	SSLCertAlg            datatypes.JSONSlice[Count] `json:"ssl.cert.alg"`
	SSLCertExpired        datatypes.JSONSlice[Count] `json:"ssl.cert.expired"`
	SSLCertExtension      datatypes.JSONSlice[Count] `json:"ssl.cert.extension"`
	SSLCertFingerprint    datatypes.JSONSlice[Count] `json:"ssl.cert.fingerprint"`
	SSLCertIssuerCN       datatypes.JSONSlice[Count] `json:"ssl.cert.issuer.cn"`
	SSLCertPubkeyBits     datatypes.JSONSlice[Count] `json:"ssl.cert.pubkey.bits"`
	SSLCertPubkeyType     datatypes.JSONSlice[Count] `json:"ssl.cert.pubkey.type"`
	SSLCertSerial         datatypes.JSONSlice[Count] `json:"ssl.cert.serial"`
	SSLCertSubjectCN      datatypes.JSONSlice[Count] `json:"ssl.cert.subject.cn"`
	SSLChainCount         datatypes.JSONSlice[Count] `json:"ssl.chain_count"`
	SSLCipherBits         datatypes.JSONSlice[Count] `json:"ssl.cipher.bits"`
	SSLCipherName         datatypes.JSONSlice[Count] `json:"ssl.cipher.name"`
	SSLCipherVersion      datatypes.JSONSlice[Count] `json:"ssl.cipher.version"`
	SSLJA3S               datatypes.JSONSlice[Count] `json:"ssl.ja3s"`
	SSLJarm               datatypes.JSONSlice[Count] `json:"ssl.jarm"`
	SSLVersion            datatypes.JSONSlice[Count] `json:"ssl.version"`
	State                 datatypes.JSONSlice[Count] `json:"state"`
	Tag                   datatypes.JSONSlice[Count] `json:"tag"`
	TelnetDo              datatypes.JSONSlice[Count] `json:"telnet.do"`
	TelnetDont            datatypes.JSONSlice[Count] `json:"telnet.dont"`
	TelnetOption          datatypes.JSONSlice[Count] `json:"telnet.option"`
	TelnetWill            datatypes.JSONSlice[Count] `json:"telnet.will"`
	TelnetWont            datatypes.JSONSlice[Count] `json:"telnet.wont"`
	Uptime                datatypes.JSONSlice[Count] `json:"uptime"`
	Version               datatypes.JSONSlice[Count] `json:"version"`
	Vuln                  datatypes.JSONSlice[Count] `json:"vuln"`
	VulnVerified          datatypes.JSONSlice[Count] `json:"vuln.verified"`
}
