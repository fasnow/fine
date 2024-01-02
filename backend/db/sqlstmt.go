package db

const downloadLog = `
		CREATE TABLE IF NOT EXISTS download_log (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			dir TEXT,
			filename TEXT
		);
	`
const creatFofaExportTable = `
		CREATE TABLE IF NOT EXISTS fofa_export (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			token TEXT not null ,
			ip TEXT,
			port TEXT,
			protocol TEXT,
			country TEXT,
			country_name TEXT,
			region TEXT,
			city TEXT,
			longitude TEXT,
			latitude TEXT,
			as_number TEXT,
			as_organization TEXT,
			host TEXT,
			domain TEXT,
			os TEXT,
			server TEXT,
			icp TEXT,
			title TEXT,
			jarm TEXT,
			header TEXT,
			banner TEXT,
			cert TEXT,
			base_protocol TEXT,
			link TEXT,
			product TEXT,
			product_category TEXT,
			version TEXT,
			lastupdatetime TEXT,
			cname TEXT,
			icon_hash TEXT,
			certs_valid TEXT,
			cname_domain TEXT,
			body TEXT,
			icon TEXT,
			fid TEXT,
			structinfo TEXT
		);
	`
const creatHunterExportTable = `
		CREATE TABLE IF NOT EXISTS hunter_export (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			token TEXT not null ,
			domain TEXT,
			port TEXT,
			ip TEXT,
			url TEXT,
			protocol TEXT,
			title TEXT,
			status_code TEXT,
			company TEXT,
			components TEXT,
			icp TEXT,
			os TEXT,
			banner TEXT,
			is_risk TEXT,
			is_web TEXT,
			country TEXT,
			province TEXT,
			city TEXT,
			as_org TEXT,
			isp TEXT,
			updated_at TEXT
		);
	`
const creatQuakeExportTable = `
		CREATE TABLE IF NOT EXISTS quake_export (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			token TEXT,
			components TEXT,
			org TEXT,
			ip TEXT,
			os_version TEXT,
			is_ipv6 INTEGER,
			transport TEXT,
			hostname TEXT,
			port INTEGER,
			service TEXT,
			domain TEXT,
			os_name TEXT,
			location TEXT,
			time TEXT,
			asn INTEGER
		);
	`
const creatZoneSiteExportTable = `
		CREATE TABLE IF NOT EXISTS zone_site_export (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			token TEXT,
			ip TEXT,
			port TEXT,
			url TEXT,
			title TEXT,
			status_code TEXT,
			cms TEXT,
			continent TEXT,
			country TEXT,
			province TEXT,
			city TEXT,
			operator TEXT,
			banner TEXT,
			html_banner TEXT,
			'group' TEXT,
			beian TEXT,
			is_cdn INTEGER,
			ssl_certificate TEXT,
			service TEXT
		);
	`
const creatZoneApkExportTable = `
		CREATE TABLE IF NOT EXISTS zone_apk_export (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			token TEXT,
			title TEXT,
			company TEXT,
			type TEXT,
			source TEXT,
			timestamp TEXT,
			msg TEXT
		);
	`
const creatZoneMemberExportTable = `
		CREATE TABLE IF NOT EXISTS zone_member_export (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			token TEXT,
			name TEXT,
			position TEXT,
			introduction TEXT,
			source TEXT,
			timestamp TEXT,
			company TEXT
		);
	`
const creatZoneDomainExportTable = `
		CREATE TABLE IF NOT EXISTS zone_domain_export (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			token TEXT,
			ip TEXT,
			icp TEXT,
			company TEXT,
			url TEXT
		);
	`
const creatZoneEmailExportTable = `
		CREATE TABLE IF NOT EXISTS zone_email_export (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			token TEXT,
			email TEXT,
			email_type TEXT,
			'group' TEXT,
			source TEXT,
			timestamp TEXT
		);
	`
const creatZoneCodeExportTable = `
		CREATE TABLE IF NOT EXISTS zone_code_export (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			token TEXT,
			_id TEXT,
			name TEXT,
			path TEXT,
			url TEXT,
			sha TEXT,
			keyword TEXT,
			tags TEXT,
			file_extension TEXT,
			source TEXT,
			code_detail TEXT,
			score TEXT,
			type TEXT,
			created_time TEXT,
			timestamp TEXT,
			owner TEXT,
			repository TEXT,
			detail_parsing TEXT,
			timestamp_update TEXT,
			related_company TEXT
		);
	`
const creatZoneDarknetExportTable = `
		CREATE TABLE IF NOT EXISTS zone_darknet_export (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			token TEXT,
			_id TEXT,
			body_md5 TEXT,
			msg TEXT,
			status_code INTEGER,
			regions TEXT,
			org TEXT,
			page_type TEXT,
			root_domain TEXT,
			detail_parsing TEXT,
			to_new TEXT,
			description TEXT,
			industry TEXT,
			language TEXT,
			source TEXT,
			title TEXT,
			hot TEXT,
			url TEXT,
			tags TEXT,
			path TEXT,
			update_time TEXT,
			toplv_domain TEXT,
			user_id TEXT,
			event TEXT,
			timestamp TEXT
		);
	`
const creatZoneAimExportTable = `
		CREATE TABLE IF NOT EXISTS zone_aim_export (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			token TEXT,
			_index TEXT,
			_type TEXT,
			_id TEXT,
			_score TEXT,
			_ignored TEXT,
			_source TEXT,
			sort TEXT
		);
	`
