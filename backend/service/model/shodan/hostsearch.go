package shodan

import (
	"fine/backend/service/model/shodan/properties"
)

type HostSearchResult struct {
	Matches []*properties.General `json:"matches"`
	Facets  Facets                `json:"facets"`
	Total   int64                 `json:"total"`
}
