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

# Scripts

Additionally provided in this repo are some supporting scripts to help automate deployment of monitoring agents and endpoints in your environment. These are found in the /scripts directory. Their use is explained below.

## Deploying Node Exporter with Ansible

To monitor Linux hosts with Prometheus, use the provided Ansible playbook `scripts/deploy_node_exporter.yml`. This script automates the installation of the Prometheus Node Exporter on all hosts in your Ansible inventory and registers them with the Prometheus Target Manager.

### Usage

1. **Configure your Ansible inventory** with the target Linux hosts.
2. **Run the playbook** from the project root:
   ```sh
   ansible-playbook scripts/deploy_node_exporter.yml -i <your_inventory_file> -e "prometheus_target_manager_api=http://monitoring.domain.local"
   ```
   - Note: You need to specify the "prometheus_target_manager_api" variable to point wherever the monitoring stack is hosted from.
3. The playbook will:
   - Install Node Exporter as a system service.
   - Register each host with the Prometheus Target Manager API so Prometheus can begin scraping metrics.

### Requirements

- SSH access and sudo privileges on target hosts.
- Ansible installed on your control machine.
- The Prometheus Target Manager service running and accessible at `172.24.0.12:3030`.

### Customization

You can override variables such as the Prometheus Target Manager address or port by editing the playbook or passing extra vars:

```sh
ansible-playbook scripts/deploy_node_exporter.yml -i <your_inventory_file> -e "prometheus_target_manager_api=http://monitoring.domain.local prometheus_target_manager_api_port:3030"
```

You could also configure a variables file to pass these values to the playbook.

After deployment, each host will appear in the Prometheus Target Manager and be monitored
