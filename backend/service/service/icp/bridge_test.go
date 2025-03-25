package icp

import (
	"context"
	"encoding/json"
	"fine/backend/application"
	"fine/backend/config"
	"fmt"
	"github.com/jmoiron/sqlx"
	_ "github.com/mattn/go-sqlite3"
	"log"
	"testing"
	"time"
)

func TestBridge_SetProxy(t *testing.T) {
	app := application.DefaultApp

	if result, err := app.CheckUpdate(); err != nil {
		t.Error(err)
		return
	} else {
		t.Log(result)
	}
	b := NewICPBridge(app)

	p := config.Proxy{
		Enable: true,
		Type:   "http",
		Host:   "127.0.0.1",
		Port:   "8082",
	}
	if err := b.SetProxy(p); err != nil {
		t.Error(err)
		return
	}
	p2 := config.Proxy{
		Enable: true,
		Type:   "http",
		Host:   "127.0.0.1",
		Port:   "8081",
	}
	if err := b.SetProxy(p2); err != nil {
		t.Error(err)
		return
	}
	result, err := b.Query(0, "王恕嵩", 1, 1, "1")
	if err != nil {
		t.Error(err)
		return
	}
	bytes, err := json.Marshal(result)
	if err != nil {
		return
	}
	t.Log(string(bytes))
}

func TestName(t *testing.T) {

	db, err := sqlx.Open("sqlite3", "./test.db")
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}
	defer db.Close()

	// 创建表
	_, err = db.Exec(`
        CREATE TABLE IF NOT EXISTS test_table (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            data TEXT
        )
    `)
	if err != nil {
		log.Fatalf("Failed to create table: %v", err)
	}

	// 开始计时
	start := time.Now()

	// 批量插入数据
	batchSize := 1000000
	tx, err := db.Beginx()
	if err != nil {
		log.Fatalf("Failed to start transaction: %v", err)
	}
	for i := 0; i < 6000001; i++ {
		if i%batchSize == 0 && i > 0 {
			err = tx.Commit()
			if err != nil {
				log.Fatalf("Failed to commit transaction: %v", err)
			}
			tx, err = db.Beginx()
			if err != nil {
				log.Fatalf("Failed to start new transaction: %v", err)
			}
		}
		_, err = tx.Exec("INSERT INTO test_table (data) VALUES (?)", "test data")
		if err != nil {
			log.Fatalf("Failed to insert data: %v", err)
		}
	}
	err = tx.Commit()
	if err != nil {
		log.Fatalf("Failed to commit final transaction: %v", err)
	}

	// 结束计时
	elapsed := time.Since(start)
	fmt.Printf("Inserted 1 million records in %s\n", elapsed)
}

func TestTime(t *testing.T) {
	t.Log(time.Now().Local())
}

func TestBridge_CreateTask(t *testing.T) {
	app := application.DefaultApp
	c := NewICPBridge(app)
	if err := c.TaskCreate("test", []string{"1"}, []string{"1"}); err != nil {
		t.Error(err)
		return
	}
}

func TestBridge_GetByTaskID(t *testing.T) {
	app := application.DefaultApp
	c := NewICPBridge(app)
	if r, err := c.icpTaskRepo.GetByTaskID(643309493575749, true); err != nil {
		t.Error(err)
		return
	} else {
		bytes, err := json.Marshal(r)
		if err != nil {
			return
		}
		t.Log(string(bytes))
	}
}

func TestBridge_executeTask(t *testing.T) {
	app := application.DefaultApp
	c := NewICPBridge(app)
	c.TaskRun(647116238929989)
	select {}
}

// CancelableSleep 封装支持取消的 Sleep 操作
func CancelableSleep(ctx context.Context, duration time.Duration) error {
	// 创建一个定时器，用于模拟 Sleep
	timer := time.NewTimer(duration)
	defer timer.Stop()

	go func() {
		time.Sleep(5 * time.Second)
		fmt.Println(1111)
	}()
	// 使用 select 语句监听上下文的取消信号和定时器到期信号
	select {
	case <-ctx.Done():
		return ctx.Err()
	}
}

func TestBridge_Context(t *testing.T) {
	//// 创建一个可取消的上下文
	//ctx, cancel := context.WithCancel(context.Background())
	//
	//// 启动一个协程，模拟一段时间后取消上下文
	//go func() {
	//	time.Sleep(3 * time.Second)
	//	cancel()
	//}()
	//
	//// 执行支持取消的 Sleep 操作
	//err := CancelableSleep(ctx, 3*time.Second)
	//if err != nil {
	//	if err == context.Canceled {
	//		fmt.Println("Sleep 被取消:", err)
	//	} else {
	//		fmt.Println("发生其他错误:", err)
	//	}
	//} else {
	//	fmt.Println("Sleep 完成")
	//}
	//select {}
	t.Log(time.Duration(time.Since(time.Now()).Seconds()))
}

func TestBridge_Query(t *testing.T) {
	c := NewICPBridge(application.DefaultApp)
	data, err := c.Query(0, "中国邮政集团有限公司芜湖市分公司", 1, 1, "1")
	if err != nil {
		t.Error(err)
		return
	}
	t.Log(data)
}

func TestTask(t *testing.T) {
	c := NewICPBridge(application.DefaultApp)
	c.SetProxy(config.Proxy{
		Enable: true,
		Type:   "http",
		Host:   "127.0.0.1",
		Port:   "8081",
		User:   "",
		Pass:   "",
	})
	if err := c.TaskRun(648556981796933); err != nil {
		t.Error(err)
		return
	}
	time.Sleep(500 * time.Millisecond)
	if err := c.TaskPause(648556981796933); err != nil {
		t.Error(err)
		return
	}
	select {}
}
