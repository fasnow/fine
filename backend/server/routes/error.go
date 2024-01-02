package routes

import "errors"

var (
	UnableToAccessUpdatesError = errors.New("暂无法获取更新,请稍后再试")
	ErrorEmptyUUID             = errors.New("id为空")
	ErrorExportPage            = errors.New("无效的导出页数")
	ErrorExportSize            = errors.New("无效的分页大小")
	ErrorEmptyAuth             = errors.New("未配置认证信息")
	ErrorEmptyCache            = errors.New("重新查询后再执行导出")
)
