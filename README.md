## Incident Investigator

AI-powered incident investigation agent that uses service telemetry to identify anomalies, correlate failures, and determine likely root causes.

### Methodology

The agent follows this:

1. Get all services that are there in the ecosystem.
2. Identify the incident window.
3. Establish a baseline for affected services.
4. Detect anomalous metrics.
5. Inspect dependent services.
6. Form and validate hypotheses using additional telemetry.
7. Generate a summary with supporting evidence and confidence.

The agent can perform multiple tool calls, allowing each investigation step to influence the next.

The LLM is responsible for reasoning, while tools provide access to telemetry.


Visit here:
https://incident-investigator.sankalp-jain02.workers.dev/

### Screenshots


![Application screenshot](docs/images/1.png)
![Application screenshot](docs/images/2.png)
![Application screenshot](docs/images/3.png)


### A sample run