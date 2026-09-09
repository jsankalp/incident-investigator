CREATE TABLE IF NOT EXISTS prom_metrics (
  service TEXT,
  timestamp TEXT,
  metric TEXT,
  value REAL,
  unit TEXT
);

CREATE TABLE IF NOT EXISTS loki_logs (
  service TEXT,
  timestamp TEXT,
  level TEXT,
  message TEXT
);

CREATE TABLE IF NOT EXISTS scaling_events (
  service TEXT,
  timestamp TEXT,
  type TEXT,
  previousCapacity INTEGER,
  newCapacity INTEGER,
  capacity INTEGER,
  reason TEXT
);

INSERT INTO prom_metrics (service, timestamp, metric, value, unit)
VALUES
  ('search', '14:00:00', 'http_request_duration_seconds', 190, 'ms'),
  ('search', '14:01:00', 'http_request_duration_seconds', 205, 'ms'),
  ('search', '14:02:00', 'http_request_duration_seconds', 198, 'ms'),
  ('search', '14:03:00', 'http_request_duration_seconds', 480, 'ms'),
  ('search', '14:04:00', 'http_request_duration_seconds', 720, 'ms'),
  ('search', '14:05:00', 'http_request_duration_seconds', 850, 'ms');

INSERT INTO loki_logs (service, timestamp, level, message)
VALUES
  ('search', '14:02:51', 'INFO', 'Deployment search-v42 completed'),
  ('search', '14:03:12', 'ERROR', 'Connection pool exhausted'),
  ('search', '14:03:45', 'ERROR', 'Failed to acquire database connection'),
  ('search', '14:04:02', 'ERROR', 'Request timeout while calling payment-service'),
  ('search', '14:04:31', 'ERROR', 'Request timeout while calling payment-service'),
  ('search', '14:05:17', 'ERROR', 'Request timeout while calling payment-service'),
  ('search', '14:05:42', 'ERROR', 'Request timeout while calling payment-service');

INSERT INTO scaling_events (service, timestamp, type, previousCapacity, newCapacity, capacity, reason)
VALUES
  ('search', '14:01:48', 'SCALE_OUT', 4, 8, NULL, 'CPU utilization exceeded target'),
  ('search', '14:02:18', 'TASKS_STABILIZED', NULL, NULL, 8, 'Desired task count reached'),
  ('search', '14:07:42', 'SCALE_OUT', 8, 12, NULL, 'Request count exceeded target');
