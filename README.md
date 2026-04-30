# TechSalary LK — Sri Lanka Tech Salary Transparency Platform

Community-driven tech salary transparency website inspired by TechPays.com and techsalary.tldr.lk.
Users anonymously share salary data; the community upvotes submissions to approve them.

**Module:** 7BUIS027C.2 — Cloud Computing Applications 2026
**University:** University of Westminster

---

## Architecture Overview

| Service | Port | Description |
|---|---|---|
| frontend | 3000 | React SPA served by NGINX |
| bff | 4000 | Backend-For-Frontend (API Gateway, JWT auth enforcement) |
| salary-submission | 4001 | Anonymous salary CRUD — no login required |
| identity | 4002 | Signup / login / JWT verify (24h expiry) |
| vote | 4003 | Community voting + threshold-based approval logic |
| search | 4004 | Filtered search over APPROVED records only |
| stats | 4005 | Aggregate stats (avg, median, percentiles) over APPROVED only |
| postgres | 5432 | PostgreSQL 16 — three schemas: identity, salary, community |

**Workflow:** `POST /api/submissions (PENDING)` → `POST /api/votes (auth required)` → 3 upvotes → `APPROVED` → `GET /api/search` → `GET /api/stats`

### Privacy & Security Design

| Requirement | Implementation |
|---|---|
| Salary submission is anonymous | `POST /api/submissions` has NO auth middleware. `salary.submissions` has NO `email` or `user_id` column. |
| Login only for community actions | BFF `authMiddleware` applied ONLY on `POST /api/votes`. All other routes are public. |
| Passwords hashed | bcrypt 12 rounds. `password_hash` stored, never plain text. |
| JWT token expiry | Tokens expire after 24 hours. Signed with `JWT_SECRET` from Kubernetes Secret. |
| Internal services not exposed | All backend services use `ClusterIP`. Only the NGINX Ingress Controller faces the internet. |
| Anonymize toggle | When `anonymize: true` on a submission, the Search service replaces the company name with `"Tech Company (anonymous)"` in all API responses. |
| Schema isolation | `salary.submissions` has zero foreign keys to `identity.users` — salary data cannot be traced back to any user account. |

---

## Database Schema

Three logical schemas provide data isolation:

| Schema | Tables | Purpose |
|---|---|---|
| `identity` | `users` | User accounts — email, bcrypt password_hash, display_name |
| `salary` | `submissions` | Anonymous salary records — NO email, NO user_id |
| `community` | `votes`, `reports` | Community interactions — links users to submissions |

Schema is automatically created by `db/init.sql` on first PostgreSQL startup.

---

## Deployed Cluster Details

| Property | Value |
|---|---|
| Cluster name | `techsalary-aks` |
| Node | 1 × `Standard_D2as_v4` (2 vCPU, 8 GB RAM) |
| Kubernetes version | 1.34.4 |
| Container Registry | `techsalaryacrsk.azurecr.io` (Basic SKU) |
| Persistent Storage | Azure Premium SSD — 5 GiB PVC |
| Public IP | `4.213.47.219` |
| Namespaces | `app` (services), `data` (PostgreSQL) |

---

## Prerequisites

- Docker Desktop
- `kubectl`
- Azure CLI (`az`)
- Helm 3
- `jq` (for end-to-end test commands)

---

## 1. Local Development (Docker Compose)

```bash
cd techsalary-platform
docker-compose up --build

# App: http://localhost:3000
# API: http://localhost:4000/api/*
```

---

## 2. Build & Push Docker Images

```bash
REGISTRY=techsalaryacrsk.azurecr.io

# Login to ACR
az acr login --name techsalaryacrsk

# Build and push all backend services
for svc in identity salary-submission vote search stats bff; do
  docker build -t $REGISTRY/techsalary/$svc:v1 ./services/$svc
  docker push $REGISTRY/techsalary/$svc:v1
done

# Frontend (multi-stage build)
docker build -t $REGISTRY/techsalary/frontend:v1 ./services/frontend
docker push $REGISTRY/techsalary/frontend:v1
```

Then update every `image:` field in `k8s/app/*.yaml` to use `$REGISTRY/techsalary/<name>:v1`.

---

## 3. Create AKS Cluster (Azure)

> **Note:** Azure for Students subscriptions have per-family vCPU quotas. `Standard_D2as_v4` (AMD-based) was used as it had quota available. `Standard_B2ms` and `Standard_DS` families may fail with quota errors.

