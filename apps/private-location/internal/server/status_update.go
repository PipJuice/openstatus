package server

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
)

type workflowStatusUpdate struct {
	MonitorId     string `json:"monitorId"`
	Status        string `json:"status"`
	Message       string `json:"message,omitempty"`
	Region        string `json:"region"`
	CronTimestamp int64  `json:"cronTimestamp"`
	StatusCode    int    `json:"statusCode,omitempty"`
	Latency       int64  `json:"latency,omitempty"`
}

func mapRequestStatusToWorkflowStatus(requestStatus string) string {
	switch requestStatus {
	case "active", "success":
		return "active"
	case "degraded":
		return "degraded"
	default:
		return "error"
	}
}

func workflowsURL() string {
	if url := os.Getenv("WORKFLOWS_URL"); url != "" {
		return strings.TrimRight(url, "/")
	}

	return "http://workflows:3000"
}

func sendWorkflowStatusUpdate(ctx context.Context, payload workflowStatusUpdate) error {
	cronSecret := os.Getenv("CRON_SECRET")
	if cronSecret == "" {
		return fmt.Errorf("CRON_SECRET is not configured")
	}

	body := new(bytes.Buffer)
	if err := json.NewEncoder(body).Encode(payload); err != nil {
		return fmt.Errorf("encode workflow status update: %w", err)
	}

	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodPost,
		workflowsURL()+"/updateStatus",
		body,
	)
	if err != nil {
		return fmt.Errorf("create workflow status update request: %w", err)
	}

	req.Header.Set("Authorization", "Basic "+cronSecret)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("send workflow status update: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("unexpected workflow status update response: %d", resp.StatusCode)
	}

	return nil
}
