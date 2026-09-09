CREATE TABLE IF NOT EXISTS prom_metrics (
  service TEXT,
  date TEXT,
  timestamp TEXT,
  metric TEXT,
  value REAL,
  unit TEXT
);

INSERT INTO prom_metrics
(service, date, timestamp, metric, value, unit)
VALUES

-- ==========================================================
-- SEARCH - healthy 
-- ==========================================================
('search', '2026-09-09', '14:00:00', 'http_request_duration_seconds', 190, 'ms'),
('search', '2026-09-09', '14:01:00', 'http_request_duration_seconds', 205, 'ms'),
('search', '2026-09-09', '14:02:00', 'http_request_duration_seconds', 198, 'ms'),

('search', '2026-09-09', '14:00:00', 'request_count', 8200, 'req/min'),
('search', '2026-09-09', '14:01:00', 'request_count', 8400, 'req/min'),
('search', '2026-09-09', '14:02:00', 'request_count', 8500, 'req/min'),

('search', '2026-09-09', '14:00:00', 'cpu_utilization', 48, '%'),
('search', '2026-09-09', '14:01:00', 'cpu_utilization', 51, '%'),
('search', '2026-09-09', '14:02:00', 'cpu_utilization', 52, '%'),

-- Search degradation
('search', '2026-09-09', '14:03:00', 'http_request_duration_seconds', 480, 'ms'),
('search', '2026-09-09', '14:04:00', 'http_request_duration_seconds', 720, 'ms'),
('search', '2026-09-09', '14:05:00', 'http_request_duration_seconds', 850, 'ms'),
('search', '2026-09-09', '14:06:00', 'http_request_duration_seconds', 1100, 'ms'),
('search', '2026-09-09', '14:07:00', 'http_request_duration_seconds', 1280, 'ms'),
('search', '2026-09-09', '14:08:00', 'http_request_duration_seconds', 980, 'ms'),

('search', '2026-09-09', '14:03:00', 'request_count', 9100, 'req/min'),
('search', '2026-09-09', '14:04:00', 'request_count', 10200, 'req/min'),
('search', '2026-09-09', '14:05:00', 'request_count', 11800, 'req/min'),
('search', '2026-09-09', '14:06:00', 'request_count', 13100, 'req/min'),
('search', '2026-09-09', '14:07:00', 'request_count', 14500, 'req/min'),
('search', '2026-09-09', '14:08:00', 'request_count', 11900, 'req/min'),

('search', '2026-09-09', '14:03:00', 'cpu_utilization', 67, '%'),
('search', '2026-09-09', '14:04:00', 'cpu_utilization', 74, '%'),
('search', '2026-09-09', '14:05:00', 'cpu_utilization', 82, '%'),
('search', '2026-09-09', '14:06:00', 'cpu_utilization', 89, '%'),
('search', '2026-09-09', '14:07:00', 'cpu_utilization', 93, '%'),
('search', '2026-09-09', '14:08:00', 'cpu_utilization', 76, '%'),

-- Search 502s
('search', '2026-09-09', '14:02:00', 'http_502_count', 2, 'count'),
('search', '2026-09-09', '14:03:00', 'http_502_count', 11, 'count'),
('search', '2026-09-09', '14:04:00', 'http_502_count', 87, 'count'),
('search', '2026-09-09', '14:05:00', 'http_502_count', 341, 'count'),
('search', '2026-09-09', '14:06:00', 'http_502_count', 590, 'count'),
('search', '2026-09-09', '14:07:00', 'http_502_count', 710, 'count'),
('search', '2026-09-09', '14:08:00', 'http_502_count', 390, 'count'),

('search', '2026-09-09', '14:02:00', 'gateway_5xx_rate', 0.1, '%'),
('search', '2026-09-09', '14:03:00', 'gateway_5xx_rate', 0.8, '%'),
('search', '2026-09-09', '14:04:00', 'gateway_5xx_rate', 4.2, '%'),
('search', '2026-09-09', '14:05:00', 'gateway_5xx_rate', 15.8, '%'),
('search', '2026-09-09', '14:06:00', 'gateway_5xx_rate', 21.4, '%'),
('search', '2026-09-09', '14:07:00', 'gateway_5xx_rate', 24.1, '%'),
('search', '2026-09-09', '14:08:00', 'gateway_5xx_rate', 11.2, '%'),


