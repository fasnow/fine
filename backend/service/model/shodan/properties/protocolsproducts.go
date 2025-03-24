package properties

type AmqpCapabilities struct {
	BasicNack                bool `json:"basic.nack"`
	ConsumerCancelNotify     bool `json:"consumer_cancel_notify"`
	ExchangeExchangeBindings bool `json:"exchange_exchange_bindings"`
	PublisherConfirms        bool `json:"publisher_confirms"`
}

type AmqpServerProperties struct {
	Capabilities AmqpCapabilities `json:"capabilities"`
	Copyright    string           `json:"copyright"`
	Information  string           `json:"information"`
	Platform     string           `json:"platform"`
	Product      string           `json:"product"`
	Version      string           `json:"version"`
}

type Amqp struct {
	Encoded          string               `json:"encoded"`
	Locales          string               `json:"locales"`
	Mechanisms       string               `json:"mechanisms"`
	ServerProperties AmqpServerProperties `json:"server_properties"`
	VersionMajor     int                  `json:"version_major"`
	VersionMinor     int                  `json:"version_minor"`
}

type Screenshot struct {
	Data   string   `json:"data"`
	Hash   int      `json:"hash"`
	Labels []string `json:"labels"`
	Mime   string   `json:"mime"`
	Text   string   `json:"text"`
}

// AfpFlags 结构体用于表示 AFP 服务器的标志信息
type AfpFlags struct {
	CopyFile                 bool   `json:"copy_file"`
	FlagHex                  string `json:"flag_hex"`
	OpenDirectory            bool   `json:"open_directory"`
	PasswordChanging         bool   `json:"password_changing"`
	PasswordSavingProhibited bool   `json:"password_saving_prohibited"`
	Reconnect                bool   `json:"reconnect"`
	ServerMessages           bool   `json:"server_messages"`
	ServerNotifications      bool   `json:"server_notifications"`
	ServerSignature          bool   `json:"server_signature"`
	SuperClient              bool   `json:"super_client"`
	TCPIP                    bool   `json:"tcp_ip"`
	UTF8ServerName           bool   `json:"utf8_server_name"`
	UUIDs                    bool   `json:"uuids"`
}

// AFP 结构体用于表示 Apple File Protocol 相关信息
type AFP struct {
	AFPVersions      []string `json:"afp_versions"`
	DirectoryNames   []string `json:"directory_names"`
	MachineType      string   `json:"machine_type"`
	NetworkAddresses []string `json:"network_addresses"`
	ServerFlags      AfpFlags `json:"server_flags"`
	ServerName       string   `json:"server_name"`
	ServerSignature  string   `json:"server_signature"`
	UAMS             []string `json:"uams"`
	UTF8ServerName   string   `json:"utf8_server_name"`
}

// AirPlay 结构体用于存储 AirPlay 相关的设备信息
type AirPlay struct {
	AccessControlLevel string `json:"access_control_level"`
	AirPlayVersion     string `json:"airplay_version"`
	BluetoothAddress   string `json:"bluetooth_address"`
	Company            string `json:"company"`
	DeviceID           string `json:"device_id"`
	DeviceModel        string `json:"device_model"`
	FirmwareBuild      string `json:"firmware_build"`
	FirmwareBuildDate  string `json:"firmware_build_date"`
	FirmwareVersion    string `json:"firmware_version"`
	HardwareRevision   string `json:"hardware_revision"`
	MacAddress         string `json:"mac_address"`
	Manufacturer       string `json:"manufacturer"`
	Name               string `json:"name"`
	OSBuildVersion     string `json:"os_build_version"`
	OSVersion          string `json:"os_version"`
	ProtocolVersion    string `json:"protocol_version"`
	SDK                string `json:"sdk"`
	SerialNumber       string `json:"serial_number"`
	VodkaVersion       int    `json:"vodka_version"`
}

// AndroidDebugBridge 结构体用于存储 Android Debug Bridge（ADB）相关信息
type AndroidDebugBridge struct {
	Device   string   `json:"device"`
	Features []string `json:"features"`
	Model    string   `json:"model"`
	Name     string   `json:"name"`
}

// AuerswaldCompactSeries 结构体用于存储 Auerswald 紧凑型系列设备的相关信息
type AuerswaldCompactSeries struct {
	HardwareRevision string `json:"hardware_revision"`
	MacAddress       string `json:"mac_address"`
	Model            string `json:"model"`
	Serial           string `json:"serial"`
	Version          string `json:"version"`
}

// BacnetDevice 结构体表示 BACnet 设备的相关信息
type BacnetDevice struct {
	IP      string `json:"ip"`
	Port    int    `json:"port"`
	Timeout int    `json:"timeout,omitempty"`
	TTL     int    `json:"ttl,omitempty"`
}

// Bacnet 结构体表示 BACnet 相关的属性
type Bacnet struct {
	Appsoft    string         `json:"appsoft,omitempty"`
	BBMD       []BacnetDevice `json:"bbmd"`
	Desc       string         `json:"desc,omitempty"`
	FDT        []BacnetDevice `json:"fdt"`
	Firmware   string         `json:"firmware,omitempty"`
	InstanceID string         `json:"instance_id,omitempty"`
	Location   string         `json:"location,omitempty"`
	Model      string         `json:"model,omitempty"`
	Name       string         `json:"name,omitempty"`
	Object     string         `json:"object,omitempty"`
	Vendor     string         `json:"vendor,omitempty"`
}

// BgpMessage 结构体表示 BGP 消息的相关信息
type BgpMessage struct {
	ASN           int    `json:"asn"`
	BGPIdentifier string `json:"bgp_identifer"`
	ErrorCode     string `json:"error_code"`
	ErrorSubcode  string `json:"error_subcode"`
	HoldTime      int    `json:"hold_time"`
	Length        int    `json:"length"`
	Marker        string `json:"marker"`
	Type          string `json:"type"`
	Version       int    `json:"version"`
}

// BGP 结构体表示 BGP 服务响应的相关信息
type BGP struct {
	Messages []BgpMessage `json:"messages"`
}

type Bitcoin struct {
	Addresses []BitcoinPeer    `json:"addresses"`
	Handshake []BitcoinMessage `json:"handshake"`
}

type BitcoinPeer struct {
	IP   string `json:"ip"`
	Port int    `json:"port"`
}

type BitcoinMessage struct {
	Checksum    string         `json:"checksum"`
	Command     string         `json:"command"`
	FromAddr    BitcoinAddress `json:"from_addr"`
	LastBlock   int            `json:"lastblock"`
	Length      int            `json:"length"`
	MagicNumber string         `json:"magic_number"`
	Nonce       int            `json:"nonce"`
	Relay       bool           `json:"relay"`
	Services    int            `json:"services"`
	Timestamp   int            `json:"timestamp"`
	ToAddr      BitcoinAddress `json:"to_addr"`
	UserAgent   string         `json:"user_agent"`
	Version     int            `json:"version"`
}

type BitcoinAddress struct {
	IPv4      string `json:"ipv4"`
	IPv6      string `json:"ipv6"`
	Port      int    `json:"port"`
	Services  int    `json:"services"`
	Timestamp int    `json:"timestamp"`
}

type Cassandra struct {
	Keyspaces        []string `json:"keyspaces"`
	Name             string   `json:"name"`
	Partitioner      string   `json:"partitioner"`
	Snitch           string   `json:"snitch"`
	ThriftAPIVersion string   `json:"thrift_api_version"`
	Version          string   `json:"version"`
}

type Checkpoint struct {
	FirewallHost    string `json:"firewall_host"`
	SmartcenterHost string `json:"smartcenter_host"`
}

type Chroma struct {
	ConfigurationJSON map[string]interface{} `json:"configuration_json"`
	Database          string                 `json:"database"`
	Dimension         int                    `json:"dimension"`
	ID                string                 `json:"id"`
	LogPosition       int                    `json:"log_position"`
	Name              string                 `json:"name"`
	Tenant            string                 `json:"tenant"`
	Version           int                    `json:"version"`
}

type Chromecast struct {
	BuildInfo  ChromecastBuildInfo  `json:"build_info"`
	DeviceInfo ChromecastDeviceInfo `json:"device_info"`
	Net        ChromecastNet        `json:"net"`
	Version    int                  `json:"version"`
	Wifi       ChromecastWifi       `json:"wifi"`
}

type ChromecastBuildInfo struct {
	BuildType          int    `json:"build_type"`
	CastBuildRevision  string `json:"cast_build_revision"`
	CastControlVersion int    `json:"cast_control_version"`
	ReleaseTrack       string `json:"release_track"`
	SystemBuildNumber  string `json:"system_build_number"`
}

type ChromecastDeviceInfo struct {
	CloudDeviceID string `json:"cloud_device_id"`
	DeviceName    string `json:"device_name"`
	HotspotBSSID  string `json:"hotspot_bssid"`
	MACAddress    string `json:"mac_address"`
	Manufacturer  string `json:"manufacturer"`
	ModelName     string `json:"model_name"`
	ProductName   string `json:"product_name"`
	PublicKey     string `json:"public_key"`
	SSDPUDN       string `json:"ssdp_udn"`
	UMAClientID   string `json:"uma_client_id"`
}

type ChromecastNet struct {
	EthernetConnected bool   `json:"ethernet_connected"`
	IPAddress         string `json:"ip_address"`
	Online            bool   `json:"online"`
}

type ChromecastWifi struct {
	BSSID string `json:"bssid"`
	SSID  string `json:"ssid"`
}

type CiscoAnyConnect struct {
	ConfigHash  string `json:"config_hash"`
	GroupAlias  string `json:"group_alias"`
	TunnelGroup string `json:"tunnel_group"`
	Version     string `json:"version"`
}

