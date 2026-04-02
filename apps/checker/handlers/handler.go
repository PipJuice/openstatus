package handlers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/openstatushq/openstatus/apps/checker/pkg/tinybird"
)

type Handler struct {
	TbClient      tinybird.Client
	Secret        string
	CloudProvider string
	Region        string
}

// Authorization could be handle by middleware

func NewHTTPClient() *http.Client {
	return &http.Client{}
}

func (h Handler) resolveExecutionRegion(c *gin.Context) (string, bool) {
	if h.CloudProvider != "fly" {
		return h.Region, false
	}

	requestedRegion := c.GetHeader("fly-prefer-region")
	if requestedRegion == "" {
		return h.Region, false
	}

	// Self-hosted deployments run a single checker instance. In that mode we
	// tag the check with the requested region instead of relying on Fly replay.
	if h.Region == "self-hosted" {
		return requestedRegion, false
	}

	if requestedRegion != h.Region {
		c.Header("fly-replay", fmt.Sprintf("region=%s", requestedRegion))
		c.String(http.StatusAccepted, "Forwarding request to %s", requestedRegion)
		return "", true
	}

	return h.Region, false
}
