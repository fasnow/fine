package application

import (
	"context"
	"fmt"
	"testing"
	"time"
)

func TestContext(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	chan1 := make(chan int, 3)
	chan2 := make(chan int, 3)
	go func() {
		for {
			select {
			case data, ok := <-chan1:
				if !ok {
					fmt.Println(1, "return")
					return
				}
				fmt.Println(1, data)
			case <-ctx.Done():
				fmt.Println(1)
				return
			}
		}
	}()
	go func() {
		for {
			select {
			case data, ok := <-chan2:
				if !ok {
					fmt.Println(2, "return")
					return
				}
				fmt.Println(2, data)
			case <-ctx.Done():
				fmt.Println(2)
				return
			}
		}
	}()
	go func() {
		for i := 0; i < 2; i++ {
			chan1 <- i
			//time.Sleep(1 * time.Second)
		}
	}()
	go func() {
		for i := 0; i < 2; i++ {
			chan2 <- i
			//time.Sleep(1 * time.Second)
		}
	}()
	go func() {
		time.Sleep(3 * time.Second)
		cancel()
	}()
	select {}
}

func TestUpdateCheck(t *testing.T) {
	checkUpdate, err := DefaultApp.CheckUpdate()
	if err != nil {
		return
	}
	t.Log(checkUpdate)
}
