# Backend de SpaceXef - Plataforma de Visualización de Lanzamientos

Este repositorio contiene el backend completamente serverless (sin servidor) para la Plataforma de Visualización de Lanzamientos SpaceXef (SpaceX Efficient Finding).

La arquitectura está construida completamente sobre infraestructura Serverless de AWS (Lambda, API Gateway, DynamoDB), definida de forma segura como Código de manera nativa a través de AWS SAM (Serverless Application Model). Está altamente optimizada utilizando los principios de diseño de Tabla Única (Single-Table) de DynamoDB para un rendimiento de lectura instantáneo.

## Arquitectura e Infraestructura

### 1. La Base de Datos (`SpaceXef-Data`)
Utilizamos una estrategia de **Tabla Única de Amazon DynamoDB** para optimizar las consultas de lectura.
- **Clave de Partición (PK):** Fuertemente sobrecargada a `LAUNCH` (Lanzamiento).
- **Clave de Ordenación (SK):** Una marca de tiempo cronológica Unix rellenada (padded) combinada con el ID del Lanzamiento, formateando de forma nativa los datos en una cadena de series temporales: `<fecha_unix_rellenada>#<id_lanzamiento>`. Ejemplo: `000001669852800#633f72580531...`.
- *Por qué esto es importante*: Podemos ejecutar una `Consulta` (Query) en DynamoDB ultra rápida escaneando hacia atrás instantáneamente de manera cronológica por Fecha (sin necesidad de costosos `Escaneos` (Scans) completos de tabla o de clasificar manualmente los objetos después de obtenerlos).

### 2. Pipeline de Ingestión (`backend/ingest/core_ingestion.py`)
- Función Lambda en Python 3.13 ejecutada asíncronamente.
- Se conecta de forma fiable al endpoint `https://api.spacexdata.com/v5/launches/query`.
- Mapea, analiza y aplana profundamente los objetos de `Rockets` (Cohetes), `Payloads` (Cargas) y `Crew` (Tripulación). 
- Maneja con gracia las anomalías de los datos, insertando actualizaciones eficientemente en DynamoDB.

### 3. Servicio FastAPI (`backend/app/main.py`)
- REST API de solo lectura en Python 3.13 usando **FastAPI** orgánicamente acoplado con **Mangum**.
- Desplegado dentro de una función Lambda conectada mediante una integración de Proxy API Gateway que mapea el tráfico impecablemente.
- Traduce las peticiones REST dinámicas del usuario limpiamente en consultas de DynamoDB (FilterExpressions para cohetes y estado).
- Maneja la lógica de Paginación basada en cursores y tokens Base64 de forma transparente y nativa.

---

## Infraestructura de Pruebas y Control de Calidad

Este código base impone una estricta separación de responsabilidades, desacoplando la lógica del script de Ingestión rigurosamente para una lógica TDD (Desarrollo Guiado por Pruebas) utilizando `pytest`.

### El Stack de Pruebas
* **`pytest`**: Framework de ejecución de pruebas para exigir límites estrictos.
* **`moto[dynamodb]`**: Levanta servicios AWS completamente simulados (mock) rápidamente en memoria para afirmar de forma segura el correcto mapeo de transacciones de bases de datos y sobreescrituras (probando dinámicamente cadenas de `PK` y `SK`, además de conversiones de Float en Boto3 Python) sin contaminar bases de datos externas reales.
* **`unittest.mock`**: Impone degradaciones seguras para aislar llamadas HTTP con `urllib`.

Para ejecutar las pruebas unitarias localmente de forma nativa:
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r backend/ingest/requirements-dev.txt

PYTHONPATH=backend/ingest LOCAL_DDB=1 python3 -m pytest backend/ingest/tests/ -v
```

---

## Guía de Desarrollo Local

¡Puedes ejecutar todo este ecosistema fácilmente, offline y completamente seguro, desacoplado de tus verdaderas cuentas de AWS en la nube! 

### Prerrequisitos

1.  [Python 3.13](https://www.python.org/downloads/)
2.  [Docker CLI](https://docs.docker.com/get-docker/) (utilizado para simular de forma completamente nativa bases de datos AWS en memoria).

### 1. Iniciar la Base de Datos Local Simulada (Mock)
Levanta de forma nativa la base `dynamodb-local` utilizando Docker. Deja esto ejecutándose silenciosa y seguramente de fondo en el puerto `8000`:
```bash
docker run -d -p 8000:8000 --name dynamodb-local amazon/dynamodb-local
```

### 2. Crear la Tabla Simulada (Mock Table)
Necesitamos construir rápidamente el esquema requerido internamente en la imagen local:
```bash
AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test AWS_DEFAULT_REGION=us-east-1 aws dynamodb create-table \
    --table-name SpaceXef-Data \
    --attribute-definitions AttributeName=PK,AttributeType=S AttributeName=SK,AttributeType=S \
    --key-schema AttributeName=PK,KeyType=HASH AttributeName=SK,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST \
    --endpoint-url http://localhost:8000
```

### 3. Poblar los Datos (Ejecutar Ingestión Offline)
¡Inyecta datos de forma segura de la API de SpaceX directamente mapeados hacia tu Nuevo Contenedor de Base de Datos Dynamo Simulada!
*(Al añadir la variable de entorno `LOCAL_DDB=1`, nuestra implementación desacoplada y segura de boto3 intercepta las peticiones de internet y fuerza el tráfico directo hacia el puerto local 8000).*

```bash
pip install -r backend/ingest/requirements-dev.txt
LOCAL_DDB=1 python3 backend/ingest/core_ingestion.py
```

### 4. Ejecutar el Ecosistema de la API localmente
Una vez que la ingestión ocurre perfectamente y con éxito, sitúate en la raíz e inicia de forma nativa FastAPI utilizando `uvicorn`.

```bash
pip3 install -r backend/app/requirements.txt
LOCAL_DDB=1 python3 -m uvicorn backend.app.main:app --reload --port 8001
```

**¡Y listo!** 
Tráfico de visualización del mundo real totalmente desacoplado y disponible de forma segura y nativa:
* **Ruta de Lectura JSON:** [http://localhost:8001/launches?limit=2](http://localhost:8001/launches?limit=2)
* **API Interactive Swagger Documentation:** [http://localhost:8001/docs](http://localhost:8001/docs)
