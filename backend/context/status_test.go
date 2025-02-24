package context

import (
	"errors"
	"fmt"
	"testing"
	"time"
)

func TestContext(t *testing.T) {
	ctx := NewStatusContext()
	go func() {
		time.Sleep(1 * time.Second)
		for {
			select {
			case <-ctx.Stop():
				fmt.Println("Stop")
				time.Sleep(3 * time.Second)
			case <-ctx.Pausing():
				fmt.Println("Pausing")
				time.Sleep(3 * time.Second)
			case <-ctx.Paused():
				fmt.Println("Paused")
				time.Sleep(3 * time.Second)
			case <-ctx.Error():
				t.Log(ctx.Err)
				time.Sleep(3 * time.Second)
			default:
				fmt.Println("Sleep")
				time.Sleep(3 * time.Second)
			}
		}
	}()

	go func() {
		time.Sleep(1 * time.Second)
		ctx.SendPausing()
		time.Sleep(5 * time.Second)
		ctx.SendPause()
		time.Sleep(5 * time.Second)
		ctx.SendError(errors.New("111111"))
	}()
	select {}
}
