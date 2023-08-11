package websockets

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type OTP struct {
	Key     string
	Created time.Time
}

type RetentionMap map[string]OTP

func NewRetentionMap(ctx context.Context, retentionPeriod time.Duration) RetentionMap {
	retentionMap := make(RetentionMap)

	go retentionMap.Retention(ctx, retentionPeriod)

	return retentionMap
}

func (retentionMap RetentionMap) NewOTP() OTP {
	oneTimePassword := OTP{
		Key:     uuid.NewString(),
		Created: time.Now(),
	}

	retentionMap[oneTimePassword.Key] = oneTimePassword
	return oneTimePassword
}

func (retentionMap RetentionMap) VerifyOTP(otp string) bool {
	if _, ok := retentionMap[otp]; !ok {
		return false
	}
	// delete(retentionMap, otp)
	return true
}

func (retentionMap RetentionMap) Retention(ctx context.Context, retentionPeriod time.Duration) {
	ticker := time.NewTicker(600 * time.Millisecond)
	for {
		select {
		case <-ticker.C:
			for _, otp := range retentionMap {
				if otp.Created.Add(retentionPeriod).Before(time.Now()) {
					delete(retentionMap, otp.Key)
				}
			}
		case <-ctx.Done():
			return

		}
	}
}
