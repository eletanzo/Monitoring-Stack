# Summary

This project aims to create a comprehensive monitoring suite that can be deployed easily with Docker Compose. The suite consists of Prometheus for endpoint data collection, Grafana for visualization and alerting, and a custom Node.js webapp called "Prometheus Target Manager" for maintaining a database of endpoints.

# Setup

Run the compose as-is to get started. Log into Grafana with the default login admin/admin and change to your preferred credentials. Add a Prometheus data source in Grafana and point it to **172.24.0.11:9090**.
To add or remove targets for Prometheus to scrape, connect to the front end from a web browser and add by IP or hostname with a port. You can remove them by hovering over an entry and clicking the trashcan next to it.
You can also use the API to interact with the Prometheus Target Manager server. Details are below in the API section.

# READ THIS: Static Network Setting

In order for Grafana to stay connected to Prometheus after a restart of services, it needs to use static IPs. The stack is configured to use the 172.24.0.0/24 subnet and the addresses 172.24.0.10-13.

# Environment Variables

This stack uses the following environment variables for configuration:

- PROMETHEUS_RETENTION
  - Default: 15d
  - Use: Specifies the retention time for data collected by Prometheus via the --storage.tsdb.retention.time flag. Defaults to 15 days. https://prometheus.io/docs/prometheus/latest/storage/#operational-aspects
- PTM_CLIENT_PORT
  - Default: 8080
  - Use: Specifies the port exposed for the Prometheus Target Manager frontend.
- PTM_API_Port
  - Default: 3030
  - Use: Specifies the port exposed for the Prometheus Target Manager API.
- GRAFANA_PORT
  - Default: 3000
  - Use: Specifies the port exposed for the Grafana interface.
- PROMETHEUS_PORT
  - Default: 9090
  - Use: Specifies the port exposed for the Prometheus interface.

# Prometheus Target Manager API

- GET /api/targets
  - Returns a JSON body of all targets in the database in a format digestible by Prometheus for scraping.
  - Example return:
  ```json
  [
    {
      "targets": ["10.1.10.20:9100", "target.brokeserver.local:9100"],
      "labels": {}
    }
  ]
  ```
- GET /api/ips
  - Returns a summary list of all the IPs in the database, along with unique IDs for each entry. Used primarily by the frontend.
  - Example return:
  ```json
  [
    {
      "id": 1,
      "ip": "10.1.10.20:9100"
    },
    {
      "id": 3,
      "ip": "target.brokeserver.local:9100"
    }
  ]
  ```
- POST /api/ips
  - Adds the specified IP to the database.
  - Example body:
  ```json
  {
    "ip": "10.1.10.10:9100"
  }
  ```
- DELETE /api/ips/:id
  - Deletes an IP by its associated unique ID
  - Example call for the example target "target.brokeserver.local:9100" above:
    - /api/ips/3
