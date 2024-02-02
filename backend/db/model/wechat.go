package model

import "fine/backend/sdk/model"

type MiniProgram struct {
	*BaseModel
	decryptedWxapkgFile     string
	decryptedSubWxapkgFile  model.StringArray
	decompiledWxapkgFile    string
	decompiledSubWxapkgFile model.StringArray
}
