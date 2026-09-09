UPDATE prom_metrics
SET service = 'search',
    timestamp = CASE length(timestamp)
      WHEN 5 THEN timestamp || ':00'
      ELSE timestamp
    END
WHERE service = 'checkout';

UPDATE loki_logs
SET service = 'search'
WHERE service = 'checkout';

UPDATE scaling_events
SET service = 'search'
WHERE service = 'checkout';