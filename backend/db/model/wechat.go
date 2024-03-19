package model

import "fine/backend/service/model"

type MiniProgram struct {
	*BaseModel
	decryptedWxapkgFile     string
	decryptedSubWxapkgFile  model.StringArray
	decompiledWxapkgFile    string
	decompiledSubWxapkgFile model.StringArray
}
