package matcher

import (
	"fine/backend/utils"
	"fmt"
	"regexp"
	"sync"
)

type Matcher struct {
	regexes  []string
	regexMap sync.Map
	mutex    sync.Mutex
}

func New(regexes []string) *Matcher {
	return &Matcher{
		regexes: regexes,
	}
}

func (r *Matcher) getRegex(regex string) (*regexp.Regexp, error) {
	r.mutex.Lock()
	defer r.mutex.Unlock()
	if value, ok := r.regexMap.Load(regex); ok {
		if t, ok := value.(*regexp.Regexp); ok {
			return t, nil
		}
		return nil, fmt.Errorf("unexpected type in regexMap for key %s", regex)
	}
	compiled, err := regexp.Compile(regex)
	if err != nil {
		return nil, err
	}
	r.regexMap.Store(regex, compiled)
	return compiled, nil
}

func (r *Matcher) SetRegex(regexes []string) {
	r.mutex.Lock()
	defer r.mutex.Unlock()
	r.regexes = regexes
}

func (r *Matcher) FindAll(content string) []string {
	var matchedStrings []string
	for _, regex := range r.regexes {
		re, err := r.getRegex(regex)
		if err != nil {
			continue
		}
		matches := re.FindAllStringSubmatch(content, -1)
		for _, match := range matches {
			matchedStrings = append(matchedStrings, match[0])
		}
	}
	return utils.RemoveEmptyAndDuplicateString(matchedStrings)
}