type Cloud struct {
	Provider string `json:"provider"`
	Region   string `json:"region"`
	Service  string `json:"service"`
}

type CoAP struct {
	Resources map[string]interface{} `json:"resources"`
}

type CobaltStrikeBeacon struct {
	X64 CobaltStrikeBeaconDetails `json:"x64"`
	X86 CobaltStrikeBeaconDetails `json:"x86"`
}

type CobaltStrikeBeaconDetails struct {
	BeaconType                     string      `json:"beacon_type"`
	DNSBeaconStrategyFailSeconds   int         `json:"dns-beacon.strategy_fail_seconds"`
	DNSBeaconStrategyFailX         int         `json:"dns-beacon.strategy_fail_x"`
	DNSBeaconStrategyRotateSeconds int         `json:"dns-beacon.strategy_rotate_seconds"`
	HTTPGetClient                  []string    `json:"http-get.client"`
	HTTPGetURI                     string      `json:"http-get.uri"`
	HTTPGetVerb                    string      `json:"http-get.verb"`
	HTTPPostClient                 []string    `json:"http-post.client"`
	HTTPPostURI                    string      `json:"http-post.uri"`
	HTTPPostVerb                   string      `json:"http-post.verb"`
	Jitter                         int         `json:"jitter"`
	KillDate                       int         `json:"kill_date"`
	MaxGetSize                     int         `json:"maxgetsize"`
	Port                           int         `json:"port"`
	PostExSpawnToX64               string      `json:"post-ex.spawnto_x64"`
	PostExSpawnToX86               string      `json:"post-ex.spawnto_x86"`
	ProcessInjectExecute           []string    `json:"process-inject.execute"`
	ProcessInjectMinAlloc          int         `json:"process-inject.min_alloc"`
	ProcessInjectStartRWX          int         `json:"process-inject.startrwx"`
	ProcessInjectUserWX            int         `json:"process-inject.userwx"`
	ProxyBehavior                  interface{} `json:"proxy.behavior"` // Could be int or string
	SleepTime                      int         `json:"sleeptime"`
	StageCleanup                   int         `json:"stage.cleanup"`
	UserAgentHeader                string      `json:"useragent_header"`
	Watermark                      int         `json:"watermark"`
}

type CockroachDB struct {
	ExperimentalUserLogin bool   `json:"experimental_user_login"`
	NodeID                string `json:"node_id"`
	OIDCLoginEnable       bool   `json:"oidc_login_enable"`
	Tag                   string `json:"tag"`
	Version               string `json:"version"`
}

type Codesys struct {
	OS        string `json:"os"`
	OSDetails string `json:"os_details"`
	Product   string `json:"product"`
}

type Consul struct {
	Datacenter        string `json:"Datacenter"`
	NodeID            string `json:"NodeID"`
	NodeName          string `json:"NodeName"`
	PrimaryDatacenter string `json:"PrimaryDatacenter"`
	Revision          string `json:"Revision"`
	Server            bool   `json:"Server"`
	Version           string `json:"Version"`
}

type CouchbaseServer struct {
	ComponentsVersion     map[string]interface{} `json:"componentsVersion"`
	ImplementationVersion string                 `json:"implementationVersion"`
}

type CouchbaseSyncGateway struct {
	CouchDB          string                 `json:"couchdb"`
	PersistentConfig bool                   `json:"persistent_config"`
	Vendor           map[string]interface{} `json:"vendor"`
	Version          string                 `json:"version"`
}

type CouchDB struct {
	CouchDB     string                 `json:"couchdb"`
	Features    []string               `json:"features"`
	GitSHA      string                 `json:"git_sha"`
	HTTPHeaders string                 `json:"http_headers"`
	UUID        string                 `json:"uuid"`
	Vendor      map[string]interface{} `json:"vendor"`
	Version     string                 `json:"version"`
}

type Dahua struct {
	SerialNumber string `json:"serial_number"`
}

type DahuaDVRWeb struct {
	ChannelNames []string          `json:"channel_names"`
	Plugin       DahuaDVRWebPlugin `json:"plugin"`
	UserInfo     string            `json:"user_info"`
	WebVersion   string            `json:"web_version"`
}

type DahuaDVRWebPlugin struct {
	ClassID    string `json:"classid"`
	MacVersion string `json:"mac_version"`
	Name       string `json:"name"`
	Version    string `json:"version"`
}

type DAV struct {
	AllowedMethods []string `json:"allowed_methods"`
	IPs            []string `json:"ips"`
	Paths          []string `json:"paths"`
	PublicOptions  []string `json:"public_options"`
	ServerDate     string   `json:"server_date"`
	ServerType     string   `json:"server_type"`
	WebDAVType     string   `json:"webdav_type"`
}

type DDWRT struct {
	FirmwareVersion string `json:"firmware_version"`
	RouterModel     string `json:"router_model"`
	RouterName      string `json:"router_name"`
	SVNBuildNumber  string `json:"svn_build_number"`
}

type DNS struct {
	Recursive        bool   `json:"recursive"`
	ResolverHostname string `json:"resolver_hostname"`
	ResolverID       string `json:"resolver_id"`
	Software         string `json:"software"`
}

type Docker struct {
	APIVersion    string `json:"ApiVersion"`
	Arch          string `json:"Arch"`
	BuildTime     string `json:"BuildTime"`
	GitCommit     string `json:"GitCommit"`
	GoVersion     string `json:"GoVersion"`
	KernelVersion string `json:"KernelVersion"`
	MinAPIVersion string `json:"MinAPIVersion"`
	Os            string `json:"Os"`
	Version       string `json:"Version"`
}

type DockerRegistry struct {
	Error        string   `json:"error"`
	Repositories []string `json:"repositories"`
}

type DogecoinNode struct {
	ProtocolVersion int    `json:"protocol_version"`
	UserAgent       string `json:"user_agent"`
}

type Domoticz struct {
	BuildTime       string `json:"build_time"`
	DZEventsVersion string `json:"dzevents_version"`
	Hash            string `json:"hash"`
	PythonVersion   string `json:"python_version"`
	Version         string `json:"version"`
}

type DraytekVigor struct {
	BuildTime string `json:"build_time"`
}

type Elastic struct {
	Cluster map[string]interface{} `json:"cluster"`
	Indices map[string]interface{} `json:"indices"`
	Nodes   map[string]interface{} `json:"nodes"`
}

type EPMD struct {
	Nodes map[string]interface{} `json:"nodes"`
}

type Etcd struct {
	API                  string                 `json:"api"`
	ClientURLs           []string               `json:"clientURLs"`
	DBSize               int                    `json:"dbSize"`
	ID                   interface{}            `json:"id"` // Could be int or string
	LeaderInfo           map[string]interface{} `json:"leaderInfo"`
	Name                 string                 `json:"name"`
	PeerURLs             []string               `json:"peerURLs"`
	RecvAppendRequestCnt int                    `json:"recvAppendRequestCnt"`
	RecvBandwidthRate    float64                `json:"recvBandwidthRate"`
	RecvPkgRate          float64                `json:"recvPkgRate"`
	SendAppendRequestCnt int                    `json:"sendAppendRequestCnt"`
	SendBandwidthRate    float64                `json:"sendBandwidthRate"`
	SendPkgRate          float64                `json:"sendPkgRate"`
	StartTime            string                 `json:"startTime"`
	State                string                 `json:"state"`
	Version              string                 `json:"version"`
}

type EthereumP2P struct {
	Neighbors []EthereumP2PNeighbour `json:"neighbors"`
	Pubkey    string                 `json:"pubkey"`
	TCPPort   int                    `json:"tcp_port"`
	UDPPort   int                    `json:"udp_port"`
	Version   int                    `json:"version"`
}

type EthereumP2PNeighbour struct {
	IP      string `json:"ip"`
	Pubkey  string `json:"pubkey"`
	TCPPort int    `json:"tcp_port"`
	UDPPort int    `json:"udp_port"`
}

type EthereumRPC struct {
	Accounts []string `json:"accounts"`
	ChainID  string   `json:"chain_id"`
	Client   string   `json:"client"`
	Compiler string   `json:"compiler"`
	Hashrate string   `json:"hashrate"`
	Platform string   `json:"platform"`
	Version  string   `json:"version"`
}

type EthernetIP struct {
	Command             int    `json:"command"`
	CommandLength       int    `json:"command_length"`
	CommandStatus       int    `json:"command_status"`
	DeviceType          string `json:"device_type"`
	EncapsulationLength int    `json:"encapsulation_length"`
	IP                  string `json:"ip"`
	ItemCount           int    `json:"item_count"`
	Options             int    `json:"options"`
	ProductCode         int    `json:"product_code"`
	ProductName         string `json:"product_name"`
	ProductNameLength   int    `json:"product_name_length"`
	Raw                 string `json:"raw"`
	RevisionMajor       int    `json:"revision_major"`
	RevisionMinor       int    `json:"revision_minor"`
	SenderContext       string `json:"sender_context"`
	Serial              int    `json:"serial"`
	Session             int    `json:"session"`
	SocketAddr          string `json:"socket_addr"`
	State               int    `json:"state"`
	Status              int    `json:"status"`
	TypeID              int    `json:"type_id"`
	VendorID            string `json:"vendor_id"`
	Version             int    `json:"version"`
}

type Fortinet struct {
	Device       string `json:"device"`
	Model        string `json:"model"`
	SerialNumber string `json:"serial_number"`
}

type FTP struct {
	Anonymous    bool                  `json:"anonymous"`
	Features     map[string]FTPFeature `json:"features"`
	FeaturesHash int                   `json:"features_hash"`
}

type FTPFeature struct {
	Parameters []string `json:"parameters"`
}