```bash
# Create resource group
az group create --name techsalary-rg --location southindia

# Create single-node AKS cluster
az aks create \
  --resource-group techsalary-rg \
  --name techsalary-aks \
  --node-count 1 \
  --node-vm-size Standard_D2as_v4 \
  --enable-managed-identity \
  --generate-ssh-keys

# Get credentials
az aks get-credentials --resource-group techsalary-rg --name techsalary-aks

# Verify connection
kubectl get nodes -o wide
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

# Step 2: Secrets — replace values before running!
kubectl create secret generic app-secret \
  --namespace app \
  --from-literal=DB_PASSWORD='YourSecurePassword123!' \
  --from-literal=JWT_SECRET='YourJWTSecretAtLeast32CharsLong!!'

kubectl create secret generic db-secret \
  --namespace data \
  --from-literal=POSTGRES_PASSWORD='YourSecurePassword123!'

# Step 3: ConfigMaps
kubectl apply -f k8s/configmap.yaml

# Step 4: PostgreSQL (data namespace) — wait for ready before proceeding
kubectl apply -f k8s/data/postgres-pvc.yaml
kubectl apply -f k8s/data/postgres-configmap.yaml
kubectl apply -f k8s/data/postgres-deployment.yaml
kubectl wait --for=condition=ready pod -l app=postgres -n data --timeout=120s

# Step 5: Application services
kubectl apply -f k8s/app/identity.yaml
kubectl apply -f k8s/app/salary-submission.yaml
kubectl apply -f k8s/app/vote.yaml
kubectl apply -f k8s/app/search.yaml
kubectl apply -f k8s/app/stats.yaml
kubectl apply -f k8s/app/bff.yaml
kubectl apply -f k8s/app/frontend.yaml

# Step 6: Ingress (last — requires services to exist)
kubectl apply -f k8s/ingress.yaml
```

---

## 6. Verify Deployment

```bash
# All 7 app pods should show Running and Ready
kubectl get pods -n app

# Postgres pod should be Running
kubectl get pods -n data

# All ClusterIP services visible
kubectl get svc --all-namespaces

# Ingress shows external IP
kubectl get ingress -n app

# PVC should show Status: Bound
kubectl describe pvc postgres-pvc -n data

# Full cluster overview
kubectl get pods,svc,deploy -n app
kubectl get pods,svc,deploy -n data
```

---

## 7. Database Initialization

The database is **automatically initialized** on first PostgreSQL startup. The `postgres-init` ConfigMap mounts `db/init.sql` into `/docker-entrypoint-initdb.d/` which PostgreSQL executes automatically.

To verify schemas and privacy design:

```bash
# Connect to postgres pod
kubectl exec -it -n data deployment/postgres -- psql -U postgres -d techsalary

# Inside psql — verify schemas exist
\dn

# Verify salary.submissions has NO user_id or email column
\d salary.submissions

# Verify community.votes structure
\d community.votes

# Check sample data
SELECT id, email, password_hash FROM identity.users LIMIT 3;
SELECT id, company, role, status, anonymize FROM salary.submissions LIMIT 5;
SELECT * FROM community.votes LIMIT 5;
```

---

## 8. End-to-End Workflow Test

Replace `EXTERNAL_IP` with the IP from `kubectl get ingress -n app`.

```bash
EXTERNAL_IP=4.213.47.219
BASE=http://$EXTERNAL_IP

# ── Evidence 1: Submit salary (no login required) ──────────────────────────
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

# Submit with anonymize=true to test company masking
SUB_ID=$(curl -s -X POST $BASE/api/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "company": "Virtusa",
    "role": "Senior Developer",
    "experienceYears": 5,
    "experienceLevel": "senior",
    "baseSalary": 250000,
    "currency": "LKR",
    "country": "Sri Lanka",
    "anonymize": true
  }' | jq -r '.id')
echo "Submission ID: $SUB_ID"

# ── Evidence 2: User signup ─────────────────────────────────────────────────
curl -s -X POST $BASE/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@test.com","password":"password123","displayName":"TestUser1"}' | jq .

curl -s -X POST $BASE/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user2@test.com","password":"password123","displayName":"TestUser2"}' | jq .

curl -s -X POST $BASE/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user3@test.com","password":"password123","displayName":"TestUser3"}' | jq .

# ── Evidence 3: Login and get tokens ────────────────────────────────────────
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

# ── Evidence 4: Vote 1 ───────────────────────────────────────────────────────
curl -s -X POST $BASE/api/votes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN1" \
  -d "{\"submissionId\":\"$SUB_ID\",\"voteType\":\"UP\"}" | jq .
# Expected: { "upvotes": 1, "approved": false }

# ── Vote 2 ───────────────────────────────────────────────────────────────────
curl -s -X POST $BASE/api/votes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN2" \
  -d "{\"submissionId\":\"$SUB_ID\",\"voteType\":\"UP\"}" | jq .
# Expected: { "upvotes": 2, "approved": false }

# ── Evidence 5: Vote 3 — triggers APPROVAL ───────────────────────────────────
curl -s -X POST $BASE/api/votes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN3" \
  -d "{\"submissionId\":\"$SUB_ID\",\"voteType\":\"UP\"}" | jq .
# Expected: { "upvotes": 3, "approved": true }

# ── Evidence 6: Search returns approved record ───────────────────────────────
curl -s "$BASE/api/search" | jq .
# Expected: anonymize=true record shows company as "Tech Company (anonymous)"

# ── Evidence 7: Stats reflect approved data ──────────────────────────────────
curl -s "$BASE/api/stats" | jq .
# Expected: avg_salary, median_salary, min_salary, max_salary populated

# ── Evidence 8: Voting without token returns 401 ─────────────────────────────
curl -s -X POST $BASE/api/votes \
  -H "Content-Type: application/json" \
  -d "{\"submissionId\":\"$SUB_ID\",\"voteType\":\"UP\"}" | jq .
# Expected: { "error": "Authentication required" }

# ── Evidence 9: Double-vote returns 409 ──────────────────────────────────────
curl -s -X POST $BASE/api/votes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN1" \
  -d "{\"submissionId\":\"$SUB_ID\",\"voteType\":\"UP\"}" | jq .
# Expected: { "error": "Already voted on this submission" }

# ── Evidence 10: Privacy proof — submissions have no user_id ─────────────────
kubectl exec -it -n data deployment/postgres -- \
  psql -U postgres -d techsalary \
  -c "SELECT id, company, role, status FROM salary.submissions;"
# Expected: NO email or user_id column in output
```

