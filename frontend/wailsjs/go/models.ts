export namespace aiqicha {
	
	export class Branch {
	    entName: string;
	    legalPerson: string;
	    startDate: string;
	
	    static createFrom(source: any = {}) {
	        return new Branch(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.entName = source["entName"];
	        this.legalPerson = source["legalPerson"];
	        this.startDate = source["startDate"];
	    }
	}
	export class Copyright {
	    softwareName: string;
	    shortName: string;
	    batchNum: string;
	    softwareType: string;
	    typeCode: string;
	    regDate: string;
	    softwareWork: string;
	    regNo: string;
	    firstDate: string;
	    nationality: string;
	    softId: string;
	    detailUrl: string;
	
	    static createFrom(source: any = {}) {
	        return new Copyright(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.softwareName = source["softwareName"];
	        this.shortName = source["shortName"];
	        this.batchNum = source["batchNum"];
	        this.softwareType = source["softwareType"];
	        this.typeCode = source["typeCode"];
	        this.regDate = source["regDate"];
	        this.softwareWork = source["softwareWork"];
	        this.regNo = source["regNo"];
	        this.firstDate = source["firstDate"];
	        this.nationality = source["nationality"];
	        this.softId = source["softId"];
	        this.detailUrl = source["detailUrl"];
	    }
	}
	export class InvestRecord {
	    pid: string;
	    entName: string;
	    logo: string;
	    logoWord: string;
	    regRate: string;
	    regCapital: string;
	    investment: boolean;
	    yid: string;
	
	    static createFrom(source: any = {}) {
	        return new InvestRecord(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.pid = source["pid"];
	        this.entName = source["entName"];
	        this.logo = source["logo"];
	        this.logoWord = source["logoWord"];
	        this.regRate = source["regRate"];
	        this.regCapital = source["regCapital"];
	        this.investment = source["investment"];
	        this.yid = source["yid"];
	    }
	}
	export class Shareholder {
	    pid: string;
	    name: string;
	    subRate: string;
	    logo: string;
	    logoWord: string;
	    subMoney: string;
	    personLink: string;
	    personId: string;
	    personLogo: string;
	    shareholder: boolean;
	
	    static createFrom(source: any = {}) {
	        return new Shareholder(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.pid = source["pid"];
	        this.name = source["name"];
	        this.subRate = source["subRate"];
	        this.logo = source["logo"];
	        this.logoWord = source["logoWord"];
	        this.subMoney = source["subMoney"];
	        this.personLink = source["personLink"];
	        this.personId = source["personId"];
	        this.personLogo = source["personLogo"];
	        this.shareholder = source["shareholder"];
	    }
	}
	export class Penetration {
	    shareholders: Shareholder[];
	    investRecords: InvestRecord[];
	
	    static createFrom(source: any = {}) {
	        return new Penetration(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.shareholders = this.convertValues(source["shareholders"], Shareholder);
	        this.investRecords = this.convertValues(source["investRecords"], InvestRecord);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class SuggestItem {
	    pid: string;
	    legalPerson: string;
	    resultStr: string;
	    name: string;
	
	    static createFrom(source: any = {}) {
	        return new SuggestItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.pid = source["pid"];
	        this.legalPerson = source["legalPerson"];
	        this.resultStr = source["resultStr"];
	        this.name = source["name"];
	    }
	}

}

export namespace application {
	
	export class Constant {
	    event: event.EventEnum;
	    status: status.StatusEnum;
	    history: history.HistoryEnum;
	    config: config.Config;
	
	    static createFrom(source: any = {}) {
	        return new Constant(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.event = this.convertValues(source["event"], event.EventEnum);
	        this.status = this.convertValues(source["status"], status.StatusEnum);
	        this.history = this.convertValues(source["history"], history.HistoryEnum);
	        this.config = this.convertValues(source["config"], config.Config);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace config {
	
	export class AiQiCha {
	    Cookie: string;
	
	    static createFrom(source: any = {}) {
	        return new AiQiCha(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Cookie = source["Cookie"];
	    }
	}
	export class QueryOnEnter {
	    Assets: boolean;
	    ICP: boolean;
	    IP138: boolean;
	
	    static createFrom(source: any = {}) {
	        return new QueryOnEnter(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Assets = source["Assets"];
	        this.ICP = source["ICP"];
	        this.IP138 = source["IP138"];
	    }
	}
	export class Httpx {
	    Path: string;
	    Flags: string;
	
	    static createFrom(source: any = {}) {
	        return new Httpx(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Path = source["Path"];
	        this.Flags = source["Flags"];
	    }
	}
	export class Wechat {
	    Applet: string;
	    DecompileConcurrency: number;
	    ExtractConcurrency: number;
	    Rules: string[];
	
	    static createFrom(source: any = {}) {
	        return new Wechat(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Applet = source["Applet"];
	        this.DecompileConcurrency = source["DecompileConcurrency"];
	        this.ExtractConcurrency = source["ExtractConcurrency"];
	        this.Rules = source["Rules"];
	    }
	}
	export class TianYanCha {
	    Token: string;
	
	    static createFrom(source: any = {}) {
	        return new TianYanCha(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Token = source["Token"];
	    }
	}
	export class ICP {
	    Timeout: number;
	    Proxy: Proxy;
	    AuthErrorRetryNum1: number;
	    ForbiddenErrorRetryNum1: number;
	    AuthErrorRetryNum2: number;
	    ForbiddenErrorRetryNum2: number;
	    Concurrency: number;
	
	    static createFrom(source: any = {}) {
	        return new ICP(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Timeout = source["Timeout"];
	        this.Proxy = this.convertValues(source["Proxy"], Proxy);
	        this.AuthErrorRetryNum1 = source["AuthErrorRetryNum1"];
	        this.ForbiddenErrorRetryNum1 = source["ForbiddenErrorRetryNum1"];
	        this.AuthErrorRetryNum2 = source["AuthErrorRetryNum2"];
	        this.ForbiddenErrorRetryNum2 = source["ForbiddenErrorRetryNum2"];
	        this.Concurrency = source["Concurrency"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Shodan {
	    Token: string;
	    Interval: number;
	
	    static createFrom(source: any = {}) {
	        return new Shodan(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Token = source["Token"];
	        this.Interval = source["Interval"];
	    }
	}
	export class Zone {
	    Token: string;
	    Interval: number;
	
	    static createFrom(source: any = {}) {
	        return new Zone(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Token = source["Token"];
	        this.Interval = source["Interval"];
	    }
	}
	export class Quake {
	    Token: string;
	    Interval: number;
	
	    static createFrom(source: any = {}) {
	        return new Quake(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Token = source["Token"];
	        this.Interval = source["Interval"];
	    }
	}
	export class Hunter {
	    Token: string;
	    Interval: number;
	
	    static createFrom(source: any = {}) {
	        return new Hunter(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Token = source["Token"];
	        this.Interval = source["Interval"];
	    }
	}
	export class Fofa {
	    Token: string;
	    Interval: number;
	
	    static createFrom(source: any = {}) {
	        return new Fofa(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Token = source["Token"];
	        this.Interval = source["Interval"];
	    }
	}
	export class Proxy {
	    Enable: boolean;
	    Type: string;
	    Host: string;
	    Port: string;
	    User: string;
	    Pass: string;
	
	    static createFrom(source: any = {}) {
	        return new Proxy(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Enable = source["Enable"];
	        this.Type = source["Type"];
	        this.Host = source["Host"];
	        this.Port = source["Port"];
	        this.User = source["User"];
	        this.Pass = source["Pass"];
	    }
	}
	export class Config {
	    Version: string;
	    DatabaseFile: string;
	    WechatDataDir: string;
	    ExportDataDir: string;
	    LogDataDir: string;
	    Timeout: number;
	    Proxy: Proxy;
	    Fofa: Fofa;
	    Hunter: Hunter;
	    Quake: Quake;
	    Zone: Zone;
	    Shodan: Shodan;
	    ICP: ICP;
	    TianYanCha: TianYanCha;
	    AiQiCha: AiQiCha;
	    Wechat: Wechat;
	    Httpx: Httpx;
	    QueryOnEnter: QueryOnEnter;
	
	    static createFrom(source: any = {}) {
	        return new Config(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Version = source["Version"];
	        this.DatabaseFile = source["DatabaseFile"];
	        this.WechatDataDir = source["WechatDataDir"];
	        this.ExportDataDir = source["ExportDataDir"];
	        this.LogDataDir = source["LogDataDir"];
	        this.Timeout = source["Timeout"];
	        this.Proxy = this.convertValues(source["Proxy"], Proxy);
	        this.Fofa = this.convertValues(source["Fofa"], Fofa);
	        this.Hunter = this.convertValues(source["Hunter"], Hunter);
	        this.Quake = this.convertValues(source["Quake"], Quake);
	        this.Zone = this.convertValues(source["Zone"], Zone);
	        this.Shodan = this.convertValues(source["Shodan"], Shodan);
	        this.ICP = this.convertValues(source["ICP"], ICP);
	        this.TianYanCha = this.convertValues(source["TianYanCha"], TianYanCha);
	        this.AiQiCha = this.convertValues(source["AiQiCha"], AiQiCha);
	        this.Wechat = this.convertValues(source["Wechat"], Wechat);
	        this.Httpx = this.convertValues(source["Httpx"], Httpx);
	        this.QueryOnEnter = this.convertValues(source["QueryOnEnter"], QueryOnEnter);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	
	
	
	
	
	
	
	

}

export namespace event {
	
	export class EventDetail {
	    ID: number;
	    Status: number;
	    Message: string;
	    Error: string;
	    Data: any;
	
	    static createFrom(source: any = {}) {
	        return new EventDetail(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ID = source["ID"];
	        this.Status = source["Status"];
	        this.Message = source["Message"];
	        this.Error = source["Error"];
	        this.Data = source["Data"];
	    }
	}
	export class EventEnum {
	    AppExit: string;
	    WindowSizeChange: string;
	    FOFAExport: string;
	    NewDownloadItem: string;
	    NewExportLog: string;
	    HunterExport: string;
	    HunterQuery: string;
	    ICPExport: string;
	    QuakeExport: string;
	    ZoneSiteExport: string;
	    ZoneMemberExport: string;
	    ZoneEmailExport: string;
	    Httpx: string;
	    DecompileWxMiniProgram: string;
	    DecompileWxMiniProgramTicker: string;
	    ICPBatchQuery: string;
	    ICPBatchQueryStatusUpdate: string;
	    AiQiCha: string;
	
	    static createFrom(source: any = {}) {
	        return new EventEnum(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.AppExit = source["AppExit"];
	        this.WindowSizeChange = source["WindowSizeChange"];
	        this.FOFAExport = source["FOFAExport"];
	        this.NewDownloadItem = source["NewDownloadItem"];
	        this.NewExportLog = source["NewExportLog"];
	        this.HunterExport = source["HunterExport"];
	        this.HunterQuery = source["HunterQuery"];
	        this.ICPExport = source["ICPExport"];
	        this.QuakeExport = source["QuakeExport"];
	        this.ZoneSiteExport = source["ZoneSiteExport"];
	        this.ZoneMemberExport = source["ZoneMemberExport"];
	        this.ZoneEmailExport = source["ZoneEmailExport"];
	        this.Httpx = source["Httpx"];
	        this.DecompileWxMiniProgram = source["DecompileWxMiniProgram"];
	        this.DecompileWxMiniProgramTicker = source["DecompileWxMiniProgramTicker"];
	        this.ICPBatchQuery = source["ICPBatchQuery"];
	        this.ICPBatchQueryStatusUpdate = source["ICPBatchQueryStatusUpdate"];
	        this.AiQiCha = source["AiQiCha"];
	    }
	}

}

export namespace exportlog {
	
	export class Item {
	    filename: string;
	    dir: string;
	    exportID: number;
	    status: number;
	    message: string;
	    error: string;
	
	    static createFrom(source: any = {}) {
	        return new Item(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.filename = source["filename"];
	        this.dir = source["dir"];
	        this.exportID = source["exportID"];
	        this.status = source["status"];
	        this.message = source["message"];
	        this.error = source["error"];
	    }
	}

}

export namespace fofa {
	
	export class Regions {
	    code: string;
	    count: number;
	    name: string;
	
	    static createFrom(source: any = {}) {
	        return new Regions(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.code = source["code"];
	        this.count = source["count"];
	        this.name = source["name"];
	    }
	}
	export class Country {
	    code: string;
	    count: number;
	    name: string;
	    name_code: string;
	    regions: Regions[];
	
	    static createFrom(source: any = {}) {
	        return new Country(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.code = source["code"];
	        this.count = source["count"];
	        this.name = source["name"];
	        this.name_code = source["name_code"];
	        this.regions = this.convertValues(source["regions"], Regions);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Detail {
	    count: number;
	    name: string;
	
	    static createFrom(source: any = {}) {
	        return new Detail(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.count = source["count"];
	        this.name = source["name"];
	    }
	}
	export class Aggs {
	    as_number: Detail[];
	    as_organization: Detail[];
	    asset_type: Detail[];
	    countries: Country[];
	    domain: Detail[];
	    fid: Detail[];
	    icp: Detail[];
	    os: Detail[];
	    port: Detail[];
	    protocol: Detail[];
	    server: Detail[];
	    title: Detail[];
	
	    static createFrom(source: any = {}) {
	        return new Aggs(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.as_number = this.convertValues(source["as_number"], Detail);
	        this.as_organization = this.convertValues(source["as_organization"], Detail);
	        this.asset_type = this.convertValues(source["asset_type"], Detail);
	        this.countries = this.convertValues(source["countries"], Country);
	        this.domain = this.convertValues(source["domain"], Detail);
	        this.fid = this.convertValues(source["fid"], Detail);
	        this.icp = this.convertValues(source["icp"], Detail);
	        this.os = this.convertValues(source["os"], Detail);
	        this.port = this.convertValues(source["port"], Detail);
	        this.protocol = this.convertValues(source["protocol"], Detail);
	        this.server = this.convertValues(source["server"], Detail);
	        this.title = this.convertValues(source["title"], Detail);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	export class Product {
	    product: string;
	    category: string;
	    level: number;
	    sort_hard_code: number;
	    company: string;
	
	    static createFrom(source: any = {}) {
	        return new Product(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.product = source["product"];
	        this.category = source["category"];
	        this.level = source["level"];
	        this.sort_hard_code = source["sort_hard_code"];
	        this.company = source["company"];
	    }
	}
	export class Port {
	    port: number;
	    update_time: string;
	    protocol: string;
	    products: Product[];
	
	    static createFrom(source: any = {}) {
	        return new Port(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.port = source["port"];
	        this.update_time = source["update_time"];
	        this.protocol = source["protocol"];
	        this.products = this.convertValues(source["products"], Product);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class HostAggsResult {
	    error: boolean;
	    host: string;
	    consumed_fpoint: number;
	    required_fpoints: number;
	    ip: string;
	    asn: number;
	    org: string;
	    country_name: string;
	    country_code: string;
	    ports: Port[];
	    update_time: string;
	    domain: string[];
	
	    static createFrom(source: any = {}) {
	        return new HostAggsResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.error = source["error"];
	        this.host = source["host"];
	        this.consumed_fpoint = source["consumed_fpoint"];
	        this.required_fpoints = source["required_fpoints"];
	        this.ip = source["ip"];
	        this.asn = source["asn"];
	        this.org = source["org"];
	        this.country_name = source["country_name"];
	        this.country_code = source["country_code"];
	        this.ports = this.convertValues(source["ports"], Port);
	        this.update_time = source["update_time"];
	        this.domain = source["domain"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	export class Item {
	    ip: string;
	    port: string;
	    protocol: string;
	    country: string;
	    country_name: string;
	    region: string;
	    city: string;
	    longitude: string;
	    latitude: string;
	    as_number: string;
	    as_organization: string;
	    host: string;
	    domain: string;
	    os: string;
	    server: string;
	    icp: string;
	    title: string;
	    jarm: string;
	    header: string;
	    banner: string;
	    cert: string;
	    base_protocol: string;
	    link: string;
	    product: string;
	    product_category: string;
	    version: string;
	    lastupdatetime: string;
	    cname: string;
	    icon_hash: string;
	    certs_valid: string;
	    cname_domain: string;
	    body: string;
	    icon: string;
	    fid: string;
	    structinfo: string;
	
	    static createFrom(source: any = {}) {
	        return new Item(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ip = source["ip"];
	        this.port = source["port"];
	        this.protocol = source["protocol"];
	        this.country = source["country"];
	        this.country_name = source["country_name"];
	        this.region = source["region"];
	        this.city = source["city"];
	        this.longitude = source["longitude"];
	        this.latitude = source["latitude"];
	        this.as_number = source["as_number"];
	        this.as_organization = source["as_organization"];
	        this.host = source["host"];
	        this.domain = source["domain"];
	        this.os = source["os"];
	        this.server = source["server"];
	        this.icp = source["icp"];
	        this.title = source["title"];
	        this.jarm = source["jarm"];
	        this.header = source["header"];
	        this.banner = source["banner"];
	        this.cert = source["cert"];
	        this.base_protocol = source["base_protocol"];
	        this.link = source["link"];
	        this.product = source["product"];
	        this.product_category = source["product_category"];
	        this.version = source["version"];
	        this.lastupdatetime = source["lastupdatetime"];
	        this.cname = source["cname"];
	        this.icon_hash = source["icon_hash"];
	        this.certs_valid = source["certs_valid"];
	        this.cname_domain = source["cname_domain"];
	        this.body = source["body"];
	        this.icon = source["icon"];
	        this.fid = source["fid"];
	        this.structinfo = source["structinfo"];
	    }
	}
	export class QueryResult {
	    query: string;
	    total: number;
	    pageNum: number;
	    pageSize: number;
	    items: Item[];
	    maxPage: number;
	    pageID: number;
	
	    static createFrom(source: any = {}) {
	        return new QueryResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.query = source["query"];
	        this.total = source["total"];
	        this.pageNum = source["pageNum"];
	        this.pageSize = source["pageSize"];
	        this.items = this.convertValues(source["items"], Item);
	        this.maxPage = source["maxPage"];
	        this.pageID = source["pageID"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class StatisticalAggsResult {
	    error: boolean;
	    consumed_fpoint: number;
	    required_fpoints: number;
	    size: number;
	    // Go type: struct { Domain int "json:\"domain\""; Fid int "json:\"fid\""; Icp int "json:\"icp\""; IP int "json:\"ip\""; Ipc int "json:\"ipc\""; Server int "json:\"server\""; Title int "json:\"title\"" }
	    distinct: any;
	    aggs: Aggs;
	    lastupdatetime: string;
	
	    static createFrom(source: any = {}) {
	        return new StatisticalAggsResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.error = source["error"];
	        this.consumed_fpoint = source["consumed_fpoint"];
	        this.required_fpoints = source["required_fpoints"];
	        this.size = source["size"];
	        this.distinct = this.convertValues(source["distinct"], Object);
	        this.aggs = this.convertValues(source["aggs"], Aggs);
	        this.lastupdatetime = source["lastupdatetime"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class User {
	    email: string;
	    username: string;
	    category: string;
	    fcoin: number;
	    fofa_point: number;
	    remain_free_point: number;
	    remain_api_query: number;
	    remain_api_data: number;
	    isvip: boolean;
	    vip_level: number;
	    is_verified: boolean;
	    avatar: string;
	    message: string;
	    fofacli_ver: string;
	    fofa_server: boolean;
	
	    static createFrom(source: any = {}) {
	        return new User(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.email = source["email"];
	        this.username = source["username"];
	        this.category = source["category"];
	        this.fcoin = source["fcoin"];
	        this.fofa_point = source["fofa_point"];
	        this.remain_free_point = source["remain_free_point"];
	        this.remain_api_query = source["remain_api_query"];
	        this.remain_api_data = source["remain_api_data"];
	        this.isvip = source["isvip"];
	        this.vip_level = source["vip_level"];
	        this.is_verified = source["is_verified"];
	        this.avatar = source["avatar"];
	        this.message = source["message"];
	        this.fofacli_ver = source["fofacli_ver"];
	        this.fofa_server = source["fofa_server"];
	    }
	}

}

export namespace history {
	
	export class HistoryEnum {
	    FOFA: number;
	    Hunter: number;
	    Quake: number;
	    Zone: number;
	    ICP: number;
	    TYC: number;
	    AQC: number;
	    Shodan: number;
	
	    static createFrom(source: any = {}) {
	        return new HistoryEnum(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.FOFA = source["FOFA"];
	        this.Hunter = source["Hunter"];
	        this.Quake = source["Quake"];
	        this.Zone = source["Zone"];
	        this.ICP = source["ICP"];
	        this.TYC = source["TYC"];
	        this.AQC = source["AQC"];
	        this.Shodan = source["Shodan"];
	    }
	}

}

export namespace hunter {
	
	export class Component {
	    name: string;
	    version: string;
	    ItemID: number;
	
	    static createFrom(source: any = {}) {
	        return new Component(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.version = source["version"];
	        this.ItemID = source["ItemID"];
	    }
	}
	export class Item {
	    is_risk: string;
	    url: string;
	    ip: string;
	    port: number;
	    web_title: string;
	    domain: string;
	    is_risk_protocol: string;
	    protocol: string;
	    base_protocol: string;
	    status_code: number;
	    component: Component[];
	    os: string;
	    company: string;
	    number: string;
	    country?: string;
	    province?: string;
	    city: string;
	    updated_at: string;
	    is_web: string;
	    as_org: string;
	    isp: string;
	    banner: string;
	
	    static createFrom(source: any = {}) {
	        return new Item(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.is_risk = source["is_risk"];
	        this.url = source["url"];
	        this.ip = source["ip"];
	        this.port = source["port"];
	        this.web_title = source["web_title"];
	        this.domain = source["domain"];
	        this.is_risk_protocol = source["is_risk_protocol"];
	        this.protocol = source["protocol"];
	        this.base_protocol = source["base_protocol"];
	        this.status_code = source["status_code"];
	        this.component = this.convertValues(source["component"], Component);
	        this.os = source["os"];
	        this.company = source["company"];
	        this.number = source["number"];
	        this.country = source["country"];
	        this.province = source["province"];
	        this.city = source["city"];
	        this.updated_at = source["updated_at"];
	        this.is_web = source["is_web"];
	        this.as_org = source["as_org"];
	        this.isp = source["isp"];
	        this.banner = source["banner"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class User {
	    AccountType: string;
	    RestQuota: number;
	
	    static createFrom(source: any = {}) {
	        return new User(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.AccountType = source["AccountType"];
	        this.RestQuota = source["RestQuota"];
	    }
	}
	export class QueryResult {
	    User: User;
	    consumeQuota: number;
	    syntaxPrompt: string;
	    total: number;
	    pageNum: number;
	    pageSize: number;
	    items: Item[];
	    maxPage: number;
	    pageID: number;
	
	    static createFrom(source: any = {}) {
	        return new QueryResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.User = this.convertValues(source["User"], User);
	        this.consumeQuota = source["consumeQuota"];
	        this.syntaxPrompt = source["syntaxPrompt"];
	        this.total = source["total"];
	        this.pageNum = source["pageNum"];
	        this.pageSize = source["pageSize"];
	        this.items = this.convertValues(source["items"], Item);
	        this.maxPage = source["maxPage"];
	        this.pageID = source["pageID"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace icp {
	
	export class Item {
	    serviceName: string;
	    leaderName: string;
	    natureName: string;
	    serviceLicence: string;
	    unitName: string;
	    updateRecordTime: string;
	    serviceType: string;
	
	    static createFrom(source: any = {}) {
	        return new Item(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.serviceName = source["serviceName"];
	        this.leaderName = source["leaderName"];
	        this.natureName = source["natureName"];
	        this.serviceLicence = source["serviceLicence"];
	        this.unitName = source["unitName"];
	        this.updateRecordTime = source["updateRecordTime"];
	        this.serviceType = source["serviceType"];
	    }
	}
	export class Data {
	    pageID: number;
	    pageNum: number;
	    pageSize: number;
	    total: number;
	    items: Item[];
	
	    static createFrom(source: any = {}) {
	        return new Data(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.pageID = source["pageID"];
	        this.pageNum = source["pageNum"];
	        this.pageSize = source["pageSize"];
	        this.total = source["total"];
	        this.items = this.convertValues(source["items"], Item);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class GetTaskDataResult {
	    Total: number;
	    Items: models.ItemWithID[];
	
	    static createFrom(source: any = {}) {
	        return new GetTaskDataResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Total = source["Total"];
	        this.Items = this.convertValues(source["Items"], models.ItemWithID);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Task {
	    // Go type: time
	    createdAt: any;
	    name: string;
	    taskID: number;
	    status: number;
	    serviceTypes: string;
	    targets: string;
	    total: number;
	    current: number;
	    timeSpent: number;
	    message: string;
	
	    static createFrom(source: any = {}) {
	        return new Task(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.createdAt = this.convertValues(source["createdAt"], null);
	        this.name = source["name"];
	        this.taskID = source["taskID"];
	        this.status = source["status"];
	        this.serviceTypes = source["serviceTypes"];
	        this.targets = source["targets"];
	        this.total = source["total"];
	        this.current = source["current"];
	        this.timeSpent = source["timeSpent"];
	        this.message = source["message"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class GetTaskListResult {
	    Total: number;
	    Items: Task[];
	
	    static createFrom(source: any = {}) {
	        return new GetTaskListResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Total = source["Total"];
	        this.Items = this.convertValues(source["Items"], Task);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	

}

export namespace ip138 {
	
	export class DomainItem {
	    domain: string;
	    date: string;
	
	    static createFrom(source: any = {}) {
	        return new DomainItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.domain = source["domain"];
	        this.date = source["date"];
	    }
	}
	export class IPItem {
	    ip: string;
	    locationOrDate: string;
	
	    static createFrom(source: any = {}) {
	        return new IPItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ip = source["ip"];
	        this.locationOrDate = source["locationOrDate"];
	    }
	}

}

export namespace models {
	
	export class ExportLog {
	    id: number;
	    // Go type: time
	    createdAt: any;
	    // Go type: gorm
	    deletedAt: any;
	    filename: string;
	    dir: string;
	    exportID: number;
	    status: number;
	    message: string;
	    error: string;
	
	    static createFrom(source: any = {}) {
	        return new ExportLog(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.createdAt = this.convertValues(source["createdAt"], null);
	        this.deletedAt = this.convertValues(source["deletedAt"], null);
	        this.filename = source["filename"];
	        this.dir = source["dir"];
	        this.exportID = source["exportID"];
	        this.status = source["status"];
	        this.message = source["message"];
	        this.error = source["error"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ItemWithID {
	    id: number;
	    // Go type: time
	    createdAt: any;
	    // Go type: gorm
	    deletedAt: any;
	    SliceID: number;
	    TaskID: number;
	    serviceName: string;
	    leaderName: string;
	    natureName: string;
	    serviceLicence: string;
	    unitName: string;
	    updateRecordTime: string;
	    serviceType: string;
	
	    static createFrom(source: any = {}) {
	        return new ItemWithID(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.createdAt = this.convertValues(source["createdAt"], null);
	        this.deletedAt = this.convertValues(source["deletedAt"], null);
	        this.SliceID = source["SliceID"];
	        this.TaskID = source["TaskID"];
	        this.serviceName = source["serviceName"];
	        this.leaderName = source["leaderName"];
	        this.natureName = source["natureName"];
	        this.serviceLicence = source["serviceLicence"];
	        this.unitName = source["unitName"];
	        this.updateRecordTime = source["updateRecordTime"];
	        this.serviceType = source["serviceType"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace properties {
	
	export class General {
	    asn: string;
	    cpe23: string[];
	    data: string;
	    device: string;
	    devicetype: string;
	    domains: string[];
	    hash: number;
	    hostnames: string[];
	    ip: number;
	    ip_str: string;
	    info: string;
	    ipv6: string;
	    isp: string;
	    link: string;
	    // Go type: datatypes
	    mac: any;
	    // Go type: datatypes
	    opts: any;
	    org: string;
	    os: string;
	    platform: string;
	    port: number;
	    product: string;
	    tags: string[];
	    timestamp: string;
	    transport: string;
	    uptime: number;
	    vendor: string;
	    version: string;
	    // Go type: datatypes
	    vulns: any;
	    // Go type: datatypes
	    location: any;
	    // Go type: datatypes
	    http: any;
	
	    static createFrom(source: any = {}) {
	        return new General(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.asn = source["asn"];
	        this.cpe23 = source["cpe23"];
	        this.data = source["data"];
	        this.device = source["device"];
	        this.devicetype = source["devicetype"];
	        this.domains = source["domains"];
	        this.hash = source["hash"];
	        this.hostnames = source["hostnames"];
	        this.ip = source["ip"];
	        this.ip_str = source["ip_str"];
	        this.info = source["info"];
	        this.ipv6 = source["ipv6"];
	        this.isp = source["isp"];
	        this.link = source["link"];
	        this.mac = this.convertValues(source["mac"], null);
	        this.opts = this.convertValues(source["opts"], null);
	        this.org = source["org"];
	        this.os = source["os"];
	        this.platform = source["platform"];
	        this.port = source["port"];
	        this.product = source["product"];
	        this.tags = source["tags"];
	        this.timestamp = source["timestamp"];
	        this.transport = source["transport"];
	        this.uptime = source["uptime"];
	        this.vendor = source["vendor"];
	        this.version = source["version"];
	        this.vulns = this.convertValues(source["vulns"], null);
	        this.location = this.convertValues(source["location"], null);
	        this.http = this.convertValues(source["http"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class HTTPRedirect {
	    data: string;
	    host: string;
	    location: string;
	
	    static createFrom(source: any = {}) {
	        return new HTTPRedirect(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.data = source["data"];
	        this.host = source["host"];
	        this.location = source["location"];
	    }
	}
	export class HTTPFavicon {
	    data: string;
	    hash: number;
	    location: string;
	
	    static createFrom(source: any = {}) {
	        return new HTTPFavicon(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.data = source["data"];
	        this.hash = source["hash"];
	        this.location = source["location"];
	    }
	}
	export class HTTPComponent {
	    categories: string[];
	
	    static createFrom(source: any = {}) {
	        return new HTTPComponent(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.categories = source["categories"];
	    }
	}
	export class HTTP {
	    components: Record<string, HTTPComponent>;
	    dom_hash: number;
	    favicon: HTTPFavicon;
	    headers_hash: number;
	    host: string;
	    html: string;
	    html_hash: number;
	    location: string;
	    redirects: HTTPRedirect[];
	    robots: string;
	    robots_hash: number;
	    securitytxt: string;
	    securitytxt_hash: number;
	    server: string;
	    server_hash: number;
	    sitemap: string;
	    sitemap_hash: number;
	    status: number;
	    title: string;
	    title_hash: number;
	    waf: string;
	
	    static createFrom(source: any = {}) {
	        return new HTTP(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.components = this.convertValues(source["components"], HTTPComponent, true);
	        this.dom_hash = source["dom_hash"];
	        this.favicon = this.convertValues(source["favicon"], HTTPFavicon);
	        this.headers_hash = source["headers_hash"];
	        this.host = source["host"];
	        this.html = source["html"];
	        this.html_hash = source["html_hash"];
	        this.location = source["location"];
	        this.redirects = this.convertValues(source["redirects"], HTTPRedirect);
	        this.robots = source["robots"];
	        this.robots_hash = source["robots_hash"];
	        this.securitytxt = source["securitytxt"];
	        this.securitytxt_hash = source["securitytxt_hash"];
	        this.server = source["server"];
	        this.server_hash = source["server_hash"];
	        this.sitemap = source["sitemap"];
	        this.sitemap_hash = source["sitemap_hash"];
	        this.status = source["status"];
	        this.title = source["title"];
	        this.title_hash = source["title_hash"];
	        this.waf = source["waf"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	

}

export namespace proxy {
	
	export class Manager {
	
	
	    static createFrom(source: any = {}) {
	        return new Manager(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	
	    }
	}

}

export namespace quake {
	
	export class Component {
	    SID: number;
	    ItemID: number;
	    product_level: string;
	    product_type: string[];
	    product_vendor: string;
	    product_name_cn: string;
	    product_name_en: string;
	    id: string;
	    version: string;
	    product_catalog: string[];
	
	    static createFrom(source: any = {}) {
	        return new Component(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.SID = source["SID"];
	        this.ItemID = source["ItemID"];
	        this.product_level = source["product_level"];
	        this.product_type = source["product_type"];
	        this.product_vendor = source["product_vendor"];
	        this.product_name_cn = source["product_name_cn"];
	        this.product_name_en = source["product_name_en"];
	        this.id = source["id"];
	        this.version = source["version"];
	        this.product_catalog = source["product_catalog"];
	    }
	}
	export class HTTP {
	    server: string;
	    status_code: any;
	    title: string;
	    host: string;
	    path: string;
	
	    static createFrom(source: any = {}) {
	        return new HTTP(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.server = source["server"];
	        this.status_code = source["status_code"];
	        this.title = source["title"];
	        this.host = source["host"];
	        this.path = source["path"];
	    }
	}
	export class Location {
	    LocationID: number;
	    owner: string;
	    province_cn: string;
	    province_en: string;
	    isp: string;
	    country_en: string;
	    district_cn: string;
	    gps: number[];
	    street_cn: string;
	    city_en: string;
	    district_en: string;
	    country_cn: string;
	    street_en: string;
	    city_cn: string;
	    country_code: string;
	    asname: string;
	    scene_cn: string;
	    scene_en: string;
	    radius: number;
	
	    static createFrom(source: any = {}) {
	        return new Location(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.LocationID = source["LocationID"];
	        this.owner = source["owner"];
	        this.province_cn = source["province_cn"];
	        this.province_en = source["province_en"];
	        this.isp = source["isp"];
	        this.country_en = source["country_en"];
	        this.district_cn = source["district_cn"];
	        this.gps = source["gps"];
	        this.street_cn = source["street_cn"];
	        this.city_en = source["city_en"];
	        this.district_en = source["district_en"];
	        this.country_cn = source["country_cn"];
	        this.street_en = source["street_en"];
	        this.city_cn = source["city_cn"];
	        this.country_code = source["country_code"];
	        this.asname = source["asname"];
	        this.scene_cn = source["scene_cn"];
	        this.scene_en = source["scene_en"];
	        this.radius = source["radius"];
	    }
	}
	export class RealtimeDataQueryOptions {
	    query?: string;
	    rule?: string;
	    ipList?: string[];
	    page?: number;
	    size?: number;
	    ignoreCache?: boolean;
	    startTime?: string;
	    endTime?: string;
	    include?: string[];
	    exclude?: string[];
	    latest?: boolean;
	
	    static createFrom(source: any = {}) {
	        return new RealtimeDataQueryOptions(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.query = source["query"];
	        this.rule = source["rule"];
	        this.ipList = source["ipList"];
	        this.page = source["page"];
	        this.size = source["size"];
	        this.ignoreCache = source["ignoreCache"];
	        this.startTime = source["startTime"];
	        this.endTime = source["endTime"];
	        this.include = source["include"];
	        this.exclude = source["exclude"];
	        this.latest = source["latest"];
	    }
	}
	export class Service {
	    ItemID: number;
	    response: string;
	    response_hash: string;
	    name: string;
	    http: HTTP;
	    cert: string;
	
	    static createFrom(source: any = {}) {
	        return new Service(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ItemID = source["ItemID"];
	        this.response = source["response"];
	        this.response_hash = source["response_hash"];
	        this.name = source["name"];
	        this.http = this.convertValues(source["http"], HTTP);
	        this.cert = source["cert"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class RealtimeServiceItem {
	    components: Component[];
	    org: string;
	    ip: string;
	    os_version: string;
	    is_ipv6: boolean;
	    transport: string;
	    hostname: string;
	    port: number;
	    service: Service;
	    domain: string;
	    os_name: string;
	    location: Location;
	    time: string;
	    asn: number;
	
	    static createFrom(source: any = {}) {
	        return new RealtimeServiceItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.components = this.convertValues(source["components"], Component);
	        this.org = source["org"];
	        this.ip = source["ip"];
	        this.os_version = source["os_version"];
	        this.is_ipv6 = source["is_ipv6"];
	        this.transport = source["transport"];
	        this.hostname = source["hostname"];
	        this.port = source["port"];
	        this.service = this.convertValues(source["service"], Service);
	        this.domain = source["domain"];
	        this.os_name = source["os_name"];
	        this.location = this.convertValues(source["location"], Location);
	        this.time = source["time"];
	        this.asn = source["asn"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class RealtimeServiceDataResult {
	    items: RealtimeServiceItem[];
	    pageNum: number;
	    pageSize: number;
	    total: number;
	
	    static createFrom(source: any = {}) {
	        return new RealtimeServiceDataResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.items = this.convertValues(source["items"], RealtimeServiceItem);
	        this.pageNum = source["pageNum"];
	        this.pageSize = source["pageSize"];
	        this.total = source["total"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class RealtimeServiceQueryResult {
	    result: RealtimeServiceDataResult;
	    pageID: number;
	    maxPage: number;
	
	    static createFrom(source: any = {}) {
	        return new RealtimeServiceQueryResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.result = this.convertValues(source["result"], RealtimeServiceDataResult);
	        this.pageID = source["pageID"];
	        this.maxPage = source["maxPage"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class UserRole {
	    fullname: string;
	    priority: number;
	    credit: number;
	
	    static createFrom(source: any = {}) {
	        return new UserRole(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.fullname = source["fullname"];
	        this.priority = source["priority"];
	        this.credit = source["credit"];
	    }
	}
	export class UserRoleValidity {
	    "注册用户": any;
	
	    static createFrom(source: any = {}) {
	        return new UserRoleValidity(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this["注册用户"] = source["注册用户"];
	    }
	}
	export class UserInvitationCodeInfo {
	    code: string;
	    invite_acquire_credit: number;
	    invite_number: number;
	
	    static createFrom(source: any = {}) {
	        return new UserInvitationCodeInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.code = source["code"];
	        this.invite_acquire_credit = source["invite_acquire_credit"];
	        this.invite_number = source["invite_number"];
	    }
	}
	export class UserEnterpriseInformation {
	    name: any;
	    email: any;
	    status: string;
	
	    static createFrom(source: any = {}) {
	        return new UserEnterpriseInformation(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.email = source["email"];
	        this.status = source["status"];
	    }
	}
	export class UserPrivacyLog {
	    quake_log_status: boolean;
	    quake_log_time: any;
	    anonymous_model: boolean;
	    status: boolean;
	    time: any;
	
	    static createFrom(source: any = {}) {
	        return new UserPrivacyLog(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.quake_log_status = source["quake_log_status"];
	        this.quake_log_time = source["quake_log_time"];
	        this.anonymous_model = source["anonymous_model"];
	        this.status = source["status"];
	        this.time = source["time"];
	    }
	}
	export class UserDisable {
	    disable_time: any;
	    start_time: any;
	
	    static createFrom(source: any = {}) {
	        return new UserDisable(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.disable_time = source["disable_time"];
	        this.start_time = source["start_time"];
	    }
	}
	export class UserInfo {
	    id: string;
	    username: string;
	    fullname: string;
	    email: any;
	    group: string[];
	
	    static createFrom(source: any = {}) {
	        return new UserInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.username = source["username"];
	        this.fullname = source["fullname"];
	        this.email = source["email"];
	        this.group = source["group"];
	    }
	}
	export class User {
	    id: string;
	    user: UserInfo;
	    baned: boolean;
	    ban_status: string;
	    month_remaining_credit: number;
	    constant_credit: number;
	    credit: number;
	    persistent_credit: number;
	    free_query_api_count: number;
	    avatar_id: string;
	    token: string;
	    mobile_phone: string;
	    source: string;
	    time: string;
	    disable: UserDisable;
	    privacy_log: UserPrivacyLog;
	    enterprise_information: UserEnterpriseInformation;
	    invitation_code_info: UserInvitationCodeInfo;
	    is_cashed_invitation_code: boolean;
	    role_validity: UserRoleValidity;
	    personal_information_status: boolean;
	    role: UserRole[];
	
	    static createFrom(source: any = {}) {
	        return new User(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.user = this.convertValues(source["user"], UserInfo);
	        this.baned = source["baned"];
	        this.ban_status = source["ban_status"];
	        this.month_remaining_credit = source["month_remaining_credit"];
	        this.constant_credit = source["constant_credit"];
	        this.credit = source["credit"];
	        this.persistent_credit = source["persistent_credit"];
	        this.free_query_api_count = source["free_query_api_count"];
	        this.avatar_id = source["avatar_id"];
	        this.token = source["token"];
	        this.mobile_phone = source["mobile_phone"];
	        this.source = source["source"];
	        this.time = source["time"];
	        this.disable = this.convertValues(source["disable"], UserDisable);
	        this.privacy_log = this.convertValues(source["privacy_log"], UserPrivacyLog);
	        this.enterprise_information = this.convertValues(source["enterprise_information"], UserEnterpriseInformation);
	        this.invitation_code_info = this.convertValues(source["invitation_code_info"], UserInvitationCodeInfo);
	        this.is_cashed_invitation_code = source["is_cashed_invitation_code"];
	        this.role_validity = this.convertValues(source["role_validity"], UserRoleValidity);
	        this.personal_information_status = source["personal_information_status"];
	        this.role = this.convertValues(source["role"], UserRole);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	
	
	
	

}

export namespace shodan {
	
	export class Count {
	    count: number;
	    value: string;
	
	    static createFrom(source: any = {}) {
	        return new Count(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.count = source["count"];
	        this.value = source["value"];
	    }
	}
	export class Facets {
	    asn: Count[];
	    "bitcoin.ip": Count[];
	    "bitcoin.ip_count": Count[];
	    "bitcoin.port": Count[];
	    "bitcoin.user_agent": Count[];
	    "bitcoin.version": Count[];
	    city: Count[];
	    "cloud.provider": Count[];
	    "cloud.region": Count[];
	    "cloud.service": Count[];
	    country: Count[];
	    cpe: Count[];
	    device: Count[];
	    domain: Count[];
	    has_screenshot: Count[];
	    hash: Count[];
	    "http.component": Count[];
	    "http.component_category": Count[];
	    "http.favicon.hash": Count[];
	    "http.headers_hash": Count[];
	    "http.html_hash": Count[];
	    "http.robots_hash": Count[];
	    "http.status": Count[];
	    "http.title": Count[];
	    "http.waf": Count[];
	    ip: Count[];
	    isp: Count[];
	    link: Count[];
	    "mongodb.database.name": Count[];
	    "ntp.ip": Count[];
	    "ntp.ip_count": Count[];
	    "ntp.more": Count[];
	    "ntp.port": Count[];
	    org: Count[];
	    os: Count[];
	    port: Count[];
	    postal: Count[];
	    product: Count[];
	    "redis.key": Count[];
	    region: Count[];
	    "rsync.module": Count[];
	    "screenshot.hash": Count[];
	    "screenshot.label": Count[];
	    "snmp.contact": Count[];
	    "snmp.location": Count[];
	    "snmp.name": Count[];
	    "ssh.cipher": Count[];
	    "ssh.fingerprint": Count[];
	    "ssh.hassh": Count[];
	    "ssh.mac": Count[];
	    "ssh.type": Count[];
	    "ssl.alpn": Count[];
	    "ssl.cert.alg": Count[];
	    "ssl.cert.expired": Count[];
	    "ssl.cert.extension": Count[];
	    "ssl.cert.fingerprint": Count[];
	    "ssl.cert.issuer.cn": Count[];
	    "ssl.cert.pubkey.bits": Count[];
	    "ssl.cert.pubkey.type": Count[];
	    "ssl.cert.serial": Count[];
	    "ssl.cert.subject.cn": Count[];
	    "ssl.chain_count": Count[];
	    "ssl.cipher.bits": Count[];
	    "ssl.cipher.name": Count[];
	    "ssl.cipher.version": Count[];
	    "ssl.ja3s": Count[];
	    "ssl.jarm": Count[];
	    "ssl.version": Count[];
	    state: Count[];
	    tag: Count[];
	    "telnet.do": Count[];
	    "telnet.dont": Count[];
	    "telnet.option": Count[];
	    "telnet.will": Count[];
	    "telnet.wont": Count[];
	    uptime: Count[];
	    version: Count[];
	    vuln: Count[];
	    "vuln.verified": Count[];
	
	    static createFrom(source: any = {}) {
	        return new Facets(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.asn = this.convertValues(source["asn"], Count);
	        this["bitcoin.ip"] = this.convertValues(source["bitcoin.ip"], Count);
	        this["bitcoin.ip_count"] = this.convertValues(source["bitcoin.ip_count"], Count);
	        this["bitcoin.port"] = this.convertValues(source["bitcoin.port"], Count);
	        this["bitcoin.user_agent"] = this.convertValues(source["bitcoin.user_agent"], Count);
	        this["bitcoin.version"] = this.convertValues(source["bitcoin.version"], Count);
	        this.city = this.convertValues(source["city"], Count);
	        this["cloud.provider"] = this.convertValues(source["cloud.provider"], Count);
	        this["cloud.region"] = this.convertValues(source["cloud.region"], Count);
	        this["cloud.service"] = this.convertValues(source["cloud.service"], Count);
	        this.country = this.convertValues(source["country"], Count);
	        this.cpe = this.convertValues(source["cpe"], Count);
	        this.device = this.convertValues(source["device"], Count);
	        this.domain = this.convertValues(source["domain"], Count);
	        this.has_screenshot = this.convertValues(source["has_screenshot"], Count);
	        this.hash = this.convertValues(source["hash"], Count);
	        this["http.component"] = this.convertValues(source["http.component"], Count);
	        this["http.component_category"] = this.convertValues(source["http.component_category"], Count);
	        this["http.favicon.hash"] = this.convertValues(source["http.favicon.hash"], Count);
	        this["http.headers_hash"] = this.convertValues(source["http.headers_hash"], Count);
	        this["http.html_hash"] = this.convertValues(source["http.html_hash"], Count);
	        this["http.robots_hash"] = this.convertValues(source["http.robots_hash"], Count);
	        this["http.status"] = this.convertValues(source["http.status"], Count);
	        this["http.title"] = this.convertValues(source["http.title"], Count);
	        this["http.waf"] = this.convertValues(source["http.waf"], Count);
	        this.ip = this.convertValues(source["ip"], Count);
	        this.isp = this.convertValues(source["isp"], Count);
	        this.link = this.convertValues(source["link"], Count);
	        this["mongodb.database.name"] = this.convertValues(source["mongodb.database.name"], Count);
	        this["ntp.ip"] = this.convertValues(source["ntp.ip"], Count);
	        this["ntp.ip_count"] = this.convertValues(source["ntp.ip_count"], Count);
	        this["ntp.more"] = this.convertValues(source["ntp.more"], Count);
	        this["ntp.port"] = this.convertValues(source["ntp.port"], Count);
	        this.org = this.convertValues(source["org"], Count);
	        this.os = this.convertValues(source["os"], Count);
	        this.port = this.convertValues(source["port"], Count);
	        this.postal = this.convertValues(source["postal"], Count);
	        this.product = this.convertValues(source["product"], Count);
	        this["redis.key"] = this.convertValues(source["redis.key"], Count);
	        this.region = this.convertValues(source["region"], Count);
	        this["rsync.module"] = this.convertValues(source["rsync.module"], Count);
	        this["screenshot.hash"] = this.convertValues(source["screenshot.hash"], Count);
	        this["screenshot.label"] = this.convertValues(source["screenshot.label"], Count);
	        this["snmp.contact"] = this.convertValues(source["snmp.contact"], Count);
	        this["snmp.location"] = this.convertValues(source["snmp.location"], Count);
	        this["snmp.name"] = this.convertValues(source["snmp.name"], Count);
	        this["ssh.cipher"] = this.convertValues(source["ssh.cipher"], Count);
	        this["ssh.fingerprint"] = this.convertValues(source["ssh.fingerprint"], Count);
	        this["ssh.hassh"] = this.convertValues(source["ssh.hassh"], Count);
	        this["ssh.mac"] = this.convertValues(source["ssh.mac"], Count);
	        this["ssh.type"] = this.convertValues(source["ssh.type"], Count);
	        this["ssl.alpn"] = this.convertValues(source["ssl.alpn"], Count);
	        this["ssl.cert.alg"] = this.convertValues(source["ssl.cert.alg"], Count);
	        this["ssl.cert.expired"] = this.convertValues(source["ssl.cert.expired"], Count);
	        this["ssl.cert.extension"] = this.convertValues(source["ssl.cert.extension"], Count);
	        this["ssl.cert.fingerprint"] = this.convertValues(source["ssl.cert.fingerprint"], Count);
	        this["ssl.cert.issuer.cn"] = this.convertValues(source["ssl.cert.issuer.cn"], Count);
	        this["ssl.cert.pubkey.bits"] = this.convertValues(source["ssl.cert.pubkey.bits"], Count);
	        this["ssl.cert.pubkey.type"] = this.convertValues(source["ssl.cert.pubkey.type"], Count);
	        this["ssl.cert.serial"] = this.convertValues(source["ssl.cert.serial"], Count);
	        this["ssl.cert.subject.cn"] = this.convertValues(source["ssl.cert.subject.cn"], Count);
	        this["ssl.chain_count"] = this.convertValues(source["ssl.chain_count"], Count);
	        this["ssl.cipher.bits"] = this.convertValues(source["ssl.cipher.bits"], Count);
	        this["ssl.cipher.name"] = this.convertValues(source["ssl.cipher.name"], Count);
	        this["ssl.cipher.version"] = this.convertValues(source["ssl.cipher.version"], Count);
	        this["ssl.ja3s"] = this.convertValues(source["ssl.ja3s"], Count);
	        this["ssl.jarm"] = this.convertValues(source["ssl.jarm"], Count);
	        this["ssl.version"] = this.convertValues(source["ssl.version"], Count);
	        this.state = this.convertValues(source["state"], Count);
	        this.tag = this.convertValues(source["tag"], Count);
	        this["telnet.do"] = this.convertValues(source["telnet.do"], Count);
	        this["telnet.dont"] = this.convertValues(source["telnet.dont"], Count);
	        this["telnet.option"] = this.convertValues(source["telnet.option"], Count);
	        this["telnet.will"] = this.convertValues(source["telnet.will"], Count);
	        this["telnet.wont"] = this.convertValues(source["telnet.wont"], Count);
	        this.uptime = this.convertValues(source["uptime"], Count);
	        this.version = this.convertValues(source["version"], Count);
	        this.vuln = this.convertValues(source["vuln"], Count);
	        this["vuln.verified"] = this.convertValues(source["vuln.verified"], Count);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class HostSearchResult {
	    matches: properties.General[];
	    // Go type: Facets
	    facets: any;
	    total: number;
	    pageID: number;
	
	    static createFrom(source: any = {}) {
	        return new HostSearchResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.matches = this.convertValues(source["matches"], properties.General);
	        this.facets = this.convertValues(source["facets"], null);
	        this.total = source["total"];
	        this.pageID = source["pageID"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class UsageLimits {
	    scan_credits: number;
	    query_credits: number;
	    monitored_ips: number;
	
	    static createFrom(source: any = {}) {
	        return new UsageLimits(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.scan_credits = source["scan_credits"];
	        this.query_credits = source["query_credits"];
	        this.monitored_ips = source["monitored_ips"];
	    }
	}
	export class User {
	    scan_credits: number;
	    usage_limits: UsageLimits;
	    plan: string;
	    https: boolean;
	    unlocked: boolean;
	    query_credits: number;
	    monitored_ips: number;
	    unlocked_left: number;
	    telnet: boolean;
	
	    static createFrom(source: any = {}) {
	        return new User(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.scan_credits = source["scan_credits"];
	        this.usage_limits = this.convertValues(source["usage_limits"], UsageLimits);
	        this.plan = source["plan"];
	        this.https = source["https"];
	        this.unlocked = source["unlocked"];
	        this.query_credits = source["query_credits"];
	        this.monitored_ips = source["monitored_ips"];
	        this.unlocked_left = source["unlocked_left"];
	        this.telnet = source["telnet"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace status {
	
	export class StatusEnum {
	    Pending: number;
	    Running: number;
	    Paused: number;
	    Stopped: number;
	    Deleted: number;
	    Error: number;
	    OK: number;
	    Waiting: number;
	    ReRun: number;
	    Pausing: number;
	
	    static createFrom(source: any = {}) {
	        return new StatusEnum(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Pending = source["Pending"];
	        this.Running = source["Running"];
	        this.Paused = source["Paused"];
	        this.Stopped = source["Stopped"];
	        this.Deleted = source["Deleted"];
	        this.Error = source["Error"];
	        this.OK = source["OK"];
	        this.Waiting = source["Waiting"];
	        this.ReRun = source["ReRun"];
	        this.Pausing = source["Pausing"];
	    }
	}

}

export namespace tianyancha {
	
	export class LabelListV3 {
	    companyId: number;
	    profileTagId: number;
	    profileTagTypeId: number;
	    profileTagNameOnPage: string;
	    profileTagLogo: string;
	    borderTransparency: string;
	    guideTransparency: string;
	    borderWidth: string;
	    borderColor: string;
	    guideColor: string;
	    fontSize: number;
	    fontFamily: string;
	    color: string;
	    background: string;
	
	    static createFrom(source: any = {}) {
	        return new LabelListV3(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.companyId = source["companyId"];
	        this.profileTagId = source["profileTagId"];
	        this.profileTagTypeId = source["profileTagTypeId"];
	        this.profileTagNameOnPage = source["profileTagNameOnPage"];
	        this.profileTagLogo = source["profileTagLogo"];
	        this.borderTransparency = source["borderTransparency"];
	        this.guideTransparency = source["guideTransparency"];
	        this.borderWidth = source["borderWidth"];
	        this.borderColor = source["borderColor"];
	        this.guideColor = source["guideColor"];
	        this.fontSize = source["fontSize"];
	        this.fontFamily = source["fontFamily"];
	        this.color = source["color"];
	        this.background = source["background"];
	    }
	}
	export class PenetrationItem {
	    ratio: number;
	    amountStr: string;
	    id: string;
	    entityType: number;
	    companyId: number;
	    humanNameId: number;
	    name: string;
	    logo: string;
	    isActualController: boolean;
	    isFinalBeneficial: boolean;
	    isBigHolder: boolean;
	    hasHolder: boolean;
	    hasInvestor: boolean;
	    // Go type: struct { TagID int "json:\"tagId\""; Name string "json:\"name\""; Title string "json:\"title\""; FontColor string "json:\"fontColor\""; BackgroundColor string "json:\"backgroundColor\""; TagLogoURL string "json:\"tagLogoUrl\"" }
	    statusTag: any;
	    isValid: boolean;
	    industry: any;
	    // Go type: struct { TagID int "json:\"tagId\""; Name string "json:\"name\""; Title string "json:\"title\""; FontColor string "json:\"fontColor\""; BackgroundColor string "json:\"backgroundColor\""; TagLogoURL string "json:\"tagLogoUrl\"" }
	    entityTag: any;
	    beneficiaryShareholdingRatio: any;
	    alias: string;
	    totalShareholdingRatio: any;
	    isShellCompany: boolean;
	
	    static createFrom(source: any = {}) {
	        return new PenetrationItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ratio = source["ratio"];
	        this.amountStr = source["amountStr"];
	        this.id = source["id"];
	        this.entityType = source["entityType"];
	        this.companyId = source["companyId"];
	        this.humanNameId = source["humanNameId"];
	        this.name = source["name"];
	        this.logo = source["logo"];
	        this.isActualController = source["isActualController"];
	        this.isFinalBeneficial = source["isFinalBeneficial"];
	        this.isBigHolder = source["isBigHolder"];
	        this.hasHolder = source["hasHolder"];
	        this.hasInvestor = source["hasInvestor"];
	        this.statusTag = this.convertValues(source["statusTag"], Object);
	        this.isValid = source["isValid"];
	        this.industry = source["industry"];
	        this.entityTag = this.convertValues(source["entityTag"], Object);
	        this.beneficiaryShareholdingRatio = source["beneficiaryShareholdingRatio"];
	        this.alias = source["alias"];
	        this.totalShareholdingRatio = source["totalShareholdingRatio"];
	        this.isShellCompany = source["isShellCompany"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class RegStatusLabel {
	    companyId: number;
	    profileTagId: number;
	    profileTagTypeId: number;
	    profileTagNameOnPage: string;
	    profileTagLogo: string;
	    borderTransparency: string;
	    guideTransparency: string;
	    borderWidth: string;
	    borderColor: string;
	    guideColor: string;
	    fontSize: number;
	    fontFamily: string;
	    color: string;
	    background: string;
	
	    static createFrom(source: any = {}) {
	        return new RegStatusLabel(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.companyId = source["companyId"];
	        this.profileTagId = source["profileTagId"];
	        this.profileTagTypeId = source["profileTagTypeId"];
	        this.profileTagNameOnPage = source["profileTagNameOnPage"];
	        this.profileTagLogo = source["profileTagLogo"];
	        this.borderTransparency = source["borderTransparency"];
	        this.guideTransparency = source["guideTransparency"];
	        this.borderWidth = source["borderWidth"];
	        this.borderColor = source["borderColor"];
	        this.guideColor = source["guideColor"];
	        this.fontSize = source["fontSize"];
	        this.fontFamily = source["fontFamily"];
	        this.color = source["color"];
	        this.background = source["background"];
	    }
	}
	export class SearchCompanyV4Item {
	    id: number;
	    name: string;
	    type: number;
	    matchType: any;
	    base: string;
	    legalPersonName: string;
	    estiblishTime: string;
	    regCapital: string;
	    regStatus: string;
	    score: any;
	    orginalScore: any;
	    bonusScore: any;
	    companyScore: any;
	    historyNames: string;
	    categoryCode: string;
	    industry: any;
	    humanNames: any;
	    trademarks: any;
	    tmList: any;
	    productList: any;
	    usedBondName: any;
	    bondName: any;
	    bondNum: any;
	    bondType: any;
	    newtestName: any;
	    regNumber: string;
	    orgNumber: string;
	    creditCode: string;
	    businessScope: string;
	    regLocation: string;
	    phone: any;
	    phoneList: string[];
	    phoneInfoList: any;
	    businessItemList: any;
	    phoneNum: string;
	    logo: string;
	    city: string;
	    district: any;
	    emails: any;
	    emailList: any;
	    websites: string;
	    hiddenPhones: any;
	    abbr: any;
	    tagList: any;
	    companyType: number;
	    companyOrgType: any;
	    labelList: any;
	    matchField: any;
	    latitude: any;
	    longitude: any;
	    legalPersonId: string;
	    legalPersonType: string;
	    distance: any;
	    categoryStr: any;
	    isClaimed: number;
	    claimPkgType: any;
	    realClaimPkgType: any;
	    baiduUrl: any;
	    isBranch: number;
	    alias: string;
	    claimInfo: any;
	    hidden: number;
	    legalPersonShowStr: string;
	    regCapitalShowStr: string;
	    estiblishTimeShowStr: string;
	    multiMatchField: any[];
	    labelListV2: any;
	    labelJsonList: any;
	    taxCode: string;
	    socialSecurityStaff_num: any;
	    categoryCodeStd: any;
	    hasMorePhone: any;
	    hasVideo: any;
	    videoId: any;
	    isRecommend: any;
	    englishName: any;
	    firstPositionShowStr: string;
	    secondPositionShowStr: string;
	    firstPositionValue: string;
	    secondPositionValue: string;
	    bizType: string;
	    docFeature: string;
	    companyNum: any;
	    department: string;
	    illegalType: string;
	    targetGid: string;
	    targetName: string;
	    changeTime: string;
	    isIn: string;
	    mainId: string;
	    targetRegCapitalAmount: string;
	    targetRegCapitalCurrency: string;
	    legalPerson: string;
	    gidForB: string;
	    geoLocation: any;
	    websiteFilingCount: number;
	    repCurrency: any;
	    province: any;
	    areaCodes: any;
	    address: any;
	    establishmentTime: string;
	    icps: any;
	    icp: string;
	    changeRatio: string;
	    afterRatio: string;
	    changeAmt: string;
	    registerInstitute: string;
	    companyScale: any;
	    abstractsBaseInfo: string;
	    financingRound: string;
	    staffNumReportYear: any;
	    categoryCode2017List: any;
	    institutionTypeList: any;
	    companyBrandInfo: any;
	    companyGroupInfo: any;
	    contantMap: any;
	    companyPhoneBook: any;
	    companyQuestions: any;
	    selfRiskCount: any;
	    legalPersonLogo: any;
	    legalPersonAlias: any;
	    relatedRiskCount: any;
	    historyRiskCount: any;
	    followLabel: any;
	    contentType: number;
	    normalWord: any;
	    suggestWordList: any;
	    companyHumanInfo: any;
	    phoneType: any;
	    phoneTips: any;
	    publicSentimentNewsInfo: any;
	    enterpriseServiceGoodsInfo: any;
	    qfLabels: any;
	    productShowMore: any;
	    goodsAndProducts: any;
	    shortVideoList: any;
	    focusCompanyList: any;
	    isBrandArea: number;
	    areaType: number;
	    customizedImagePath: string;
	    isBrandAreaControlGroup: number;
	    adsFlag: any;
	    isCooperationShow: any;
	    cooperationUrl: string;
	    albumHeadImgPath: any;
	    albumCount: any;
	    websiteUrl: any;
	    websiteRiskType: number;
	    hotMsg: any;
	    hotType: any;
	    competitorName: any;
	    brandInstitutionGroupCard: any;
	    publishDemandCard: any;
	    appDynamicCompanyCard: any;
	    emptyRecommendTextCard: any;
	    emptyRecommendCompanyCard: any;
	    recommendScene: any;
	    companyBrand: any;
	    companyGroup: any;
	    institutionCard: any;
	    verticalCard: any;
	    phoneTagType: number;
	    aladdinCompanyCard: any;
	    illegalSocialOrganization: any;
	    labelListV3: LabelListV3[];
	    regStatusLabel: RegStatusLabel[];
	    newlyCompanyCard: any;
	    deepSearchCard: any;
	    legalPersonForList: string;
	    regCapitalForList: string;
	    provinceName: string;
	    cityName: string;
	    districtName: string;
	    categoryNameLv1: any;
	    categoryNameLv2: any;
	    categoryNameLv3: any;
	    categoryNameLv4: any;
	    orgType: string;
	    approveDate: string;
	    businessTerm: string;
	    socialSecurityStaffNum: string;
	    companyScaleInfo: any;
	    // Go type: struct { Status int "json:\"status\""; TagID interface {} "json:\"tagId\""; TagName interface {} "json:\"tagName\"" }
	    followInfo: any;
	    englishNameForTab: string;
	
	    static createFrom(source: any = {}) {
	        return new SearchCompanyV4Item(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.type = source["type"];
	        this.matchType = source["matchType"];
	        this.base = source["base"];
	        this.legalPersonName = source["legalPersonName"];
	        this.estiblishTime = source["estiblishTime"];
	        this.regCapital = source["regCapital"];
	        this.regStatus = source["regStatus"];
	        this.score = source["score"];
	        this.orginalScore = source["orginalScore"];
	        this.bonusScore = source["bonusScore"];
	        this.companyScore = source["companyScore"];
	        this.historyNames = source["historyNames"];
	        this.categoryCode = source["categoryCode"];
	        this.industry = source["industry"];
	        this.humanNames = source["humanNames"];
	        this.trademarks = source["trademarks"];
	        this.tmList = source["tmList"];
	        this.productList = source["productList"];
	        this.usedBondName = source["usedBondName"];
	        this.bondName = source["bondName"];
	        this.bondNum = source["bondNum"];
	        this.bondType = source["bondType"];
	        this.newtestName = source["newtestName"];
	        this.regNumber = source["regNumber"];
	        this.orgNumber = source["orgNumber"];
	        this.creditCode = source["creditCode"];
	        this.businessScope = source["businessScope"];
	        this.regLocation = source["regLocation"];
	        this.phone = source["phone"];
	        this.phoneList = source["phoneList"];
	        this.phoneInfoList = source["phoneInfoList"];
	        this.businessItemList = source["businessItemList"];
	        this.phoneNum = source["phoneNum"];
	        this.logo = source["logo"];
	        this.city = source["city"];
	        this.district = source["district"];
	        this.emails = source["emails"];
	        this.emailList = source["emailList"];
	        this.websites = source["websites"];
	        this.hiddenPhones = source["hiddenPhones"];
	        this.abbr = source["abbr"];
	        this.tagList = source["tagList"];
	        this.companyType = source["companyType"];
	        this.companyOrgType = source["companyOrgType"];
	        this.labelList = source["labelList"];
	        this.matchField = source["matchField"];
	        this.latitude = source["latitude"];
	        this.longitude = source["longitude"];
	        this.legalPersonId = source["legalPersonId"];
	        this.legalPersonType = source["legalPersonType"];
	        this.distance = source["distance"];
	        this.categoryStr = source["categoryStr"];
	        this.isClaimed = source["isClaimed"];
	        this.claimPkgType = source["claimPkgType"];
	        this.realClaimPkgType = source["realClaimPkgType"];
	        this.baiduUrl = source["baiduUrl"];
	        this.isBranch = source["isBranch"];
	        this.alias = source["alias"];
	        this.claimInfo = source["claimInfo"];
	        this.hidden = source["hidden"];
	        this.legalPersonShowStr = source["legalPersonShowStr"];
	        this.regCapitalShowStr = source["regCapitalShowStr"];
	        this.estiblishTimeShowStr = source["estiblishTimeShowStr"];
	        this.multiMatchField = source["multiMatchField"];
	        this.labelListV2 = source["labelListV2"];
	        this.labelJsonList = source["labelJsonList"];
	        this.taxCode = source["taxCode"];
	        this.socialSecurityStaff_num = source["socialSecurityStaff_num"];
	        this.categoryCodeStd = source["categoryCodeStd"];
	        this.hasMorePhone = source["hasMorePhone"];
	        this.hasVideo = source["hasVideo"];
	        this.videoId = source["videoId"];
	        this.isRecommend = source["isRecommend"];
	        this.englishName = source["englishName"];
	        this.firstPositionShowStr = source["firstPositionShowStr"];
	        this.secondPositionShowStr = source["secondPositionShowStr"];
	        this.firstPositionValue = source["firstPositionValue"];
	        this.secondPositionValue = source["secondPositionValue"];
	        this.bizType = source["bizType"];
	        this.docFeature = source["docFeature"];
	        this.companyNum = source["companyNum"];
	        this.department = source["department"];
	        this.illegalType = source["illegalType"];
	        this.targetGid = source["targetGid"];
	        this.targetName = source["targetName"];
	        this.changeTime = source["changeTime"];
	        this.isIn = source["isIn"];
	        this.mainId = source["mainId"];
	        this.targetRegCapitalAmount = source["targetRegCapitalAmount"];
	        this.targetRegCapitalCurrency = source["targetRegCapitalCurrency"];
	        this.legalPerson = source["legalPerson"];
	        this.gidForB = source["gidForB"];
	        this.geoLocation = source["geoLocation"];
	        this.websiteFilingCount = source["websiteFilingCount"];
	        this.repCurrency = source["repCurrency"];
	        this.province = source["province"];
	        this.areaCodes = source["areaCodes"];
	        this.address = source["address"];
	        this.establishmentTime = source["establishmentTime"];
	        this.icps = source["icps"];
	        this.icp = source["icp"];
	        this.changeRatio = source["changeRatio"];
	        this.afterRatio = source["afterRatio"];
	        this.changeAmt = source["changeAmt"];
	        this.registerInstitute = source["registerInstitute"];
	        this.companyScale = source["companyScale"];
	        this.abstractsBaseInfo = source["abstractsBaseInfo"];
	        this.financingRound = source["financingRound"];
	        this.staffNumReportYear = source["staffNumReportYear"];
	        this.categoryCode2017List = source["categoryCode2017List"];
	        this.institutionTypeList = source["institutionTypeList"];
	        this.companyBrandInfo = source["companyBrandInfo"];
	        this.companyGroupInfo = source["companyGroupInfo"];
	        this.contantMap = source["contantMap"];
	        this.companyPhoneBook = source["companyPhoneBook"];
	        this.companyQuestions = source["companyQuestions"];
	        this.selfRiskCount = source["selfRiskCount"];
	        this.legalPersonLogo = source["legalPersonLogo"];
	        this.legalPersonAlias = source["legalPersonAlias"];
	        this.relatedRiskCount = source["relatedRiskCount"];
	        this.historyRiskCount = source["historyRiskCount"];
	        this.followLabel = source["followLabel"];
	        this.contentType = source["contentType"];
	        this.normalWord = source["normalWord"];
	        this.suggestWordList = source["suggestWordList"];
	        this.companyHumanInfo = source["companyHumanInfo"];
	        this.phoneType = source["phoneType"];
	        this.phoneTips = source["phoneTips"];
	        this.publicSentimentNewsInfo = source["publicSentimentNewsInfo"];
	        this.enterpriseServiceGoodsInfo = source["enterpriseServiceGoodsInfo"];
	        this.qfLabels = source["qfLabels"];
	        this.productShowMore = source["productShowMore"];
	        this.goodsAndProducts = source["goodsAndProducts"];
	        this.shortVideoList = source["shortVideoList"];
	        this.focusCompanyList = source["focusCompanyList"];
	        this.isBrandArea = source["isBrandArea"];
	        this.areaType = source["areaType"];
	        this.customizedImagePath = source["customizedImagePath"];
	        this.isBrandAreaControlGroup = source["isBrandAreaControlGroup"];
	        this.adsFlag = source["adsFlag"];
	        this.isCooperationShow = source["isCooperationShow"];
	        this.cooperationUrl = source["cooperationUrl"];
	        this.albumHeadImgPath = source["albumHeadImgPath"];
	        this.albumCount = source["albumCount"];
	        this.websiteUrl = source["websiteUrl"];
	        this.websiteRiskType = source["websiteRiskType"];
	        this.hotMsg = source["hotMsg"];
	        this.hotType = source["hotType"];
	        this.competitorName = source["competitorName"];
	        this.brandInstitutionGroupCard = source["brandInstitutionGroupCard"];
	        this.publishDemandCard = source["publishDemandCard"];
	        this.appDynamicCompanyCard = source["appDynamicCompanyCard"];
	        this.emptyRecommendTextCard = source["emptyRecommendTextCard"];
	        this.emptyRecommendCompanyCard = source["emptyRecommendCompanyCard"];
	        this.recommendScene = source["recommendScene"];
	        this.companyBrand = source["companyBrand"];
	        this.companyGroup = source["companyGroup"];
	        this.institutionCard = source["institutionCard"];
	        this.verticalCard = source["verticalCard"];
	        this.phoneTagType = source["phoneTagType"];
	        this.aladdinCompanyCard = source["aladdinCompanyCard"];
	        this.illegalSocialOrganization = source["illegalSocialOrganization"];
	        this.labelListV3 = this.convertValues(source["labelListV3"], LabelListV3);
	        this.regStatusLabel = this.convertValues(source["regStatusLabel"], RegStatusLabel);
	        this.newlyCompanyCard = source["newlyCompanyCard"];
	        this.deepSearchCard = source["deepSearchCard"];
	        this.legalPersonForList = source["legalPersonForList"];
	        this.regCapitalForList = source["regCapitalForList"];
	        this.provinceName = source["provinceName"];
	        this.cityName = source["cityName"];
	        this.districtName = source["districtName"];
	        this.categoryNameLv1 = source["categoryNameLv1"];
	        this.categoryNameLv2 = source["categoryNameLv2"];
	        this.categoryNameLv3 = source["categoryNameLv3"];
	        this.categoryNameLv4 = source["categoryNameLv4"];
	        this.orgType = source["orgType"];
	        this.approveDate = source["approveDate"];
	        this.businessTerm = source["businessTerm"];
	        this.socialSecurityStaffNum = source["socialSecurityStaffNum"];
	        this.companyScaleInfo = source["companyScaleInfo"];
	        this.followInfo = this.convertValues(source["followInfo"], Object);
	        this.englishNameForTab = source["englishNameForTab"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class SuggestItem {
	    id: number;
	    graphId: string;
	    type: number;
	    matchType: string;
	    comName: string;
	    name: string;
	    alias: string;
	    logo: string;
	    regStatus: number;
	    taxCode: string;
	    promptContent: any;
	    label: any;
	    sourceName: any;
	    sourceUrl: any;
	
	    static createFrom(source: any = {}) {
	        return new SuggestItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.graphId = source["graphId"];
	        this.type = source["type"];
	        this.matchType = source["matchType"];
	        this.comName = source["comName"];
	        this.name = source["name"];
	        this.alias = source["alias"];
	        this.logo = source["logo"];
	        this.regStatus = source["regStatus"];
	        this.taxCode = source["taxCode"];
	        this.promptContent = source["promptContent"];
	        this.label = source["label"];
	        this.sourceName = source["sourceName"];
	        this.sourceUrl = source["sourceUrl"];
	    }
	}

}

export namespace wechat {
	
	export class Info {
	    Nickname: string;
	    Username: string;
	    Description: string;
	    Avatar: string;
	    UsesCount: string;
	    PrincipalName: string;
	    AppID: string;
	
	    static createFrom(source: any = {}) {
	        return new Info(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Nickname = source["Nickname"];
	        this.Username = source["Username"];
	        this.Description = source["Description"];
	        this.Avatar = source["Avatar"];
	        this.UsesCount = source["UsesCount"];
	        this.PrincipalName = source["PrincipalName"];
	        this.AppID = source["AppID"];
	    }
	}
	export class VersionTaskStatus {
	    Number: string;
	    DecompileStatus: number;
	    MatchStatus: number;
	    Message: string;
	
	    static createFrom(source: any = {}) {
	        return new VersionTaskStatus(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Number = source["Number"];
	        this.DecompileStatus = source["DecompileStatus"];
	        this.MatchStatus = source["MatchStatus"];
	        this.Message = source["Message"];
	    }
	}
	export class InfoToFront {
	    AppID: string;
	    UpdateDate: string;
	    Info?: Info;
	    Status: number;
	    Versions: VersionTaskStatus[];
	
	    static createFrom(source: any = {}) {
	        return new InfoToFront(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.AppID = source["AppID"];
	        this.UpdateDate = source["UpdateDate"];
	        this.Info = this.convertValues(source["Info"], Info);
	        this.Status = source["Status"];
	        this.Versions = this.convertValues(source["Versions"], VersionTaskStatus);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