type Ganglia struct {
	Clusters []GangliaCluster `json:"clusters"`
	Version  string           `json:"version"`
}

type GangliaCluster struct {
	Hosts []map[string]interface{} `json:"hosts"`
	Name  string                   `json:"name"`
	Owner string                   `json:"owner"`
}

type GLInet struct {
	FirmwareCategory string `json:"firmware_category"`
	Hostname         string `json:"hostname"`
	Model            string `json:"model"`
	SecurityRole     string `json:"security_role"`
}

type Handpunch struct {
	AdapterType  string `json:"adapter_type"`
	EPROMVersion string `json:"eprom_version"`
	MaxLogs      int    `json:"max_logs"`
	MaxUsers     int    `json:"max_users"`
	MemorySize   string `json:"memory_size"`
	Model        string `json:"model"`
	ModelName    string `json:"model_name"`
	SerialNumber int    `json:"serial_number"`
	TotalLogs    int    `json:"total_logs"`
	TotalUsers   int    `json:"total_users"`
}

type HBase struct {
	ClusterKey              string `json:"cluster_key"`
	Coprocessors            string `json:"coprocessors"`
	HadoopCompiled          string `json:"hadoop_compiled"`
	HadoopSourceChecksum    string `json:"hadoop_source_checksum"`
	HadoopVersion           string `json:"hadoop_version"`
	HBaseClusterID          string `json:"hbase_cluster_id"`
	HBaseCompiled           string `json:"hbase_compiled"`
	HBaseMaster             string `json:"hbase_master"`
	HBaseRootDirectory      string `json:"hbase_root_directory"`
	HBaseSourceChecksum     string `json:"hbase_source_checksum"`
	HBaseVersion            string `json:"hbase_version"`
	HMasterActiveTime       string `json:"hmaster_active_time"`
	HMasterStartTime        string `json:"hmaster_start_time"`
	JVMVersion              string `json:"jvm_version"`
	LoadAverage             string `json:"load_average"`
	Loadbalancer            string `json:"loadbalancer"`
	RestServerStartTime     string `json:"rest_server_start_time"`
	RSStartTime             string `json:"rs_start_time"`
	ZookeeperBasePath       string `json:"zookeeper_base_path"`
	ZookeeperClientCompiled string `json:"zookeeper_client_compiled"`
	ZookeeperClientVersion  string `json:"zookeeper_client_version"`
	ZookeeperQuorum         string `json:"zookeeper_quorum"`
}

type Hikvision struct {
	ActiveXFiles      map[string]interface{} `json:"activex_files"`
	CustomVersion     string                 `json:"custom_version"`
	CustomVersion2    string                 `json:"custom_version_2"`
	DeviceDescription string                 `json:"device_description"`
	DeviceModel       string                 `json:"device_model"`
	DeviceName        string                 `json:"device_name"`
	DeviceVersion     string                 `json:"device_version"`
	PluginVersion     string                 `json:"plugin_version"`
	WebVersion        string                 `json:"web_version"`
}

type Hive struct {
	Databases []ApacheHiveDatabase `json:"databases"`
}

type ApacheHiveDatabase struct {
	Tables []ApacheHiveTable `json:"tables"`
}

type ApacheHiveTable struct {
	Name       string                   `json:"name"`
	Properties []map[string]interface{} `json:"properties"`
}

type HomeAssistant struct {
	BaseURL          string `json:"base_url"`
	ExternalURL      string `json:"external_url"`
	InstallationType string `json:"installation_type"`
	InternalURL      string `json:"internal_url"`
	LocationName     string `json:"location_name"`
	UUID             string `json:"uuid"`
	Version          string `json:"version"`
}

type Homebridge struct {
	EnableAccessories    bool   `json:"enable_accessories"`
	EnableTerminalAccess bool   `json:"enable_terminal_access"`
	InstanceID           string `json:"instance_id"`
	InstanceName         string `json:"instance_name"`
	NodeVersion          string `json:"node_version"`
	Platform             string `json:"platform"`
	RunningInDocker      bool   `json:"running_in_docker"`
	RunningInLinux       bool   `json:"running_in_linux"`
	ServiceMode          bool   `json:"service_mode"`
	UIPackageName        string `json:"ui_package_name"`
	UIPackageVersion     string `json:"ui_package_version"`
}

type HomematicCCU struct {
	HardwareModel string `json:"hardware_model"`
	Series        string `json:"series"`
	Version       string `json:"version"`
}

type HOOBS struct {
	Bridge HOOBSBridge `json:"bridge"`
	Client HOOBSClient `json:"client"`
	Server HOOBSServer `json:"server"`
}

type HOOBSBridge struct {
	Name     string `json:"name"`
	Pin      string `json:"pin"`
	Port     int    `json:"port"`
	Username string `json:"username"`
}

type HOOBSClient struct {
	CountryCode string `json:"country_code"`
	PostalCode  string `json:"postal_code"`
}

type HOOBSServer struct {
	ApplicationPath   string `json:"application_path"`
	ConfigurationPath string `json:"configuration_path"`
	GlobalModulesPath string `json:"global_modules_path"`
	HomeSetupID       string `json:"home_setup_id"`
	HOOBSVersion      string `json:"hoobs_version"`
	LocalModulesPath  string `json:"local_modules_path"`
	NodeVersion       string `json:"node_version"`
	Port              int    `json:"port"`
}

type HPPrinterEmbeddedWebServer struct {
	FirmwareDownloadID            string                    `json:"firmware_download_id"`
	MakeAndModel                  string                    `json:"make_and_model"`
	MakeAndModelBase              string                    `json:"make_and_model_base"`
	MakeAndModelFamily            string                    `json:"make_and_model_family"`
	NetworkSummary                map[string]NetworkSummary `json:"network_summary"`
	PasswordStatus                string                    `json:"password_status"`
	ProductDerivativeFlavorStatus string                    `json:"product_derivative_flavor_status"`
	ProductDerivativeNumber       string                    `json:"product_derivative_number"`
	ProductNumber                 string                    `json:"product_number"`
	Revision                      string                    `json:"revision"`
	SerialNumber                  string                    `json:"serial_number"`
	ServiceID                     string                    `json:"service_id"`
	SKUIdentifier                 string                    `json:"sku_identifier"`
	UUID                          string                    `json:"uuid"`
	VersionDate                   string                    `json:"version_date"`
	WOOBESeriesID                 string                    `json:"woobeseries_id"`
}

type NetworkSummary struct {
	AdminDisabled              string `json:"admin_disabled"`
	DeviceConnectivityPortType string `json:"device_connectivity_port_type"`
	IsConnected                string `json:"is_connected"`
	IsCurrentRequestInterface  string `json:"is_current_request_interface"`
	Name                       string `json:"name"`
	Power                      string `json:"power"`
}

type HPIlo struct {
	CUUID           string     `json:"cuuid"`
	ILOFirmware     string     `json:"ilo_firmware"`
	ILOSerialNumber string     `json:"ilo_serial_number"`
	ILOType         string     `json:"ilo_type"`
	ILOUUID         string     `json:"ilo_uuid"`
	NICs            []HPIloNic `json:"nics"`
	ProductID       string     `json:"product_id"`
	SerialNumber    string     `json:"serial_number"`
	ServerType      string     `json:"server_type"`
	UUID            string     `json:"uuid"`
}

type HPIloNic struct {
	Description string `json:"description"`
	IPAddress   string `json:"ip_address"`
	Location    string `json:"location"`
	MACAddress  string `json:"mac_address"`
	Port        string `json:"port"`
	Status      string `json:"status"`
}

type HPEOneView struct {
	CurrentVersion string `json:"current_version"`
	MinimumVersion string `json:"minimum_version"`
}

type HTTP struct {
	Components      map[string]HTTPComponent `json:"components"`
	DOMHash         int                      `json:"dom_hash"`
	Favicon         HTTPFavicon              `json:"favicon"`
	HeadersHash     int                      `json:"headers_hash"`
	Host            string                   `json:"host"`
	HTML            string                   `json:"html"`
	HTMLHash        int                      `json:"html_hash"`
	Location        string                   `json:"location"`
	Redirects       []HTTPRedirect           `json:"redirects"`
	Robots          string                   `json:"robots"`
	RobotsHash      int                      `json:"robots_hash"`
	SecurityTXT     string                   `json:"securitytxt"`
	SecurityTXTHash int                      `json:"securitytxt_hash"`
	Server          string                   `json:"server"`
	ServerHash      int                      `json:"server_hash"`
	Sitemap         string                   `json:"sitemap"`
	SitemapHash     int                      `json:"sitemap_hash"`
	Status          int                      `json:"status"`
	Title           string                   `json:"title"`
	TitleHash       int                      `json:"title_hash"`
	WAF             string                   `json:"waf"`
}

type HTTPComponent struct {
	Categories []string `json:"categories"`
}

type HTTPFavicon struct {
	Data     string `json:"data"`
	Hash     int    `json:"hash"`
	Location string `json:"location"`
}

type HTTPRedirect struct {
	Data     string `json:"data"`
	Host     string `json:"host"`
	Location string `json:"location"`
}

type Hubitat struct {
	HardwareVersion string `json:"hardware_version"`
	HubUID          string `json:"hub_uid"`
	IPAddress       string `json:"ip_address"`
	MACAddress      string `json:"mac_address"`
	Version         string `json:"version"`
}

type IBMDb2 struct {
	DB2Version     string `json:"db2_version"`
	ExternalName   string `json:"external_name"`
	InstanceName   string `json:"instance_name"`
	ServerPlatform string `json:"server_platform"`
}

