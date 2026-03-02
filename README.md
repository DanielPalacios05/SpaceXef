# SpaceXef Backend - Launch Visualization Platform

This repository contains the completely serverless backend for the SpaceXef (SpaceX Efficient Finding) Launch Visualization Platform.

The architecture is built completely on AWS Serverless infrastructure (Lambda, API Gateway, DynamoDB), defined securely as Code natively via AWS SAM (Serverless Application Model). It is highly optimized using Single-Table DynamoDB design principles for instantaneous Read performance.

## Architecture & Infrastructure

### 1. The Database (`SpaceXef-Data`)
We use an **Amazon DynamoDB Single-Table** strategy to optimize for read queries.
- **Partition Key (PK):** Heavily overloaded to `LAUNCH`.
- **Sort Key (SK):** A padded chronological Unix-timestamp combined with the Launch ID natively formatting data into a time-series string: `<padded_unix_date>#<launch_id>`. Example: `000001669852800#633f72580531...`.
- *Why this matters*: We can execute a blazing-fast DynamoDB `Query` scanning backward instantly chronologically by Date (without needing full expensive table `Scans` or manually sorting objects post-retrieval).

### 2. Ingestion Pipeline (`backend/ingest/core_ingestion.py`)
- Python 3.13 Lambda triggered asynchronously.
- Connects reliably to the `https://api.spacexdata.com/v5/launches/query` endpoint.
- Maps, parses, deeply flattens `Rockets`, `Payloads`, and `Crew` objects. 
- Gracefully handles data abnormalities efficiently inserting updates into DynamoDB.

### 3. FastAPI Service (`backend/app/main.py`)
- Read-only Python 3.13 REST API using **FastAPI** coupled organically with **Mangum**.
- Deployed within a Lambda Function attached via an API Gateway Proxy integration mapping traffic flawlessly.
- Translates dynamic User REST requests cleanly into DynamoDB queries (FilterExpressions for rockets & status).
- Handles Base64 Token Cursor-based Pagination logic seamlessly natively.

---

## Testing & Quality Assurance Infrastructure

This code base enforces strict separation of concerns, decoupling the Ingestion script logic strictly for Test-Driven Development logic utilizing `pytest`.

### The Test Stack
* **`pytest`**: Runner framework enforcing test boundaries.
* **`moto[dynamodb]`**: Spins up fully mock AWS services rapidly in-memory to safely assert correct database transaction mapping and overrides (testing `PK`, `SK` strings dynamically and Boto3 Python Float mappings) without polluting actual external databases.
* **`unittest.mock`**: Enforces graceful error degradations isolating `urllib` HTTP calls.

To run the unit tests natively locally:
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r backend/ingest/requirements-dev.txt

PYTHONPATH=backend/ingest LOCAL_DDB=1 python3 -m pytest backend/ingest/tests/ -v
```

---

## Local Development Guide

You can easily run this entire ecosystem securely fully offline decoupled from your actual AWS cloud accounts! 

### Prerequisites

1.  [Python 3.13](https://www.python.org/downloads/)
2.  [Docker CLI](https://docs.docker.com/get-docker/) (used to mock AWS Databases entirely natively in memory).

### 1. Start the Local Mock Database
Spin up standard `dynamodb-local` natively using Docker. Leave this running securely quietly in the background on Port `8000`:
```bash
docker run -d -p 8000:8000 --name dynamodb-local amazon/dynamodb-local
```

### 2. Create the Mock Table
We need to rapidly construct the required schema internally in the local image:
```bash
AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test AWS_DEFAULT_REGION=us-east-1 aws dynamodb create-table \
    --table-name SpaceXef-Data \
    --attribute-definitions AttributeName=PK,AttributeType=S AttributeName=SK,AttributeType=S \
    --key-schema AttributeName=PK,KeyType=HASH AttributeName=SK,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST \
    --endpoint-url http://localhost:8000
```

### 3. Populate Data (Run Ingestion Offline)
Inject data securely from the SpaceX API exactly mapped into your brand new Mock Dynamo Database Container! 
*(By padding environment variable `LOCAL_DDB=1`, our secure decoupled boto3 implementation intercepts internet requests securely forcing traffic straight to local port 8000).*

```bash
pip install -r backend/ingest/requirements-dev.txt
LOCAL_DDB=1 python3 backend/ingest/core_ingestion.py
```

### 4. Run the API Ecosystem locally
Once ingestion perfectly succeeds, spin down to root and natively boot FastAPI utilizing `uvicorn`.

```bash
pip3 install -r backend/app/requirements.txt
LOCAL_DDB=1 python3 -m uvicorn backend.app.main:app --reload --port 8001
```

**And you're done!** 
Fully decoupled real-world visualization traffic natively available safely:
* **JSON Read Route:** [http://localhost:8001/launches?limit=2](http://localhost:8001/launches?limit=2)
* **API Interactive Swagger Documentation:** [http://localhost:8001/docs](http://localhost:8001/docs)
