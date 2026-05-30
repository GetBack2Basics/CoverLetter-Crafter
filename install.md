Installation Guide: JobHunt Crafter AI
This guide covers setting up the JobHunt Crafter AI web application in both standard environments and complex cloud/containerized environments (such as Oracle Cloud Infrastructure (OCI), Google Cloud Platform (GCP), or nodes running Kubernetes/k3s).

📋 Prerequisites
Before starting, ensure your system has the following installed:

Node.js: v18.x or higher

npm: v9.x or higher

🚀 Standard Installation (Local / Simple VPS)
For basic deployments where no strict firewall managers or container orchestrators are handling network traffic:

Clone the Repository & Install Dependencies:

Bash
git clone <your-repository-url> JobHunt_Crafter_AI
cd JobHunt_Crafter_AI
npm install
Configure Environment Variables:
Create a .env file in the root directory and add your application settings.

Production Background Launch:
Launch the server securely in the background using port 3000:

Bash
nohup npx vite --host 0.0.0.0 --port 3000 > vite-app.log 2>&1 &
🏗️ Complex Infrastructure Environments
If you are deploying on cloud providers with aggressive local firewall layouts (e.g., Oracle Cloud Ubuntu images) or instances hosting Kubernetes (k8s/k3s), standard background binding will fail or time out. Follow these environment-specific configurations.

Scenario A: Deploying alongside Kubernetes / k3s
Kubernetes Ingress Controllers (like Traefik or NGINX) globally seize control of network communication pathways on ports 80 and 443. If your application tries to access those ports or sits in the default iptables queue, it will return an immediate 404 Not Found or drop packets.

Do Not Use Privileged Ports: Ensure Vite binds to an isolated port above 1024 (e.g., 3000).

Inject High-Priority Kernel Rules: Run the following command block to prioritize application traffic ahead of the Kubernetes internal routing loops:

Bash
sudo iptables -I INPUT 1 -p tcp --dport 3000 -m state --state NEW,ESTABLISHED -j ACCEPT
sudo iptables -I OUTPUT 1 -p tcp --sport 3000 -m state --state ESTABLISHED -j ACCEPT
Scenario B: Cloud Hardened Virtual Machines (Oracle Cloud / OCI)
Oracle Cloud Ubuntu instances include a pre-configured utility file (/etc/iptables/rules.v4) featuring a catch-all REJECT rule that suppresses all ports except SSH (22), even if the cloud dashboard rules are perfectly open.

To bypass this safely without wiping your entire existing network rules:

Inject Port Exception directly into Persistent Configurations:

Bash
sudo sed -i '/-A INPUT -j REJECT --reject-with icmp-host-prohibited/i -A INPUT -p tcp -m state --state NEW -m tcp --dport 3000 -j ACCEPT' /etc/iptables/rules.v4
Reload the Rule Engine:

Bash
sudo cat /etc/iptables/rules.v4 | sudo iptables-restore
(If your machine does not have iptables-persistent active, force save via: sudo apt-get install netfilter-persistent -y && sudo netfilter-persistent save)

External Firewall Setup (Cloud Dashboard Console):
You must mirror this change inside your Cloud Panel Provider interface:

Navigate to Virtual Cloud Network (VCN) ➔ Security Lists (or Security Groups).

Click Add Ingress Rule.

Set Source CIDR to 0.0.0.0/0

Set IP Protocol to TCP

Set Destination Port Range to 3000

🛠️ Verification & Troubleshooting
1. Confirm Application Lifecycle Internally
Before testing across the open internet, confirm that the application is running internally on the host machine:

Bash
sudo ss -tulnpt | grep 3000
Expected Output Structure:

Plaintext
tcp   LISTEN 0   511   0.0.0.0:3000   0.0.0.0:* users:(("node",pid=XXXXXX,fd=XX))
Then check the server's immediate localized response:

Bash
curl -I http://127.0.0.1:3000/
If you receive an immediate HTTP/1.1 200 OK here but external laptops cannot connect, your server is running perfectly, and the bottleneck is entirely located at your Cloud Provider Firewall Security Layer.

2. Secure Failover: Diagnostic SSH Tunneling
If your cloud provider's web console firewall remains unresponsive, you can securely tunnel past all network barriers by running this command on your local computer terminal:

Bash
# Map a clear local port (e.g. 9090) directly to the target app environment port
ssh -N -L 9090:127.0.0.1:3000 ubuntu@<YOUR_SERVER_PUBLIC_IP>
Once run, navigate to http://localhost:9090 in your local computer's browser.