type InfluxDB struct {
	BindAddress     string   `json:"bind_address"`
	Build           string   `json:"build"`
	Databases       []string `json:"databases"`
	GoArch          string   `json:"go_arch"`
	GoMaxProcs      int      `json:"go_max_procs"`
	GoOS            string   `json:"go_os"`
	GoVersion       string   `json:"go_version"`
	NetworkHostname string   `json:"network_hostname"`
	Uptime          string   `json:"uptime"`
	Version         string   `json:"version"`
}

type IPCamera struct {
	AliasName       string `json:"alias_name"`
	AppVersion      string `json:"app_version"`
	Brand           string `json:"brand"`
	Build           string `json:"build"`
	ClientVersion   string `json:"client_version"`
	DDNShost        string `json:"ddns_host"`
	HardwareVersion string `json:"hardware_version"`
	ID              string `json:"id"`
	IPAddress       string `json:"ip_address"`
	MACAddress      string `json:"mac_address"`
	Model           string `json:"model"`
	Name            string `json:"name"`
	Product         string `json:"product"`
	ServerVersion   string `json:"server_version"`
	SoftwareVersion string `json:"software_version"`
	SystemVersion   string `json:"system_version"`
	Version         string `json:"version"`
}

type IPSymcon struct {
	APIVersion string          `json:"api_version"`
	Houses     []IPSymconHouse `json:"houses"`
	Version    string          `json:"version"`
}

type IPSymconHouse struct {
	Name     string `json:"name"`
	Password bool   `json:"password"`
}

type IPMI struct {
	Level        []string `json:"level"`
	OEMID        int      `json:"oemid"`
	PasswordAuth []string `json:"password_auth"`
	UserAuth     []string `json:"user_auth"`
	Version      string   `json:"version"`
}

type IPPCUPS struct {
	Printers      []IPPCUPSPrinter `json:"printers"`
	StatusMessage string           `json:"status_message"`
}

type IPPCUPSPrinter struct {
	AuthenticationType string `json:"authentication_type"`
	DNSSDName          string `json:"dns_sd_name"`
	Info               string `json:"info"`
	MakeAndModel       string `json:"make_and_model"`
	Name               string `json:"name"`
	URISupported       string `json:"uri_supported"`
}

type ISAKMP struct {
	Aggressive   ISAKMPAggressive `json:"aggressive"`
	ExchangeType int              `json:"exchange_type"`
	Flags        ISAKMPFlags      `json:"flags"`
	InitiatorSPI string           `json:"initiator_spi"`
	Length       int              `json:"length"`
	MsgID        string           `json:"msg_id"`
	NextPayload  int              `json:"next_payload"`
	ResponderSPI string           `json:"responder_spi"`
	VendorIDs    []string         `json:"vendor_ids"`
	Version      string           `json:"version"`
}

type ISAKMPAggressive struct {
	// Define fields if needed
}

type ISAKMPFlags struct {
	Authentication bool `json:"authentication"`
	Commit         bool `json:"commit"`
	Encryption     bool `json:"encryption"`
}

type ISCSI struct {
	Targets []ISCSITarget `json:"targets"`
}

type ISCSITarget struct {
	Addresses   []string `json:"addresses"`
	AuthEnabled bool     `json:"auth_enabled"`
	AuthError   string   `json:"auth_error"`
	Name        string   `json:"name"`
}

type Kafka struct {
	Brokers []KafkaBroker `json:"brokers"`
	Hosts   []KafkaHost   `json:"hosts"`
	Topics  []string      `json:"topics"`
}

type KafkaBroker struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Port int    `json:"port"`
	Rack string `json:"rack"`
}

type KafkaHost struct {
	Name string `json:"name"`
	Port int    `json:"port"`
}

type KNX struct {
	Device            KNXDevice   `json:"device"`
	SupportedServices KNXServices `json:"supported_services"`
}

type KNXDevice struct {
	FriendlyName     string `json:"friendly_name"`
	KNXAddress       string `json:"knx_address"`
	MAC              string `json:"mac"`
	MulticastAddress string `json:"multicast_address"`
	Serial           string `json:"serial"`
}

type KNXServices struct {
	Core             string `json:"core"`
	DeviceManagement string `json:"device_management"`
	Routing          string `json:"routing"`
	Tunneling        string `json:"tunneling"`
}

type Kubernetes struct {
	BuildDate string           `json:"build_date"`
	GoVersion string           `json:"go_version"`
	Nodes     []KubernetesNode `json:"nodes"`
	Platform  string           `json:"platform"`
	Version   string           `json:"version"`
}

type KubernetesNode struct {
	Containers []KubernetesContainer `json:"containers"`
	Name       string                `json:"name"`
}

type KubernetesContainer struct {
	Image string `json:"image"`
	Name  string `json:"name"`
}

type KyoceraPrinterPanel struct {
	FirmwareVersion string `json:"firmware_version"`
	PrinterModel    string `json:"printer_model"`
}

type MPD struct {
	Albums     string   `json:"albums"`
	Artists    string   `json:"artists"`
	DBPlaytime string   `json:"db_playtime"`
	DBUpdate   string   `json:"db_update"`
	MimeType   []string `json:"mime_type"`
	Playtime   string   `json:"playtime"`
	Plugin     []string `json:"plugin"`
	Songs      string   `json:"songs"`
	Suffix     []string `json:"suffix"`
	Uptime     string   `json:"uptime"`
}

type Lantronix struct {
	Gateway  string `json:"gateway"`
	IP       string `json:"ip"`
	MAC      string `json:"mac"`
	Password string `json:"password"`
	Type     string `json:"type"`
	Version  string `json:"version"`
}

type LDAP struct {
	AltServer                     interface{} `json:"altServer"` // Could be string or array
	ConfigurationNamingContext    interface{} `json:"configurationNamingContext"`
	CurrentTime                   interface{} `json:"currentTime"`
	Currenttime                   interface{} `json:"currenttime"`
	DNSHostName                   interface{} `json:"dNSHostName"`
	DefaultNamingContext          interface{} `json:"defaultNamingContext"`
	DnsHostName                   interface{} `json:"dnsHostName"`
	DomainControllerFunctionality interface{} `json:"domainControllerFunctionality"`
	DomainFunctionality           interface{} `json:"domainFunctionality"`
	DsServiceName                 interface{} `json:"dsServiceName"`
	ErrorMessage                  string      `json:"errorMessage"`
	ForestFunctionality           interface{} `json:"forestFunctionality"`
	HighestCommittedUSN           interface{} `json:"highestCommittedUSN"`
	IsGlobalCatalogReady          interface{} `json:"isGlobalCatalogReady"`
	IsSynchronized                interface{} `json:"isSynchronized"`
	LdapServiceName               interface{} `json:"ldapServiceName"`
	NamingContexts                interface{} `json:"namingContexts"`
	Namingcontexts                interface{} `json:"namingcontexts"`
	ObjectClass                   interface{} `json:"objectClass"`
	ResultCode                    string      `json:"resultCode"`
	RootDomainNamingContext       interface{} `json:"rootDomainNamingContext"`
	SchemaNamingContext           interface{} `json:"schemaNamingContext"`
	ServerName                    interface{} `json:"serverName"`
	SubSchemaSubEntry             interface{} `json:"subSchemaSubEntry"`
	SupportedCapabilities         interface{} `json:"supportedCapabilities"`
	SupportedControl              interface{} `json:"supportedControl"`
	SupportedExtension            interface{} `json:"supportedExtension"`
	SupportedLDAPPolicies         interface{} `json:"supportedLDAPPolicies"`
	SupportedLDAPVersion          interface{} `json:"supportedLDAPVersion"`
	SupportedLDAPversion          interface{} `json:"supportedLDAPversion"`
	SupportedLdapVersion          interface{} `json:"supportedLdapVersion"`
	SupportedSASLMechanisms       interface{} `json:"supportedSASLMechanisms"`
	Supportedcontrol              interface{} `json:"supportedcontrol"`
	Supportedextension            interface{} `json:"supportedextension"`
	Supportedldapversion          interface{} `json:"supportedldapversion"`
	Supportedsaslmechanisms       interface{} `json:"supportedsaslmechanisms"`
}

type LitecoinNode struct {
	ProtocolVersion int    `json:"protocol_version"`
	UserAgent       string `json:"user_agent"`
}

type MDNS struct {
	Additionals map[string]interface{} `json:"additionals"`
	Answers     map[string]interface{} `json:"answers"`
	Authorities map[string]interface{} `json:"authorities"`
	Services    map[string]MDNSService `json:"services"`
}

type MDNSService struct {
	IPv4 []string `json:"ipv4"`
	IPv6 []string `json:"ipv6"`
	Name string   `json:"name"`
	Port int      `json:"port"`
	PTR  string   `json:"ptr"`
}

type MicrosoftExchange struct {
	BuildDate   string `json:"build_date"`
	BuildNumber string `json:"build_number"`
	Name        string `json:"name"`
}

type MilesightRouters struct {
	Model   string `json:"model"`
	Version string `json:"version"`
}

type MikrotikRouterOS struct {
	Interfaces []string `json:"interfaces"`
	Version    string   `json:"version"`
}

type MikrotikWinbox struct {
	Index map[string]MikrotikWinboxLib `json:"index"`
	List  map[string]MikrotikWinboxLib `json:"list"`
}

type MikrotikWinboxLib struct {
	CRC     int    `json:"crc"`
	Size    int    `json:"size"`
	Version string `json:"version"`
}

type Milvus struct {
	MilvusURL string `json:"milvus_url"`
	Version   string `json:"version"`
}