---

## 9. Zero-Downtime Rolling Update

```bash
# Tag and push a new image version
docker build -t techsalaryacrsk.azurecr.io/techsalary/frontend:v3 ./services/frontend
docker push techsalaryacrsk.azurecr.io/techsalary/frontend:v3

# Trigger rolling update
kubectl set image deployment/frontend \
  frontend=techsalaryacrsk.azurecr.io/techsalary/frontend:v3 -n app

# Watch rollout — new pod becomes Ready before old pod terminates
kubectl rollout status deployment/frontend -n app
```

---

## 10. Cluster Management (Cost Saving)

```bash
# Stop cluster (preserves data, eliminates compute cost)
az aks stop --resource-group techsalary-rg --name techsalary-aks

# Start cluster again
az aks start --resource-group techsalary-rg --name techsalary-aks

# After start — restore kubectl credentials
az aks get-credentials --resource-group techsalary-rg --name techsalary-aks
```

---

## Repository Structure

```
techsalary-platform/
├── services/
│   ├── frontend/           # React SPA + NGINX (port 3000)
│   ├── bff/                # API Gateway — auth enforcement (port 4000)
│   ├── salary-submission/  # Anonymous salary CRUD (port 4001)
│   ├── identity/           # Signup / login / JWT verify (port 4002)
│   ├── vote/               # Voting + threshold approval (port 4003)
│   ├── search/             # Search APPROVED records + anonymize masking (port 4004)
│   └── stats/              # Aggregate statistics (port 4005)
├── k8s/
│   ├── namespaces.yaml     # app + data namespaces
│   ├── configmap.yaml      # app-config (DB host, service URLs, threshold)
│   ├── ingress.yaml        # NGINX Ingress — /api/* → BFF, /* → Frontend
│   ├── app/                # 7 Deployment + ClusterIP Service YAML files
│   └── data/               # PostgreSQL PVC, ConfigMap, Deployment, Service
├── db/
│   └── init.sql            # Creates schemas: identity, salary, community
├── docs/
│   └── screenshots/        # Evidence screenshots for coursework submission
├── docker-compose.yml      # Local development environment
├── .env.example            # Environment variable template (no real secrets)
└── README.md
```

---

## Known Issues & Solutions

| Issue | Cause | Fix |
|---|---|---|
| Frontend `CrashLoopBackOff` — host not found in upstream "bff" | NGINX used docker-compose name, not K8s DNS | Changed `proxy_pass` to `bff-service.app.svc.cluster.local:4000` |
| PostgreSQL `initdb: directory not empty` | Azure SSD has `lost+found` directory | Added `PGDATA=/var/lib/postgresql/data/pgdata` env var |
| `/api/*` returns 404 from BFF | Ingress rewrite-target stripped `/api` prefix | Removed rewrite annotation, used plain `pathType: Prefix` |
| Pods in `CreateContainerConfigError` | `app-secret` not created before deployment | Create secrets before applying app manifests |
| AKS provisioning quota errors | Azure for Students limits per VM family | Used `Standard_D2as_v4` (AMD family had available quota) |
