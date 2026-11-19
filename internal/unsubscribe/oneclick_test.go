package unsubscribe

import (
	"context"
	"crypto/tls"
	"crypto/x509"
	"io"
	"net"
	"net/http"
	"net/http/httptest"
	"strings"
	"syscall"
	"testing"
)

// localClient trusts srv's certificate and lets the dial reach loopback.
func localClient(srv *httptest.Server) *http.Client {
	pool := x509.NewCertPool()
	pool.AddCert(srv.Certificate())
	return newOneClickClient(clientOptions{
		dialControl: func(string, string, syscall.RawConn) error { return nil },
		tlsConfig:   &tls.Config{RootCAs: pool},
	})
}

func TestPostOneClickSendsRFC8058Body(t *testing.T) {
	var gotMethod, gotType, gotBody, gotCookie, gotUA string
	srv := httptest.NewTLSServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		b, _ := io.ReadAll(r.Body)
		gotMethod, gotType, gotBody = r.Method, r.Header.Get("Content-Type"), string(b)
		gotCookie, gotUA = r.Header.Get("Cookie"), r.Header.Get("User-Agent")
		w.WriteHeader(http.StatusOK)
	}))
	defer srv.Close()

	if err := postOneClick(context.Background(), localClient(srv), srv.URL+"/u?id=1", "Mailven/test"); err != nil {
		t.Fatalf("postOneClick: %v", err)
	}
	if gotMethod != http.MethodPost || gotType != "application/x-www-form-urlencoded" ||
		gotBody != "List-Unsubscribe=One-Click" || gotCookie != "" || gotUA != "Mailven/test" {
		t.Errorf("request = %s %q %q cookie=%q ua=%q", gotMethod, gotType, gotBody, gotCookie, gotUA)
	}
}

func TestPostOneClickFailsOnErrorStatus(t *testing.T) {
	srv := httptest.NewTLSServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
	}))
	defer srv.Close()

	err := postOneClick(context.Background(), localClient(srv), srv.URL, "")
	if err == nil || !strings.Contains(err.Error(), "500") {
		t.Fatalf("err = %v, want HTTP 500", err)
	}
}

func TestPostOneClickRefusesHTTPRedirect(t *testing.T) {
	srv := httptest.NewTLSServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, "http://example.com/done", http.StatusFound)
	}))
	defer srv.Close()

	err := postOneClick(context.Background(), localClient(srv), srv.URL, "")
	if err == nil || !strings.Contains(err.Error(), "non-https redirect") {
		t.Fatalf("err = %v, want non-https redirect refusal", err)
	}
}

func TestPostOneClickDefaultClientBlocksLocalServer(t *testing.T) {
	srv := httptest.NewTLSServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		t.Error("blocked request reached the server")
	}))
	defer srv.Close()

	err := PostOneClick(context.Background(), srv.URL, "")
	if err == nil || !strings.Contains(err.Error(), errBlockedAddress.Error()) {
		t.Fatalf("err = %v, want blocked address", err)
	}
}

func TestIsPublicIP(t *testing.T) {
	tests := map[string]bool{
		"93.184.215.14":   true,
		"2606:4700::1111": true,
		"127.0.0.1":       false,
		"::1":             false,
		"10.1.2.3":        false,
		"172.16.0.1":      false,
		"192.168.1.1":     false,
		"169.254.169.254": false,
		"100.64.0.1":      false,
		"0.0.0.0":         false,
		"198.18.0.1":      false,
		"240.0.0.1":       false,
		"fd00::1":         false,
		"fe80::1":         false,
		"::ffff:10.0.0.1": false,
	}
	for addr, want := range tests {
		if got := isPublicIP(net.ParseIP(addr)); got != want {
			t.Errorf("isPublicIP(%s) = %v, want %v", addr, got, want)
		}
	}
}