type Minecraft struct {
	Brand               string                 `json:"brand"`
	Description         interface{}            `json:"description"` // Could be string, array, or MinecraftDescription
	EnforceSecureChat   bool                   `json:"enforce_secure_chat"`
	EnforcesSecureChat  bool                   `json:"enforcesSecureChat"`
	Favicon             string                 `json:"favicon"`
	ForgeData           map[string]interface{} `json:"forgeData"`
	Gamemode            string                 `json:"gamemode"`
	IsModded            string                 `json:"isModded"`
	LCServer            string                 `json:"lcServer"`
	Map                 string                 `json:"map"`
	Modinfo             map[string]interface{} `json:"modinfo"`
	ModpackData         map[string]interface{} `json:"modpackData"`
	Players             MinecraftPlayers       `json:"players"`
	PreventsChatReports bool                   `json:"preventsChatReports"`
	PreviewsChat        bool                   `json:"previewsChat"`
	Text                string                 `json:"text"`
	Translate           string                 `json:"translate"`
	Version             MinecraftVersion       `json:"version"`
	With                []string               `json:"with"`
}

type MinecraftPlayers struct {
	Max    int               `json:"max"`
	Online int               `json:"online"`
	Sample []MinecraftPlayer `json:"sample"`
}

type MinecraftPlayer struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type MinecraftVersion struct {
	Name     string `json:"name"`
	Protocol int    `json:"protocol"`
}

type MitsubishiQ struct {
	CPU string `json:"cpu"`
}

type MongoDB struct {
	Authentication bool                   `json:"authentication"`
	BuildInfo      map[string]interface{} `json:"buildInfo"`
	ListDatabases  map[string]interface{} `json:"listDatabases"`
	ServerStatus   map[string]interface{} `json:"serverStatus"`
}

type MSRPC struct {
	ActualCount int                   `json:"actual_count"`
	MaxCount    int                   `json:"max_count"`
	NumTowers   int                   `json:"num_towers"`
	Towers      map[string]MSRPCTower `json:"towers"`
}

type MSRPCTower struct {
	Annotation string        `json:"annotation"`
	Bindings   []interface{} `json:"bindings"`
	Version    string        `json:"version"`
}

type MSSQL struct {
	DNSComputerName     string `json:"dns_computer_name"`
	DNSDomainName       string `json:"dns_domain_name"`
	NetBIOSComputerName string `json:"netbios_computer_name"`
	NetBIOSDomainName   string `json:"netbios_domain_name"`
	OSVersion           string `json:"os_version"`
	TargetRealm         string `json:"target_realm"`
	Timestamp           int    `json:"timestamp"`
}

type MSSQLSSRP struct {
	Instances []MSSQLSSRPInstance `json:"instances"`
}

type MSSQLSSRPInstance struct {
	InstanceName string `json:"instance_name"`
	IsClustered  bool   `json:"is_clustered"`
	ServerName   string `json:"server_name"`
	TCP          int    `json:"tcp"`
	Version      string `json:"version"`
	VersionName  string `json:"version_name"`
}

type MQTT struct {
	Code     int           `json:"code"`
	Messages []MQTTMessage `json:"messages"`
}

type MQTTMessage struct {
	Payload string `json:"payload"`
	Topic   string `json:"topic"`
}

type MySQL struct {
	AuthenticationPlugin       string      `json:"authentication_plugin"`
	Capabilities               int         `json:"capabilities"`
	ErrorCode                  int         `json:"error_code"`
	ErrorMessage               string      `json:"error_message"`
	ExtendedServerCapabilities int         `json:"extended_server_capabilities"`
	ProtocolVersion            int         `json:"protocol_version"`
	ServerLanguage             int         `json:"server_language"`
	ServerStatus               interface{} `json:"server_status"` // Could be int or string
	ThreadID                   int         `json:"thread_id"`
	Version                    string      `json:"version"`
}

type MySQLX struct {
	AuthenticationMechanisms []string          `json:"authentication.mechanisms"`
	ClientInteractive        bool              `json:"client.interactive"`
	ClientPwdExpireOK        bool              `json:"client.pwd_expire_ok"`
	Compression              MySQLXCompression `json:"compression"`
	DocFormats               string            `json:"doc.formats"`
	NodeType                 string            `json:"node_type"`
	TLS                      bool              `json:"tls"`
}

type MySQLXCompression struct {
	Algorithm []string `json:"algorithm"`
}

type NATS struct {
	AuthRequired bool     `json:"auth_required"`
	ClientID     int      `json:"client_id"`
	ClientIP     string   `json:"client_ip"`
	Cluster      string   `json:"cluster"`
	ConnectURLs  []string `json:"connect_urls"`
	ConnectionID string   `json:"connection_id"`
	GitCommit    string   `json:"git_commit"`
	Go           string   `json:"go"`
	Headers      bool     `json:"headers"`
	Host         string   `json:"host"`
	IP           string   `json:"ip"`
	Jetstream    bool     `json:"jetstream"`
	LeafnodeURLs []string `json:"leafnode_urls"`
	LNOC         bool     `json:"lnoc"`
	MaxPayload   int      `json:"max_payload"`
	Nonce        string   `json:"nonce"`
	Port         int      `json:"port"`
	Proto        int      `json:"proto"`
	ServerID     string   `json:"server_id"`
	ServerName   string   `json:"server_name"`
	TLSRequired  bool     `json:"tls_required"`
	TLSVerify    bool     `json:"tls_verify"`
	Version      string   `json:"version"`
	XKey         string   `json:"xkey"`
}

type NDMP struct {
	Devices []NDMPDevice `json:"devices"`
}

type NDMPDevice struct {
	FSLogicalDevice  string `json:"fs_logical_device"`
	FSPhysicalDevice string `json:"fs_physical_device"`
	FSType           string `json:"fs_type"`
}

type Neo4jBrowser struct {
	BuildNumber string `json:"build_number"`
	BuiltAt     string `json:"built_at"`
	Version     string `json:"version"`
}

type NetBIOS struct {
	MAC        string         `json:"mac"`
	Names      []NetBIOSShare `json:"names"`
	Networks   []string       `json:"networks"`
	Raw        []string       `json:"raw"`
	ServerName string         `json:"server_name"`
	Username   string         `json:"username"`
}

type NetBIOSShare struct {
	Flags  int    `json:"flags"`
	Name   string `json:"name"`
	Suffix int    `json:"suffix"`
}

type Netdata struct {
	Release string `json:"release"`
	Version string `json:"version"`
}

type Netgear struct {
	Description       string `json:"description"`
	FirewallVersion   string `json:"firewall_version"`
	FirmwareVersion   string `json:"firmware_version"`
	FirstUseDate      string `json:"first_use_date"`
	ModelName         string `json:"model_name"`
	SerialNumber      string `json:"serial_number"`
	SmartagentVersion string `json:"smartagent_version"`
	VPNVersion        string `json:"vpn_version"`
}

type NMEA struct {
	GPGGA NMEAStatus `json:"gpgga"`
	GPRMC NMEAStatus `json:"gprmc"`
}

type NMEAStatus struct {
	Altitude           string  `json:"altitude"`
	CourseOverGround   string  `json:"course_over_ground"`
	Date               string  `json:"date"`
	FixQuality         string  `json:"fix_quality"`
	HDOP               string  `json:"hdop"`
	HeightOfGeoid      string  `json:"height_of_geoid"`
	Latitude           float64 `json:"latitude"`
	Longitude          float64 `json:"longitude"`
	NumberOfSatellites string  `json:"number_of_satellites"`
	SpeedOverGround    string  `json:"speed_over_ground"`
	Status             string  `json:"status"`
	Time               string  `json:"time"`
}

type NodeExporter struct {
	WindowsCSHostname        map[string]interface{} `json:"windows_cs_hostname"`
	WindowsExporterBuildInfo map[string]interface{} `json:"windows_exporter_build_info"`
	WindowsOSInfo            map[string]interface{} `json:"windows_os_info"`
}

type NSQ struct {
	AuthRequired        bool `json:"auth_required"`
	Deflate             bool `json:"deflate"`
	DeflateLevel        int  `json:"deflate_level"`
	MaxDeflateLevel     int  `json:"max_deflate_level"`
	MaxMsgTimeout       int  `json:"max_msg_timeout"`
	MaxRdyCount         int  `json:"max_rdy_count"`
	MsgTimeout          int  `json:"msg_timeout"`
	OutputBufferSize    int  `json:"output_buffer_size"`
	OutputBufferTimeout int  `json:"output_buffer_timeout"`
	SampleRate          int  `json:"sample_rate"`
	Snappy              bool `json:"snappy"`
	TLSV1               bool `json:"tls_v1"`
}

type NTLM struct {
	DNSDomainName       string   `json:"dns_domain_name"`
	DNSForestName       string   `json:"dns_forest_name"`
	FQDN                string   `json:"fqdn"`
	NetBIOSComputerName string   `json:"netbios_computer_name"`
	NetBIOSDomainName   string   `json:"netbios_domain_name"`
	OS                  []string `json:"os"`
	OSBuild             string   `json:"os_build"`
	TargetRealm         string   `json:"target_realm"`
	Timestamp           int      `json:"timestamp"`
}

type NTP struct {
	ClkJitter      interface{} `json:"clk_jitter"` // Could be number or string
	ClkWander      interface{} `json:"clk_wander"`
	Clock          string      `json:"clock"`
	ClockOffset    float64     `json:"clock_offset"`
	Delay          float64     `json:"delay"`
	Frequency      interface{} `json:"frequency"`
	Jitter         interface{} `json:"jitter"`
	Leap           interface{} `json:"leap"` // Could be int or string
	Mintc          int         `json:"mintc"`
	Monlist        NTPMonlist  `json:"monlist"`
	Noise          interface{} `json:"noise"`
	Offset         interface{} `json:"offset"`
	Peer           interface{} `json:"peer"` // Could be int or string
	Phase          int         `json:"phase"`
	Poll           interface{} `json:"poll"` // Could be int or string
	Precision      int         `json:"precision"`
	Processor      string      `json:"processor"`
	Refid          string      `json:"refid"`
	Reftime        string      `json:"reftime"`
	RootDelay      interface{} `json:"root_delay"` // Could be number or string
	RootDispersion interface{} `json:"root_dispersion"`
	Rootdelay      interface{} `json:"rootdelay"`
	Rootdisp       interface{} `json:"rootdisp"`
	Stability      interface{} `json:"stability"`
	State          int         `json:"state"`
	Stratum        int         `json:"stratum"`
	SysJitter      interface{} `json:"sys_jitter"`
	System         string      `json:"system"`
	TAI            interface{} `json:"tai"` // Could be int or string
	TC             int         `json:"tc"`
	Version        string      `json:"version"`
}

