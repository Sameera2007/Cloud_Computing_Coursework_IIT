# TechSalary LK — Sri Lanka Tech Salary Transparency Platform

Community-driven tech salary transparency website inspired by TechPays.com and techsalary.tldr.lk.
Users anonymously share salary data; the community upvotes submissions to approve them.

**Module:** 7BUIS027C.2 — Cloud Computing Applications 2026

---

## Architecture Overview

| Service | Port | Description |
|---|---|---|
| frontend | 3000 | React SPA served by Nginx |
| bff | 4000 | Backend-For-Frontend (API Gateway, auth enforcement) |
| salary-submission | 4001 | Anonymous salary CRUD |
| identity | 4002 | Signup / login / JWT verify |
| vote | 4003 | Community voting + approval logic |
| search | 4004 | Filtered search over APPROVED records |
| stats | 4005 | Aggregate stats (avg, median, percentiles) |
| postgres | 5432 | PostgreSQL 16 — schemas: identity, salary, community |

**Workflow:** `POST /submissions (PENDING)` → `POST /votes` → threshold met → `APPROVED` → `GET /search` → `GET /stats`

---

## Prerequisites

- Docker Desktop
- kubectl
- Azure CLI (`az`)
- Helm 3

---

## 1. Local Development (Docker Compose)

```bash
# Clone and start all services + postgres
cd techsalary-platform
docker-compose up --build

# App available at http://localhost:3000
# API at http://localhost:4000/api/*
```

---

## 2. Build & Push Docker Images

Replace `YOUR_REGISTRY` with your Azure Container Registry login server (e.g. `techsalaryacr.azurecr.io`).

```bash
REGISTRY=YOUR_REGISTRY

# Login to ACR
az acr login --name techsalaryacr

# Build and push all services
for svc in identity salary-submission vote search stats bff; do
  docker build -t $REGISTRY/techsalary/$svc:v1 ./services/$svc
  docker push $REGISTRY/techsalary/$svc:v1
done

# Frontend
docker build -t $REGISTRY/techsalary/frontend:v1 ./services/frontend
docker push $REGISTRY/techsalary/frontend:v1
```

Then update every `image:` field in `k8s/app/*.yaml` to use `$REGISTRY/techsalary/<name>:v1`.

---

## 3. Create AKS Cluster (Azure)

```bash
# Create resource group
az group create --name techsalary-rg --location southeastasia

# Create single-node AKS cluster
az aks create \
  --resource-group techsalary-rg \
  --name techsalary-aks \
  --node-count 1 \
  --node-vm-size Standard_B2ms \
  --enable-managed-identity \
  --generate-ssh-keys

# Get credentials
az aks get-credentials --resource-group techsalary-rg --name techsalary-aks

# Verify connection
kubectl get nodes
```

---

## 4. Install NGINX Ingress Controller (Helm)

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.service.type=LoadBalancer

# Wait for external IP (takes ~2 min on Azure)
kubectl get svc -n ingress-nginx --watch
```

---

## 5. Apply Kubernetes Manifests (in order)

```bash
# Step 1: Namespaces
kubectl apply -f k8s/namespaces.yaml

# Step 2: Secrets (replace placeholder values!)
kubectl create secret generic app-secret \
  --namespace app \
  --from-literal=DB_PASSWORD='YourSecurePassword123!' \
  --from-literal=JWT_SECRET='YourJWTSecretAtLeast32CharsLong!!'

kubectl create secret generic db-secret \
  --namespace data \
  --from-literal=POSTGRES_PASSWORD='YourSecurePassword123!'

# Step 3: ConfigMaps
kubectl apply -f k8s/configmap.yaml

# Step 4: PostgreSQL (data namespace)
kubectl apply -f k8s/data/postgres-pvc.yaml
kubectl apply -f k8s/data/postgres-configmap.yaml
kubectl apply -f k8s/data/postgres-deployment.yaml

# Wait for postgres to be ready
kubectl wait --for=condition=ready pod -l app=postgres -n data --timeout=120s

# Step 5: Application services
kubectl apply -f k8s/app/identity.yaml
kubectl apply -f k8s/app/salary-submission.yaml
kubectl apply -f k8s/app/vote.yaml
kubectl apply -f k8s/app/search.yaml
kubectl apply -f k8s/app/stats.yaml
kubectl apply -f k8s/app/bff.yaml
kubectl apply -f k8s/app/frontend.yaml

# Step 6: Ingress
kubectl apply -f k8s/ingress.yaml
```

---

## 6. Verify Deployment

```bash
# All 7 app pods should show Running
kubectl get pods -n app

# Postgres pod should be Running
kubectl get pods -n data

# All ClusterIP services
kubectl get svc --all-namespaces

# Ingress (shows external IP)
kubectl get ingress -n app

# PVC should show Bound
kubectl describe pvc postgres-pvc -n data
```

---

## 7. Database Initialization

The database is **automatically initialized** on first PostgreSQL startup. The `postgres-init` ConfigMap mounts `init.sql` into `/docker-entrypoint-initdb.d/` which PostgreSQL runs automatically.

To verify:
```bash
# Connect to postgres pod
kubectl exec -it -n data deployment/postgres -- psql -U postgres -d techsalary

