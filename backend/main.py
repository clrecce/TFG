from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String, Date, Float, Text, select
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from codecarbon import EmissionsTracker
import requests

# 1. Configuración de FastAPI
app = FastAPI(
    title="EcoDev Platform API",
    description="Backend para la medición y optimización de huella de carbono con IA"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Conexión a MySQL
DATABASE_URL = "mysql+pymysql://root:@localhost:3306/ecodev_db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
metadata = MetaData()

# Tabla de Proyectos
proyectos = Table(
    "proyectos", metadata,
    Column("id", Integer, primary_key=True, index=True),
    Column("nombre", String(255), nullable=False),
    Column("fecha_inicio", Date),
    Column("estado", String(50))
)

# NUEVA: Tabla de Requisitos
requisitos = Table(
    "requisitos", metadata,
    Column("id", Integer, primary_key=True, index=True),
    Column("descripcion", Text, nullable=False),
    Column("prioridad", String(50)),
    Column("kwh_estimado", Float)
)

# 3. Esquemas Pydantic
class CodigoRequest(BaseModel):
    codigo: str

class RequisitoCreate(BaseModel):
    descripcion: str
    prioridad: str
    kwh_estimado: float

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 4. Endpoints

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Backend EcoDev 100% operativo."}

# --- ENDPOINTS DE REQUISITOS ---
@app.post("/requisitos")
def crear_requisito(req: RequisitoCreate, db: Session = Depends(get_db)):
    query = requisitos.insert().values(
        descripcion=req.descripcion,
        prioridad=req.prioridad,
        kwh_estimado=req.kwh_estimado
    )
    result = db.execute(query)
    db.commit()
    return {"id": result.lastrowid, "mensaje": "Requisito guardado exitosamente"}

@app.get("/requisitos")
def listar_requisitos(db: Session = Depends(get_db)):
    query = select(requisitos)
    resultado = db.execute(query).mappings().fetchall()
    return resultado

# --- ENDPOINT DE OPTIMIZACIÓN IA ---
@app.post("/optimizar-codigo")
def optimizar_codigo(req: CodigoRequest):
    tracker = EmissionsTracker(project_name="ecodev_ia_optimization", measure_power_secs=1)
    tracker.start()
    
    prompt_ia = (
        "Actúa como un desarrollador senior experto en Green Coding. "
        "Refactoriza el siguiente código HTML/CSS para que sea más semántico, limpio y consuma menos recursos. "
        "Devuelve SOLO el código optimizado, sin explicaciones extra:\n\n"
        f"{req.codigo}"
    )
    
    try:
        respuesta_ia = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "gemma:2b",
                "prompt": prompt_ia,
                "stream": False
            }
        )
        codigo_optimizado = respuesta_ia.json().get("response", "")
    except Exception as e:
        codigo_optimizado = f"Error al conectar con la IA local: {str(e)}"
        
    emisiones_kg = tracker.stop()
    
    return {
        "codigo_original": req.codigo,
        "codigo_optimizado": codigo_optimizado,
        "emisiones_co2_kg": emisiones_kg
    }