type NTPMonlist struct {
	Connections []string `json:"connections"`
	More        bool     `json:"more"`
}

type NTRIP struct {
	NetworkRecord []NTRIPNetworkRecord `json:"network_record"`
	NTRIPVersion  string               `json:"ntrip_version"`
	Server        string               `json:"server"`
}

type NTRIPNetworkRecord struct {
	Authentication    string   `json:"authentication"`
	Bitrate           string   `json:"bitrate"`
	Carrier           string   `json:"carrier"`
	Country           string   `json:"country"`
	Fee               string   `json:"fee"`
	Format            string   `json:"format"`
	FormatDetails     string   `json:"format_details"`
	Generator         string   `json:"generator"`
	Latitude          string   `json:"latitude"`
	Longitude         string   `json:"longitude"`
	Mountpoint        string   `json:"mountpoint"`
	NavigationSystems []string `json:"navigation_systems"`
	Network           string   `json:"network"`
	NMEA              bool     `json:"nmea"`
	Solution          bool     `json:"solution"`
	Type              string   `json:"type"`
}

type OpenDir struct {
	Data       map[string]FileInfo `json:"data"`
	Extensions []string            `json:"extensions"`
	Hash       int                 `json:"hash"`
}

type FileInfo struct {
	Size      int    `json:"size"`
	Timestamp string `json:"timestamp"`
}

type OpenFlow struct {
	SupportedVersions interface{} `json:"supported_versions"` // Could be string or array
	Version           string      `json:"version"`
}

type OpenHAB struct {
	Build   string `json:"build"`
	Version string `json:"version"`
}

type OpenWebNet struct {
	DateAndTime         string            `json:"date_and_time"`
	DeviceType          string            `json:"device_type"`
	DistributionVersion string            `json:"distribution_version"`
	FirmwareVersion     string            `json:"firmware_version"`
	IPAddress           string            `json:"ip_address"`
	KernelVersion       string            `json:"kernel_version"`
	MACAddress          string            `json:"mac_address"`
	NetMask             string            `json:"net_mask"`
	Systems             OpenWebNetSystems `json:"systems"`
	Uptime              string            `json:"uptime"`
}

type OpenWebNetSystems struct {
	Automation      int `json:"automation"`
	BurglarAlarm    int `json:"burglar_alarm"`
	Heating         int `json:"heating"`
	Lighting        int `json:"lighting"`
	PowerManagement int `json:"power_management"`
}

type OracleTNSListener struct {
	Description OracleTNSListenerDescription `json:"description"`
	Versions    map[string]interface{}       `json:"versions"`
}

type OracleTNSListenerDescription struct {
	Err        int                    `json:"err"`
	ErrorStack map[string]interface{} `json:"error_stack"`
	VSNNum     int                    `json:"vsnnum"`
}

type PCWorx struct {
	FirmwareDate    string `json:"firmware_date"`
	FirmwareTime    string `json:"firmware_time"`
	FirmwareVersion string `json:"firmware_version"`
	ModelNumber     string `json:"model_number"`
	PLCType         string `json:"plc_type"`
}

type PhilipsHue struct {
	APIVersion       string `json:"api_version"`
	BridgeID         string `json:"bridge_id"`
	DataStoreVersion string `json:"data_store_version"`
	FactoryNew       bool   `json:"factory_new"`
	MAC              string `json:"mac"`
	ModelID          string `json:"model_id"`
	Name             string `json:"name"`
	SWVersion        string `json:"sw_version"`
}

type Plex struct {
	MachineIdentifier string `json:"machine_identifier"`
	Version           string `json:"version"`
}

type PPTP struct {
	Firmware string `json:"firmware"`
	Hostname string `json:"hostname"`
	Vendor   string `json:"vendor"`
}

type PQube3PowerAnalyzers struct {
	Firmware  string `json:"firmware"`
	Frequency string `json:"frequency"`
	IP        string `json:"ip"`
	Model     string `json:"model"`
	Serial    string `json:"serial"`
	Uptime    string `json:"uptime"`
}

type QuestDB struct {
	JDKVersion string   `json:"jdk_version"`
	OS         string   `json:"os"`
	ReadOnly   bool     `json:"read_only"`
	Tables     []string `json:"tables"`
	Version    string   `json:"version"`
}

type QNAP struct {
	Apps     map[string]QNAPStationInfo `json:"apps"`
	Firmware QNAPFirmware               `json:"firmware"`
	Hostname string                     `json:"hostname"`
	Model    QNAPModel                  `json:"model"`
}

type QNAPStationInfo struct {
	Build    string `json:"build"`
	Checksum string `json:"checksum"`
	Version  string `json:"version"`
}

type QNAPFirmware struct {
	Build   string `json:"build"`
	Number  string `json:"number"`
	Patch   string `json:"patch"`
	Version string `json:"version"`
}

type QNAPModel struct {
	CustomModelName   string `json:"custom_model_name"`
	DisplayModelName  string `json:"display_model_name"`
	InternalModelName string `json:"internal_model_name"`
	ModelName         string `json:"model_name"`
	Platform          string `json:"platform"`
	PlatformEx        string `json:"platform_ex"`
	ProjectName       string `json:"project_name"`
}

type RaspberryShake struct {
	CPUTemp       string                 `json:"cpu_temp"`
	Diskspace     map[string]interface{} `json:"diskspace"`
	Elevation     string                 `json:"elevation"`
	EthIP         string                 `json:"eth_ip"`
	Lat           string                 `json:"lat"`
	Long          string                 `json:"long"`
	MAC           string                 `json:"mac"`
	Model         string                 `json:"model"`
	ODFVersion    string                 `json:"odf_version"`
	ShakeModel    string                 `json:"shake_model"`
	SystemVersion string                 `json:"system_version"`
	Uptime        map[string]interface{} `json:"uptime"`
}

type RDPEncryption struct {
	Levels    []string `json:"levels"`
	Methods   []string `json:"methods"`
	Protocols []string `json:"protocols"`
}

type Realport struct {
	Name  string `json:"name"`
	Ports int    `json:"ports"`
}

type Redis struct {
	Clients     []map[string]interface{} `json:"clients"`
	Cluster     map[string]interface{}   `json:"cluster"`
	CPU         map[string]interface{}   `json:"cpu"`
	ErrorStats  map[string]interface{}   `json:"errorstats"`
	Keys        RedisKeys                `json:"keys"`
	Keyspace    map[string]interface{}   `json:"keyspace"`
	Memory      map[string]interface{}   `json:"memory"`
	Modules     map[string]interface{}   `json:"modules"`
	OK          map[string]interface{}   `json:"ok"`
	Persistence map[string]interface{}   `json:"persistence"`
	Replication map[string]interface{}   `json:"replication"`
	Server      map[string]interface{}   `json:"server"`
	SSL         map[string]interface{}   `json:"ssl"`
	Stats       map[string]interface{}   `json:"stats"`
}

type RedisKeys struct {
	Data []string `json:"data"`
	More bool     `json:"more"`
}

type RIP struct {
	Addresses []RIPAddress      `json:"addresses"`
	Auth      RIPAuthentication `json:"auth"`
	Command   int               `json:"command"`
	Version   int               `json:"version"`
}

type RIPAddress struct {
	Addr    string `json:"addr"`
	Family  string `json:"family"`
	Metric  int    `json:"metric"`
	NextHop string `json:"next_hop"`
	Subnet  string `json:"subnet"`
	Tag     int    `json:"tag"`
}

type RIPAuthentication struct {
	Password string `json:"password"`
	Type     int    `json:"type"`
}

type Ripple struct {
	Peers []RipplePeer `json:"peers"`
}

type RipplePeer struct {
	CompleteLedgers string `json:"complete_ledgers"`
	IP              string `json:"ip"`
	Port            string `json:"port"`
	PublicKey       string `json:"public_key"`
	Type            string `json:"type"`
	Uptime          int    `json:"uptime"`
	Version         string `json:"version"`
}

type RSync struct {
	Authentication bool                   `json:"authentication"`
	Modules        map[string]interface{} `json:"modules"`
}

type SamsungTV struct {
	DeviceID         string `json:"device_id"`
	DeviceName       string `json:"device_name"`
	Model            string `json:"model"`
	ModelDescription string `json:"model_description"`
	ModelName        string `json:"model_name"`
	MSFVersion       string `json:"msf_version"`
	SSID             string `json:"ssid"`
	WifiMAC          string `json:"wifi_mac"`
}

type SamsungSyncThruWebService struct {
	AdminEmail   string `json:"admin_email"`
	DeviceName   string `json:"device_name"`
	HostName     string `json:"host_name"`
	Location     string `json:"location"`
	MACAddress   string `json:"mac_address"`
	ModelName    string `json:"model_name"`
	SerialNumber string `json:"serial_number"`
}

type Shelly struct {
	App    string `json:"app"`
	AuthEn bool   `json:"auth_en"`
	FWID   string `json:"fw_id"`
	Gen    int    `json:"gen"`
	ID     string `json:"id"`
	MAC    string `json:"mac"`
	Model  string `json:"model"`
	SSID   string `json:"ssid"`
	Ver    string `json:"ver"`
}

