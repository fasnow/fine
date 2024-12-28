package backend

import (
	"github.com/yitter/idgenerator-go/idgen"
)

func init() {
	// 创建 IdGeneratorOptions 对象，可在构造函数中输入 WorkerId：
	var idgenOpts = idgen.NewIdGeneratorOptions(1)
	// options.WorkerIdBitLength = 10  // 默认值6，限定 WorkerId 最大值为2^6-1，即默认最多支持64个节点。
	// options.SeqBitLength = 6; // 默认值6，限制每毫秒生成的ID个数。若生成速度超过5万个/秒，建议加大 SeqBitLength 到 10。
	// options.BaseTime = Your_Base_Time // 如果要兼容老系统的雪花算法，此处应设置为老系统的BaseTime。
	// ...... 其它参数参考 IdGeneratorOptions 定义。
	// 保存参数（务必调用，否则参数设置不生效）：
	idgen.SetIdGenerator(idgenOpts)
}