-- ==========================================================
-- CHECKOUT - shares transaction_db, therefore impacted
-- ==========================================================
('checkout', '2026-09-09', '14:00:00', 'http_request_duration_seconds', 210, 'ms'),
('checkout', '2026-09-09', '14:01:00', 'http_request_duration_seconds', 215, 'ms'),
('checkout', '2026-09-09', '14:02:00', 'http_request_duration_seconds', 220, 'ms'),
('checkout', '2026-09-09', '14:03:00', 'http_request_duration_seconds', 310, 'ms'),
('checkout', '2026-09-09', '14:04:00', 'http_request_duration_seconds', 580, 'ms'),
('checkout', '2026-09-09', '14:05:00', 'http_request_duration_seconds', 760, 'ms'),
('checkout', '2026-09-09', '14:06:00', 'http_request_duration_seconds', 910, 'ms'),
('checkout', '2026-09-09', '14:07:00', 'http_request_duration_seconds', 1040, 'ms'),
('checkout', '2026-09-09', '14:08:00', 'http_request_duration_seconds', 790, 'ms'),

('checkout', '2026-09-09', '14:02:00', 'gateway_5xx_rate', 0.1, '%'),
('checkout', '2026-09-09', '14:03:00', 'gateway_5xx_rate', 0.3, '%'),
('checkout', '2026-09-09', '14:04:00', 'gateway_5xx_rate', 2.1, '%'),
('checkout', '2026-09-09', '14:05:00', 'gateway_5xx_rate', 6.7, '%'),
('checkout', '2026-09-09', '14:06:00', 'gateway_5xx_rate', 10.2, '%'),
('checkout', '2026-09-09', '14:07:00', 'gateway_5xx_rate', 12.4, '%'),
('checkout', '2026-09-09', '14:08:00', 'gateway_5xx_rate', 5.8, '%'),


-- ==========================================================
-- CATALOG - uses analytics_db, unaffected
-- ==========================================================
('catalog', '2026-09-09', '14:00:00', 'http_request_duration_seconds', 180, 'ms'),
('catalog', '2026-09-09', '14:01:00', 'http_request_duration_seconds', 182, 'ms'),
('catalog', '2026-09-09', '14:02:00', 'http_request_duration_seconds', 184, 'ms'),
('catalog', '2026-09-09', '14:03:00', 'http_request_duration_seconds', 186, 'ms'),
('catalog', '2026-09-09', '14:04:00', 'http_request_duration_seconds', 188, 'ms'),
('catalog', '2026-09-09', '14:05:00', 'http_request_duration_seconds', 190, 'ms'),
('catalog', '2026-09-09', '14:06:00', 'http_request_duration_seconds', 187, 'ms'),
('catalog', '2026-09-09', '14:07:00', 'http_request_duration_seconds', 189, 'ms'),


-- ==========================================================
-- RECOMMENDATION - analytics_db + Redis, effectively healthy
-- ==========================================================
('recommendation', '2026-09-09', '14:00:00', 'http_request_duration_seconds', 170, 'ms'),
('recommendation', '2026-09-09', '14:01:00', 'http_request_duration_seconds', 172, 'ms'),
('recommendation', '2026-09-09', '14:02:00', 'http_request_duration_seconds', 171, 'ms'),
('recommendation', '2026-09-09', '14:03:00', 'http_request_duration_seconds', 173, 'ms'),
('recommendation', '2026-09-09', '14:04:00', 'http_request_duration_seconds', 175, 'ms'),
('recommendation', '2026-09-09', '14:05:00', 'http_request_duration_seconds', 178, 'ms'),
('recommendation', '2026-09-09', '14:06:00', 'http_request_duration_seconds', 179, 'ms'),
('recommendation', '2026-09-09', '14:07:00', 'http_request_duration_seconds', 181, 'ms'),