type SiemensS7 struct {
	DSTTSAP    string                       `json:"dst_tsap"`
	Identities map[string]SiemensS7Property `json:"identities"`
	SRCTTSAP   string                       `json:"src_tsap"`
}

type SiemensS7Property struct {
	Raw   string `json:"raw"`
	Value string `json:"value"`
}

type SkyWalking struct {
	Databases []string               `json:"databases"`
	Services  map[string]interface{} `json:"services"`
}

type SMB struct {
	Anonymous    bool      `json:"anonymous"`
	Capabilities []string  `json:"capabilities"`
	OS           string    `json:"os"`
	Raw          []string  `json:"raw"`
	Shares       []SMBItem `json:"shares"`
	SMBVersion   int       `json:"smb_version"`
	Software     string    `json:"software"`
}

type SMBItem struct {
	Comments  string    `json:"comments"`
	Files     []SMBFile `json:"files"`
	Name      string    `json:"name"`
	Special   bool      `json:"special"`
	Temporary bool      `json:"temporary"`
	Type      string    `json:"type"`
}

type SMBFile struct {
	Directory bool   `json:"directory"`
	Name      string `json:"name"`
	ReadOnly  bool   `json:"read-only"`
	Size      int    `json:"size"`
}

type SNMP struct {
	Contact      string `json:"contact"`
	Description  string `json:"description"`
	Location     string `json:"location"`
	Name         string `json:"name"`
	ObjectID     string `json:"objectid"`
	OrDescr      string `json:"ordescr"`
	OrID         string `json:"orid"`
	OrIndex      string `json:"orindex"`
	OrLastChange string `json:"orlastchange"`
	OrUptime     string `json:"oruptime"`
	Services     string `json:"services"`
	Uptime       string `json:"uptime"`
}

type SonicWall struct {
	SerialNumber   string `json:"serial_number"`
	SonicOSVersion string `json:"sonicos_version"`
}

type Sonos struct {
	FriendlyName    string `json:"friendly_name"`
	HardwareVersion string `json:"hardware_version"`
	MACAddress      string `json:"mac_address"`
	ModelName       string `json:"model_name"`
	Raw             string `json:"raw"`
	RoomName        string `json:"room_name"`
	SerialNumber    string `json:"serial_number"`
	SoftwareVersion string `json:"software_version"`
	UDN             string `json:"udn"`
}

type SonyBravia struct {
	InterfaceVersion string `json:"interface_version"`
	MACAddress       string `json:"mac_address"`
	ModelName        string `json:"model_name"`
}

type SpotifyConnect struct {
	ActiveUser       string `json:"active_user"`
	BrandDisplayName string `json:"brand_display_name"`
	ClientID         string `json:"client_id"`
	DeviceID         string `json:"device_id"`
	DeviceType       string `json:"device_type"`
	LibraryVersion   string `json:"library_version"`
	ModelDisplayName string `json:"model_display_name"`
	PublicKey        string `json:"public_key"`
	RemoteName       string `json:"remote_name"`
	Scope            string `json:"scope"`
	Version          string `json:"version"`
}

type SSH struct {
	Cipher      string         `json:"cipher"`
	Fingerprint string         `json:"fingerprint"`
	HASSH       string         `json:"hassh"`
	KEX         SSHKeyExchange `json:"kex"`
	Key         string         `json:"key"`
	MAC         string         `json:"mac"`
	Type        string         `json:"type"`
}

type SSHKeyExchange struct {
	CompressionAlgorithms   []string `json:"compression_algorithms"`
	EncryptionAlgorithms    []string `json:"encryption_algorithms"`
	KEXAlgorithms           []string `json:"kex_algorithms"`
	KEXFollows              bool     `json:"kex_follows"`
	Languages               []string `json:"languages"`
	MACAlgorithms           []string `json:"mac_algorithms"`
	ServerHostKeyAlgorithms []string `json:"server_host_key_algorithms"`
	Unused                  int      `json:"unused"`
}

type SSL struct {
	AcceptableCAs   []SSLCAs        `json:"acceptable_cas"`
	ALPN            []string        `json:"alpn"`
	Cert            SSLCertificate  `json:"cert"`
	Chain           []string        `json:"chain"`
	ChainSHA256     []string        `json:"chain_sha256"`
	Cipher          SSLCipher       `json:"cipher"`
	DHParams        SSLDHParams     `json:"dhparams"`
	HandshakeStates []string        `json:"handshake_states"`
	JA3S            string          `json:"ja3s"`
	JARM            string          `json:"jarm"`
	OCSP            interface{}     `json:"ocsp"` // Could be SSLOCSP or object
	TLSExt          []SSLExtension  `json:"tlsext"`
	Trust           SSLBrowserTrust `json:"trust"`
	Unstable        []string        `json:"unstable"`
	Versions        []string        `json:"versions"`
}

type SSLCAs struct {
	Components map[string]interface{} `json:"components"`
	Hash       int                    `json:"hash"`
	Raw        string                 `json:"raw"`
}

type SSLCertificate struct {
	Expired     bool                      `json:"expired"`
	Expires     string                    `json:"expires"`
	Extensions  []SSLCertificateExtension `json:"extensions"`
	Fingerprint SSLCertificateFingerprint `json:"fingerprint"`
	Issued      string                    `json:"issued"`
	Issuer      map[string]interface{}    `json:"issuer"`
	Serial      int                       `json:"serial"`
	SigAlg      string                    `json:"sig_alg"`
	Subject     map[string]interface{}    `json:"subject"`
	Version     int                       `json:"version"`
}

type SSLCertificateExtension struct {
	Critical bool   `json:"critical"`
	Data     string `json:"data"`
	Name     string `json:"name"`
}

type SSLCertificateFingerprint struct {
	SHA1   string `json:"sha1"`
	SHA256 string `json:"sha256"`
}

type SSLCipher struct {
	Bits    int    `json:"bits"`
	Name    string `json:"name"`
	Version string `json:"version"`
}

type SSLDHParams struct {
	Bits        int         `json:"bits"`
	Fingerprint string      `json:"fingerprint"`
	Generator   interface{} `json:"generator"` // Could be int or string
	Prime       string      `json:"prime"`
	PublicKey   string      `json:"public_key"`
}

type SSLExtension struct {
	ID   interface{} `json:"id"` // Could be string or int
	Name string      `json:"name"`
}

type SSLBrowserTrust struct {
	Browser SSLBrowserTrustVendor `json:"browser"`
	Revoked interface{}           `json:"revoked"` // Could be bool or object
}

type SSLBrowserTrustVendor struct {
	Apple     bool `json:"apple"`
	Microsoft bool `json:"microsoft"`
	Mozilla   bool `json:"mozilla"`
}

type SteamA2S struct {
	Address     string `json:"address"`
	AppID       int    `json:"app_id"`
	Bots        int    `json:"bots"`
	ClientDLL   int    `json:"client_dll"`
	Folder      string `json:"folder"`
	Game        string `json:"game"`
	GamePort    int    `json:"game_port"`
	IsMod       int    `json:"is_mod"`
	Map         string `json:"map"`
	MaxPlayers  int    `json:"max_players"`
	ModSize     int    `json:"mod_size"`
	ModVersion  int    `json:"mod_version"`
	Name        string `json:"name"`
	OS          string `json:"os"`
	Password    int    `json:"password"`
	Players     int    `json:"players"`
	Protocol    int    `json:"protocol"`
	Secure      int    `json:"secure"`
	ServerOnly  int    `json:"server_only"`
	ServerType  string `json:"server_type"`
	SpecName    string `json:"spec_name"`
	SpecPort    int    `json:"spec_port"`
	SteamID     int    `json:"steam_id"`
	Tags        string `json:"tags"`
	URLDownload string `json:"url_download"`
	URLInfo     string `json:"url_info"`
	Version     string `json:"version"`
	Visibility  int    `json:"visibility"`
}

type SteamIHS struct {
	ClientID        string         `json:"client_id"`
	ConnectPort     int            `json:"connect_port"`
	EnabledServices int            `json:"enabled_services"`
	EUniverse       int            `json:"euniverse"`
	Hostname        string         `json:"hostname"`
	InstanceID      string         `json:"instance_id"`
	IPAddresses     []string       `json:"ip_addresses"`
	Is64Bit         bool           `json:"is_64bit"`
	MACAddresses    []string       `json:"mac_addresses"`
	MinVersion      int            `json:"min_version"`
	OSType          int            `json:"os_type"`
	PublicIPAddress string         `json:"public_ip_address"`
	Timestamp       int            `json:"timestamp"`
	Users           []SteamIHSUser `json:"users"`
	Version         int            `json:"version"`
}

type SteamIHSUser struct {
	AuthKeyID int    `json:"auth_key_id"`
	SteamID   string `json:"steam_id"`
}

type STUN struct {
	ServerIP string `json:"server_ip"`
	Software string `json:"software"`
}

type Superset struct {
	Name string `json:"name"`
	Node string `json:"node"`
	NPM  string `json:"npm"`
}

type Synology struct {
	CustomLoginTitle  string `json:"custom_login_title"`
	Hostname          string `json:"hostname"`
	LoginWelcomeMsg   string `json:"login_welcome_msg"`
	LoginWelcomeTitle string `json:"login_welcome_title"`
	Version           string `json:"version"`
}

type SynologyDSM struct {
	CustomLoginTitle  string `json:"custom_login_title"`
	Hostname          string `json:"hostname"`
	LoginWelcomeMsg   string `json:"login_welcome_msg"`
	LoginWelcomeTitle string `json:"login_welcome_title"`
	Version           string `json:"version"`
}

