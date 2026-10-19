// Package rowfault provides a real SQLite connection whose matching queries
// fail during iteration, after a specified number of successfully read rows.
// It is intended for store regression tests, not application connections.
package rowfault

import (
	"context"
	"database/sql"
	"database/sql/driver"

	"modernc.org/sqlite"
)

// Open opens dsn with an iteration fault for queries accepted by match.
// All writes and nonmatching queries use the real SQLite driver.
func Open(dsn string, match func(string) bool, after int, fault error) *sql.DB {
	return sql.OpenDB(&connector{dsn: dsn, match: match, after: after, fault: fault})
}

type connector struct {
	dsn   string
	match func(string) bool
	after int
	fault error
}

func (c *connector) Driver() driver.Driver { return &sqlite.Driver{} }
func (c *connector) Connect(context.Context) (driver.Conn, error) {
	conn, err := c.Driver().Open(c.dsn)
	if err != nil {
		return nil, err
	}
	return &connection{Conn: conn, config: c}, nil
}

type connection struct {
	driver.Conn
	config *connector
}

func (c *connection) QueryContext(ctx context.Context, query string, args []driver.NamedValue) (driver.Rows, error) {
	rows, err := c.Conn.(driver.QueryerContext).QueryContext(ctx, query, args)
	if err != nil {
		return nil, err
	}
	if c.config.match(query) {
		return &faultRows{Rows: rows, remaining: c.config.after, fault: c.config.fault}, nil
	}
	return rows, nil
}

func (c *connection) ExecContext(ctx context.Context, query string, args []driver.NamedValue) (driver.Result, error) {
	return c.Conn.(driver.ExecerContext).ExecContext(ctx, query, args)
}

func (c *connection) BeginTx(ctx context.Context, opts driver.TxOptions) (driver.Tx, error) {
	return c.Conn.(driver.ConnBeginTx).BeginTx(ctx, opts)
}

type faultRows struct {
	driver.Rows
	remaining int
	fault     error
}

func (r *faultRows) Next(dest []driver.Value) error {
	if r.remaining == 0 {
		return r.fault
	}
	if err := r.Rows.Next(dest); err != nil {
		return err
	}
	r.remaining--
	return nil
}