-- ==========================================================
-- REPORTING - analytics_db, unaffected
-- ==========================================================
('reporting', '2026-09-09', '14:00:00', 'http_request_duration_seconds', 150, 'ms'),
('reporting', '2026-09-09', '14:01:00', 'http_request_duration_seconds', 152, 'ms'),
('reporting', '2026-09-09', '14:02:00', 'http_request_duration_seconds', 151, 'ms'),
('reporting', '2026-09-09', '14:03:00', 'http_request_duration_seconds', 153, 'ms'),
('reporting', '2026-09-09', '14:04:00', 'http_request_duration_seconds', 155, 'ms'),
('reporting', '2026-09-09', '14:05:00', 'http_request_duration_seconds', 154, 'ms'),
('reporting', '2026-09-09', '14:06:00', 'http_request_duration_seconds', 152, 'ms'),
('reporting', '2026-09-09', '14:07:00', 'http_request_duration_seconds', 153, 'ms'),


-- ==========================================================
-- PAYMENT SERVICE - mostly healthy
-- ==========================================================
('payment-service', '2026-09-09', '14:00:00', 'http_request_duration_seconds', 92, 'ms'),
('payment-service', '2026-09-09', '14:01:00', 'http_request_duration_seconds', 94, 'ms'),
('payment-service', '2026-09-09', '14:02:00', 'http_request_duration_seconds', 95, 'ms'),
('payment-service', '2026-09-09', '14:03:00', 'http_request_duration_seconds', 96, 'ms'),
('payment-service', '2026-09-09', '14:04:00', 'http_request_duration_seconds', 98, 'ms'),
('payment-service', '2026-09-09', '14:05:00', 'http_request_duration_seconds', 101, 'ms'),
('payment-service', '2026-09-09', '14:06:00', 'http_request_duration_seconds', 104, 'ms'),
('payment-service', '2026-09-09', '14:07:00', 'http_request_duration_seconds', 103, 'ms'),

('payment-service', '2026-09-09', '14:00:00', 'gateway_5xx_rate', 0.2, '%'),
('payment-service', '2026-09-09', '14:03:00', 'gateway_5xx_rate', 0.3, '%'),
('payment-service', '2026-09-09', '14:05:00', 'gateway_5xx_rate', 0.4, '%'),


-- ==========================================================
-- TRANSACTION DATABASE - central degradation
-- ==========================================================
('transaction_database', '2026-09-09', '14:00:00', 'db_query_latency', 42, 'ms'),
('transaction_database', '2026-09-09', '14:01:00', 'db_query_latency', 44, 'ms'),
('transaction_database', '2026-09-09', '14:02:00', 'db_query_latency', 45, 'ms'),
('transaction_database', '2026-09-09', '14:03:00', 'db_query_latency', 380, 'ms'),
('transaction_database', '2026-09-09', '14:04:00', 'db_query_latency', 950, 'ms'),
('transaction_database', '2026-09-09', '14:05:00', 'db_query_latency', 1800, 'ms'),
('transaction_database', '2026-09-09', '14:06:00', 'db_query_latency', 2600, 'ms'),
('transaction_database', '2026-09-09', '14:07:00', 'db_query_latency', 3100, 'ms'),
('transaction_database', '2026-09-09', '14:08:00', 'db_query_latency', 1700, 'ms'),

('transaction_database', '2026-09-09', '14:00:00', 'connections_active', 52, 'connections'),
('transaction_database', '2026-09-09', '14:01:00', 'connections_active', 55, 'connections'),
('transaction_database', '2026-09-09', '14:02:00', 'connections_active', 58, 'connections'),
('transaction_database', '2026-09-09', '14:03:00', 'connections_active', 92, 'connections'),
('transaction_database', '2026-09-09', '14:04:00', 'connections_active', 118, 'connections'),
('transaction_database', '2026-09-09', '14:05:00', 'connections_active', 137, 'connections'),
('transaction_database', '2026-09-09', '14:06:00', 'connections_active', 151, 'connections'),
('transaction_database', '2026-09-09', '14:07:00', 'connections_active', 162, 'connections'),
('transaction_database', '2026-09-09', '14:08:00', 'connections_active', 121, 'connections'),