type SynologySRM struct {
	CustomLoginTitle  string `json:"custom_login_title"`
	Hostname          string `json:"hostname"`
	LoginWelcomeMsg   string `json:"login_welcome_msg"`
	LoginWelcomeTitle string `json:"login_welcome_title"`
	Version           string `json:"version"`
}

type TACACS struct {
	Flags    int    `json:"flags"`
	Length   int    `json:"length"`
	Sequence int    `json:"sequence"`
	Session  int    `json:"session"`
	Type     int    `json:"type"`
	Version  string `json:"version"`
}

type Tasmota struct {
	Firmware      TasmotaFirmware `json:"firmware"`
	FriendlyNames interface{}     `json:"friendly_names"` // Could be string or array
	Module        string          `json:"module"`
	Network       TasmotaNetwork  `json:"network"`
	Wifi          TasmotaWifi     `json:"wifi"`
}

type TasmotaFirmware struct {
	BuildDate string `json:"build_date"`
	Core      string `json:"core"`
	SDK       string `json:"sdk"`
	Version   string `json:"version"`
}

type TasmotaNetwork struct {
	Hostname   string `json:"hostname"`
	IPAddress  string `json:"ip_address"`
	MACAddress string `json:"mac_address"`
}

type TasmotaWifi struct {
	BSSID string `json:"bssid"`
	SSID  string `json:"ssid"`
}

type Telnet struct {
	Do   []string `json:"do"`
	Dont []string `json:"dont"`
	Will []string `json:"will"`
	Wont []string `json:"wont"`
}

type Tibia struct {
	Map        map[string]interface{} `json:"map"`
	Monsters   map[string]interface{} `json:"monsters"`
	MOTD       map[string]interface{} `json:"motd"`
	NPCs       map[string]interface{} `json:"npcs"`
	Owner      map[string]interface{} `json:"owner"`
	Players    map[string]interface{} `json:"players"`
	Rates      map[string]interface{} `json:"rates"`
	ServerInfo map[string]interface{} `json:"serverinfo"`
}

type TilginABHomeGateway struct {
	ProductName      string `json:"product_name"`
	SoftwareFamily   string `json:"software_family"`
	SoftwareRevision string `json:"software_revision"`
}

type TPLinkKasa struct {
	Alias      string  `json:"alias"`
	DevName    string  `json:"dev_name"`
	DeviceID   string  `json:"device_id"`
	FWID       string  `json:"fw_id"`
	HWID       string  `json:"hw_id"`
	HWVer      string  `json:"hw_ver"`
	Latitude   float64 `json:"latitude"`
	Longitude  float64 `json:"longitude"`
	MACAddress string  `json:"mac_address"`
	Model      string  `json:"model"`
	OEMID      string  `json:"oem_id"`
	SWVer      string  `json:"sw_ver"`
	Type       string  `json:"type"`
}

type TPLinkKasaNew struct {
	DeviceModel       string                 `json:"device_model"`
	DeviceType        string                 `json:"device_type"`
	FactoryDefault    bool                   `json:"factory_default"`
	IsSupportIOTCloud bool                   `json:"is_support_iot_cloud"`
	MAC               string                 `json:"mac"`
	MgtEncryptSchm    map[string]interface{} `json:"mgt_encrypt_schm"`
	OBDSrc            string                 `json:"obd_src"`
	Owner             string                 `json:"owner"`
	ProtocolVersion   int                    `json:"protocol_version"`
}

type TraneTracerSC struct {
	Equipments           []TraneTracerSCEquipment `json:"equipments"`
	HardwareSerialNumber string                   `json:"hardware_serial_number"`
	HardwareType         string                   `json:"hardware_type"`
	KernelVersion        string                   `json:"kernel_version"`
	ProductName          string                   `json:"product_name"`
	ProductVersion       string                   `json:"product_version"`
	ServerBootTime       string                   `json:"server_boot_time"`
	ServerName           string                   `json:"server_name"`
	ServerTime           string                   `json:"server_time"`
	VendorName           string                   `json:"vendor_name"`
}

type TraneTracerSCEquipment struct {
	DeviceName      string `json:"device_name"`
	DisplayName     string `json:"display_name"`
	EquipmentFamily string `json:"equipment_family"`
	EquipmentURI    string `json:"equipment_uri"`
	IsOffline       bool   `json:"is_offline"`
	RoleDocument    string `json:"role_document"`
}

type Ubiquiti struct {
	Hostname string `json:"hostname"`
	IP       string `json:"ip"`
	IPAlt    string `json:"ip_alt"`
	MAC      string `json:"mac"`
	MACAlt   string `json:"mac_alt"`
	Product  string `json:"product"`
	Version  string `json:"version"`
}

type UnitronicsPCOM struct {
	HardwareVersion string  `json:"hardware_version"`
	Model           string  `json:"model"`
	OSBuild         int     `json:"os_build"`
	OSVersion       float64 `json:"os_version"`
	PLCName         string  `json:"plc_name"`
	PLCUniqueID     int     `json:"plc_unique_id"`
	UIDMaster       int     `json:"uid_master"`
}

type UPnP struct {
	DeviceType       string        `json:"device_type"`
	FriendlyName     string        `json:"friendly_name"`
	Manufacturer     string        `json:"manufacturer"`
	ManufacturerURL  string        `json:"manufacturer_url"`
	ModelDescription string        `json:"model_description"`
	ModelName        string        `json:"model_name"`
	ModelNumber      string        `json:"model_number"`
	ModelURL         string        `json:"model_url"`
	PresentationURL  string        `json:"presentation_url"`
	SerialNumber     string        `json:"serial_number"`
	Services         []UPnPService `json:"services"`
	SubDevices       []UPnP        `json:"sub_devices"`
	UDN              string        `json:"udn"`
	UPC              string        `json:"upc"`
}

type UPnPService struct {
	ControlURL  string `json:"control_url"`
	EventSubURL string `json:"event_sub_url"`
	SCPDURL     string `json:"scpdurl"`
	ServiceID   string `json:"service_id"`
	ServiceType string `json:"service_type"`
}

type Vault struct {
	ClockSkewMS                   int          `json:"clock_skew_ms"`
	ClusterID                     string       `json:"cluster_id"`
	ClusterName                   string       `json:"cluster_name"`
	EchoDurationMS                int          `json:"echo_duration_ms"`
	Enterprise                    bool         `json:"enterprise"`
	Initialized                   bool         `json:"initialized"`
	LastWAL                       string       `json:"last_wal"`
	License                       VaultLicense `json:"license"`
	PerformanceStandby            bool         `json:"performance_standby"`
	ReplicationDRMode             string       `json:"replication_dr_mode"`
	ReplicationPerformanceMode    string       `json:"replication_performance_mode"`
	ReplicationPrimaryCanaryAgeMS int          `json:"replication_primary_canary_age_ms"`
	Sealed                        bool         `json:"sealed"`
	ServerTimeUTC                 int          `json:"server_time_utc"`
	Standby                       bool         `json:"standby"`
	Version                       string       `json:"version"`
}

type VaultLicense struct {
	ExpiryTime string `json:"expiry_time"`
	State      string `json:"state"`
	Terminated bool   `json:"terminated"`
}

type Vertx struct {
	FirmwareDate    string `json:"firmware_date"`
	FirmwareVersion string `json:"firmware_version"`
	InternalIP      string `json:"internal_ip"`
	MAC             string `json:"mac"`
	Name            string `json:"name"`
	Type            string `json:"type"`
}

type Vespa struct {
	Config  map[string]interface{} `json:"config"`
	Meta    VespaMeta              `json:"meta"`
	Servers []VespaServer          `json:"servers"`
}

type VespaMeta struct {
	Checksum   string `json:"checksum"`
	Date       string `json:"date"`
	Generation int    `json:"generation"`
	Name       string `json:"name"`
	Path       string `json:"path"`
	Timestamp  int    `json:"timestamp"`
	User       string `json:"user"`
}

type VespaServer struct {
	Bundle string `json:"bundle"`
	Class  string `json:"class"`
	ID     string `json:"id"`
}

type VMware struct {
	APIType               string `json:"api_type"`
	APIVersion            string `json:"api_version"`
	Build                 string `json:"build"`
	FullName              string `json:"full_name"`
	InstanceUUID          string `json:"instance_uuid"`
	LicenseProductName    string `json:"license_product_name"`
	LicenseProductVersion string `json:"license_product_version"`
	LocaleBuild           string `json:"locale_build"`
	LocaleVersion         string `json:"locale_version"`
	Name                  string `json:"name"`
	OSType                string `json:"os_type"`
	ProductLineID         string `json:"product_line_id"`
	Vendor                string `json:"vendor"`
	Version               string `json:"version"`
}

type VNC struct {
	Geometry        string                 `json:"geometry"`
	ProtocolVersion string                 `json:"protocol_version"`
	SecurityTypes   map[string]interface{} `json:"security_types"`
	ServerName      string                 `json:"server_name"`
}

type WindowsExporter struct {
	WindowsCSHostname        map[string]interface{} `json:"windows_cs_hostname"`
	WindowsExporterBuildInfo map[string]interface{} `json:"windows_exporter_build_info"`
	WindowsOSInfo            map[string]interface{} `json:"windows_os_info"`
}

type XiaomiMIIO struct {
	DeviceID string `json:"device_id"`
	Token    string `json:"token"`
}

type Yeelight struct {
	FirmwareVersion string `json:"firmware_version"`
	Model           string `json:"model"`
}

type ZeroMQ struct {
	Command     string `json:"command"`
	Mechanism   string `json:"mechanism"`
	Signature   string `json:"signature"`
	SocketType  string `json:"socket_type"`
	ZMTPVersion string `json:"zmtp_version"`
}