# Inside psql:
\dn                                    -- list schemas (identity, salary, community)
\d salary.submissions                  -- confirm NO email or user_id column
SELECT * FROM identity.users LIMIT 3;
SELECT * FROM salary.submissions LIMIT 3;
```

---

## 8. End-to-End Workflow Test

Replace `EXTERNAL_IP` with the IP from `kubectl get ingress -n app`.

```bash
EXTERNAL_IP=<your-ingress-external-ip>
BASE=http://$EXTERNAL_IP

# --- Evidence 1: Submit salary (no login required) ---
curl -s -X POST $BASE/api/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "company": "WSO2",
    "role": "Software Engineer",
    "experienceYears": 3,
    "experienceLevel": "mid",
    "baseSalary": 150000,
    "currency": "LKR",
    "country": "Sri Lanka",
    "city": "Colombo",
    "anonymize": false
  }' | jq .
# Expected: { "status": "PENDING", ... }

# Save the submission ID
SUB_ID=$(curl -s -X POST $BASE/api/submissions \
  -H "Content-Type: application/json" \
  -d '{"company":"Virtusa","role":"Senior Dev","experienceYears":5,"experienceLevel":"senior","baseSalary":250000,"currency":"LKR","country":"Sri Lanka","anonymize":false}' \
  | jq -r '.id')
echo "Submission ID: $SUB_ID"

# --- Evidence 2: User signup ---
curl -s -X POST $BASE/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@test.com","password":"password123","displayName":"TestUser1"}' | jq .

curl -s -X POST $BASE/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user2@test.com","password":"password123","displayName":"TestUser2"}' | jq .

curl -s -X POST $BASE/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user3@test.com","password":"password123","displayName":"TestUser3"}' | jq .

# --- Evidence 3: Login and get tokens ---
TOKEN1=$(curl -s -X POST $BASE/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@test.com","password":"password123"}' | jq -r '.token')
echo "Token 1: $TOKEN1"

TOKEN2=$(curl -s -X POST $BASE/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user2@test.com","password":"password123"}' | jq -r '.token')

TOKEN3=$(curl -s -X POST $BASE/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user3@test.com","password":"password123"}' | jq -r '.token')

# --- Evidence 4: Vote 1 (user1) ---
curl -s -X POST $BASE/api/votes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN1" \
  -d "{\"submissionId\":\"$SUB_ID\",\"voteType\":\"UP\"}" | jq .

# --- Vote 2 (user2) ---
curl -s -X POST $BASE/api/votes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN2" \
  -d "{\"submissionId\":\"$SUB_ID\",\"voteType\":\"UP\"}" | jq .

# --- Evidence 5: Vote 3 (user3) — triggers APPROVAL ---
curl -s -X POST $BASE/api/votes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN3" \
  -d "{\"submissionId\":\"$SUB_ID\",\"voteType\":\"UP\"}" | jq .
# Expected: { "approved": true, "upvotes": 3 }

# --- Evidence 6: Search returns approved record ---
curl -s "$BASE/api/search" | jq .

# --- Evidence 7: Stats reflect approved data ---
curl -s "$BASE/api/stats" | jq .

# --- Evidence 8: Try voting without token (should 401) ---
curl -s -X POST $BASE/api/votes \
  -H "Content-Type: application/json" \
  -d "{\"submissionId\":\"$SUB_ID\",\"voteType\":\"UP\"}" | jq .
# Expected: { "error": "Authentication required" }
```

---

## Repository Structure

```
techsalary-platform/
├── services/
│   ├── frontend/       # React SPA + Nginx (port 3000)
│   ├── bff/            # API Gateway (port 4000)
│   ├── salary-submission/  # Salary CRUD (port 4001)
│   ├── identity/       # Auth + JWT (port 4002)
│   ├── vote/           # Voting + approval (port 4003)
│   ├── search/         # Search APPROVED records (port 4004)
│   └── stats/          # Aggregate statistics (port 4005)
├── k8s/
│   ├── namespaces.yaml
│   ├── configmap.yaml
│   ├── ingress.yaml
│   ├── app/            # 7 Deployment + Service files
│   └── data/           # PostgreSQL PVC, ConfigMap, Deployment, Service
├── db/
│   └── init.sql        # Schema: identity, salary, community
├── docs/
│   └── screenshots/    # Evidence screenshots
├── docker-compose.yml  # Local development
├── .env.example        # Environment variable template
└── README.md
```

---

## Privacy & Security Design

| Requirement | Implementation |
|---|---|
| Salary submission is anonymous | POST /api/submissions has NO auth. `salary.submissions` has NO `email` or `user_id` column. |
| Login only for community actions | BFF `authMiddleware` applied ONLY on `POST /api/votes`. All other routes are public. |
| Passwords hashed | bcrypt 12 rounds. `password_hash` stored, never plain text. |
| Internal services not exposed | All backend services use ClusterIP. Only Ingress faces the internet. |
| Anonymize toggle | `anonymize=true` replaces company name with `"Tech Company (anonymous)"` in search results. |