('transaction_database', '2026-09-09', '14:00:00', 'cpu_utilization', 41, '%'),
('transaction_database', '2026-09-09', '14:01:00', 'cpu_utilization', 43, '%'),
('transaction_database', '2026-09-09', '14:02:00', 'cpu_utilization', 44, '%'),
('transaction_database', '2026-09-09', '14:03:00', 'cpu_utilization', 71, '%'),
('transaction_database', '2026-09-09', '14:04:00', 'cpu_utilization', 86, '%'),
('transaction_database', '2026-09-09', '14:05:00', 'cpu_utilization', 94, '%'),
('transaction_database', '2026-09-09', '14:06:00', 'cpu_utilization', 97, '%'),
('transaction_database', '2026-09-09', '14:07:00', 'cpu_utilization', 98, '%'),
('transaction_database', '2026-09-09', '14:08:00', 'cpu_utilization', 89, '%'),

('transaction_database', '2026-09-09', '14:00:00', 'query_queue_depth', 2, 'queries'),
('transaction_database', '2026-09-09', '14:01:00', 'query_queue_depth', 3, 'queries'),
('transaction_database', '2026-09-09', '14:02:00', 'query_queue_depth', 2, 'queries'),
('transaction_database', '2026-09-09', '14:03:00', 'query_queue_depth', 14, 'queries'),
('transaction_database', '2026-09-09', '14:04:00', 'query_queue_depth', 31, 'queries'),
('transaction_database', '2026-09-09', '14:05:00', 'query_queue_depth', 57, 'queries'),
('transaction_database', '2026-09-09', '14:06:00', 'query_queue_depth', 73, 'queries'),
('transaction_database', '2026-09-09', '14:07:00', 'query_queue_depth', 91, 'queries'),
('transaction_database', '2026-09-09', '14:08:00', 'query_queue_depth', 46, 'queries'),


-- ==========================================================
-- REDIS - increased activity, but not the root cause
-- ==========================================================
('redis', '2026-09-09', '14:00:00', 'ops_per_second', 8200, 'ops/s'),
('redis', '2026-09-09', '14:01:00', 'ops_per_second', 8300, 'ops/s'),
('redis', '2026-09-09', '14:02:00', 'ops_per_second', 8400, 'ops/s'),
('redis', '2026-09-09', '14:03:00', 'ops_per_second', 9100, 'ops/s'),
('redis', '2026-09-09', '14:04:00', 'ops_per_second', 10800, 'ops/s'),
('redis', '2026-09-09', '14:05:00', 'ops_per_second', 13200, 'ops/s'),
('redis', '2026-09-09', '14:06:00', 'ops_per_second', 14500, 'ops/s'),
('redis', '2026-09-09', '14:07:00', 'ops_per_second', 15100, 'ops/s'),
('redis', '2026-09-09', '14:08:00', 'ops_per_second', 12700, 'ops/s'),

('redis', '2026-09-09', '14:00:00', 'cache_hit_ratio', 93, '%'),
('redis', '2026-09-09', '14:01:00', 'cache_hit_ratio', 93, '%'),
('redis', '2026-09-09', '14:02:00', 'cache_hit_ratio', 93, '%'),
('redis', '2026-09-09', '14:03:00', 'cache_hit_ratio', 92, '%'),
('redis', '2026-09-09', '14:04:00', 'cache_hit_ratio', 89, '%'),
('redis', '2026-09-09', '14:05:00', 'cache_hit_ratio', 87, '%'),
('redis', '2026-09-09', '14:06:00', 'cache_hit_ratio', 85, '%'),
('redis', '2026-09-09', '14:07:00', 'cache_hit_ratio', 84, '%'),
('redis', '2026-09-09', '14:08:00', 'cache_hit_ratio', 87, '%'),

