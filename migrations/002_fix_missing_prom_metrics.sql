CREATE TABLE IF NOT EXISTS prom_metrics (
  service TEXT,
  timestamp TEXT,
  metric TEXT,
  value REAL,
  unit TEXT
);

INSERT INTO prom_metrics (service, timestamp, metric, value, unit)
VALUES
  ('search', '14:00:00', 'http_request_duration_seconds', 190, 'ms'),
  ('search', '14:01:00', 'http_request_duration_seconds', 205, 'ms'),
  ('search', '14:02:00', 'http_request_duration_seconds', 198, 'ms'),
  ('search', '14:03:00', 'http_request_duration_seconds', 480, 'ms'),
  ('search', '14:04:00', 'http_request_duration_seconds', 720, 'ms'),
  ('search', '14:05:00', 'http_request_duration_seconds', 850, 'ms')
ON CONFLICT DO NOTHING;