('redis', '2026-09-09', '14:00:00', 'command_latency', 2, 'ms'),
('redis', '2026-09-09', '14:01:00', 'command_latency', 2, 'ms'),
('redis', '2026-09-09', '14:02:00', 'command_latency', 2, 'ms'),
('redis', '2026-09-09', '14:03:00', 'command_latency', 3, 'ms'),
('redis', '2026-09-09', '14:04:00', 'command_latency', 3, 'ms'),
('redis', '2026-09-09', '14:05:00', 'command_latency', 4, 'ms'),
('redis', '2026-09-09', '14:06:00', 'command_latency', 4, 'ms'),
('redis', '2026-09-09', '14:07:00', 'command_latency', 4, 'ms'),
('redis', '2026-09-09', '14:08:00', 'command_latency', 4, 'ms'),


-- ==========================================================
-- ANALYTICS DB - unaffected
-- ==========================================================
('analytics_db', '2026-09-09', '14:00:00', 'db_query_latency', 35, 'ms'),
('analytics_db', '2026-09-09', '14:01:00', 'db_query_latency', 36, 'ms'),
('analytics_db', '2026-09-09', '14:02:00', 'db_query_latency', 34, 'ms'),
('analytics_db', '2026-09-09', '14:03:00', 'db_query_latency', 36, 'ms'),
('analytics_db', '2026-09-09', '14:04:00', 'db_query_latency', 37, 'ms'),
('analytics_db', '2026-09-09', '14:05:00', 'db_query_latency', 39, 'ms'),
('analytics_db', '2026-09-09', '14:06:00', 'db_query_latency', 38, 'ms'),
('analytics_db', '2026-09-09', '14:07:00', 'db_query_latency', 40, 'ms'),
('analytics_db', '2026-09-09', '14:08:00', 'db_query_latency', 38, 'ms'),

('analytics_db', '2026-09-09', '14:00:00', 'cpu_utilization', 40, '%'),
('analytics_db', '2026-09-09', '14:02:00', 'cpu_utilization', 41, '%'),
('analytics_db', '2026-09-09', '14:04:00', 'cpu_utilization', 42, '%'),
('analytics_db', '2026-09-09', '14:06:00', 'cpu_utilization', 44, '%'),
('analytics_db', '2026-09-09', '14:08:00', 'cpu_utilization', 43, '%');


-- ============================================================
-- 2. LOKI LOGS
-- ============================================================

CREATE TABLE IF NOT EXISTS loki_logs (
  service TEXT,
  date TEXT,
  timestamp TEXT,
  level TEXT,
  message TEXT
);

INSERT INTO loki_logs
(service, date, timestamp, level, message)
VALUES

-- Deployment
('search', '2026-09-09', '14:02:51', 'INFO',
 'Deployment search-v42 completed'),

-- Search begins seeing DB problems
('search', '2026-09-09', '14:03:12', 'ERROR',
 'Connection pool exhausted'),

('search', '2026-09-09', '14:03:45', 'ERROR',
 'Failed to acquire database connection'),

-- Checkout sees shared DB problem
('checkout', '2026-09-09', '14:03:51', 'WARN',
 'Database connection acquisition latency exceeded threshold'),

('checkout', '2026-09-09', '14:04:08', 'ERROR',
 'Failed to acquire database connection'),

-- Search downstream timeout - payment service becomes a red herring
('search', '2026-09-09', '14:04:02', 'ERROR',
 'Request timeout while calling payment-service'),

('search', '2026-09-09', '14:04:31', 'ERROR',
 'Request timeout while calling payment-service'),

('search', '2026-09-09', '14:05:17', 'ERROR',
 'Request timeout while calling payment-service'),

('search', '2026-09-09', '14:05:42', 'ERROR',
 'Request timeout while calling payment-service'),

('search', '2026-09-09', '14:06:05', 'ERROR',
 'Upstream request deadline exceeded'),

('search', '2026-09-09', '14:06:34', 'ERROR',
 'Upstream request deadline exceeded'),

-- Checkout degradation
('checkout', '2026-09-09', '14:05:11', 'ERROR',
 'Request timeout while acquiring transaction'),

('checkout', '2026-09-09', '14:05:48', 'ERROR',
 'Transaction database request exceeded deadline'),

('checkout', '2026-09-09', '14:06:19', 'ERROR',
 'Transaction database request exceeded deadline'),

-- Redis looks suspicious, but isn't actually unhealthy
('redis', '2026-09-09', '14:05:04', 'WARN',
 'Request rate above normal baseline'),

('redis', '2026-09-09', '14:06:11', 'WARN',
 'Cache hit ratio below normal baseline'),

-- Database resource pressure
('transaction_database', '2026-09-09', '14:04:13', 'WARN',
 'High query queue depth'),

('transaction_database', '2026-09-09', '14:05:09', 'WARN',
 'Connection utilization above 80 percent'),

('transaction_database', '2026-09-09', '14:06:22', 'WARN',
 'CPU utilization above 95 percent'),

-- Payment service itself is healthy
('payment-service', '2026-09-09', '14:05:18', 'INFO',
 'Payment request completed successfully'),

('payment-service', '2026-09-09', '14:06:01', 'INFO',
 'Payment request completed successfully'),

-- More Search failures
('search', '2026-09-09', '14:06:41', 'ERROR',
 'Connection pool exhausted'),

('search', '2026-09-09', '14:06:59', 'ERROR',
 'Failed to acquire database connection');


-- ============================================================
-- 3. SCALING EVENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS scaling_events (
  service TEXT,
  date TEXT,
  timestamp TEXT,
  type TEXT,
  previousCapacity INTEGER,
  newCapacity INTEGER,
  capacity INTEGER,
  reason TEXT
);

INSERT INTO scaling_events
(service, date, timestamp, type, previousCapacity, newCapacity, capacity, reason)
VALUES

-- Pre-incident scaling
('search', '2026-09-09', '14:01:48',
 'SCALE_OUT', 4, 8, NULL,
 'CPU utilization exceeded target'),

('search', '2026-09-09', '14:02:18',
 'TASKS_STABILIZED', NULL, NULL, 8,
 'Desired task count reached'),

-- Incident-driven scaling
('search', '2026-09-09', '14:07:42',
 'SCALE_OUT', 8, 12, NULL,
 'Request count exceeded target'),

('search', '2026-09-09', '14:08:17',
 'TASKS_STABILIZED', NULL, NULL, 12,
 'Desired task count reached'),

-- Checkout also scales, making "insufficient capacity"
-- look like a plausible but incorrect diagnosis.
('checkout', '2026-09-09', '14:06:32',
 'SCALE_OUT', 6, 8, NULL,
 'CPU utilization exceeded target'),

('checkout', '2026-09-09', '14:07:01',
 'TASKS_STABILIZED', NULL, NULL, 8,
 'Desired task count reached');


-- ============================================================
-- 4. DEPLOYMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS deployments (
  service TEXT,
  date TEXT,
  timestamp TEXT,
  version TEXT,
  environment TEXT,
  status TEXT
);

INSERT INTO deployments
(service, date, timestamp, version, environment, status)
VALUES

-- Important deployment
('search', '2026-09-09', '14:02:51',
 'search-v42', 'production', 'SUCCESS'),

-- Older unrelated deployments
('catalog', '2026-09-09', '13:42:10',
 'catalog-v18', 'production', 'SUCCESS'),

('recommendation', '2026-09-09', '13:51:33',
 'recommendation-v27', 'production', 'SUCCESS'),

('reporting', '2026-09-09', '13:57:04',
 'reporting-v11', 'production', 'SUCCESS'),

('checkout', '2026-09-09', '13:58:26',
 'checkout-v31', 'production', 'SUCCESS'),

('payment-service', '2026-09-09', '13:35:19',
 'payment-v55', 'production', 'SUCCESS');