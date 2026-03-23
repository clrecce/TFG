from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String, Date, Float, Text, Boolean, select, text, update, func
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel, constr, field_validator
from codecarbon import EmissionsTracker
import bcrypt # USAMOS BCRYPT DIRECTAMENTE
import requests
import datetime
import re

# 1. Configuración de FastAPI
app = FastAPI(title="EcoDev Platform API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# 2. Conexión a MySQL
DATABASE_URL = "mysql+pymysql://root:@localhost:3306/ecodev_db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
metadata = MetaData()

# Tablas del DER
proyectos = Table("proyectos", metadata, Column("id", Integer, primary_key=True), Column("nombre", String(255), nullable=False), Column("fecha_inicio", Date), Column("estado", String(50)))
requisitos = Table("requisitos", metadata, Column("id", Integer, primary_key=True), Column("descripcion", Text), Column("prioridad", String(50)), Column("kwh_estimado", Float), Column("proyecto_id", Integer))
optimizaciones = Table("optimizaciones", metadata, Column("id", Integer, primary_key=True), Column("codigo_original", Text), Column("codigo_optimizado", Text), Column("emisiones_co2_kg", Float), Column("fecha", Date))
configuracion = Table("configuracion", metadata, Column("id", Integer, primary_key=True), Column("nombre_completo", String(255)), Column("email", String(255)), Column("motor_ia", String(50)), Column("umbral_co2", Float))
alertas = Table("alertas", metadata, Column("id", Integer, primary_key=True), Column("severidad", String(50)), Column("mensaje", Text), Column("recomendacion", Text), Column("resuelta", Boolean, default=False), Column("fecha", Date))
usuarios = Table("usuarios", metadata, Column("id", Integer, primary_key=True), Column("nombre", String(255)), Column("email", String(255)), Column("password", String(255)), Column("rol", String(50)))
pruebas = Table("pruebas", metadata, Column("id", Integer, primary_key=True), Column("tipo", String(50)), Column("resultado", Boolean), Column("eficiencia_energetica", Float), Column("proyecto_id", Integer))
despliegues = Table("despliegues", metadata, Column("id", Integer, primary_key=True), Column("entorno", String(50)), Column("fecha_despliegue", Date), Column("metricas_eco", Text), Column("proyecto_id", Integer))
reportes = Table("reportes", metadata, Column("id", Integer, primary_key=True), Column("fecha", Date), Column("estimacion_co2", Float), Column("comparacion", Text))

# 3. Esquemas Pydantic
class ProyectoCreate(BaseModel): nombre: str; estado: str
class EstadoProyecto(BaseModel): estado: str
class CodigoRequest(BaseModel): codigo_ui: str; codigo_logica: str; lenguaje: str
class RequisitoCreate(BaseModel): descripcion: str; prioridad: str; kwh_estimado: float; proyecto_id: int
class ConfigUpdate(BaseModel): nombre_completo: str; motor_ia: str; umbral_co2: float
class LoginRequest(BaseModel): email: str; password: str
class MFARequest(BaseModel): pin: str

class RegistroRequest(BaseModel):
    nombre: str; email: str; password: str; rol: str
    @field_validator('password')
    def password_robusta(cls, v):
        if not re.match(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W]{8,16}$', v): raise ValueError('Contraseña débil')
        return v

class ChangePasswordRequest(BaseModel):
    email: str; actual: str; nueva: str
    @field_validator('nueva')
    def password_robusta(cls, v):
        if not re.match(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W]{8,16}$', v): raise ValueError('Contraseña nueva no cumple los requisitos de seguridad.')
        return v

class PruebaCreate(BaseModel): tipo: str; resultado: bool; eficiencia_energetica: float; proyecto_id: int
class DespliegueCreate(BaseModel): entorno: str; metricas_eco: str; proyecto_id: int
class ReporteCreate(BaseModel): estimacion_co2: float; comparacion: str

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

@app.get("/")
def read_root(): return {"status": "ok"}

# --- FUNCIONES DE SEGURIDAD (BCRYPT DIRECTO) ---
def hash_password(password: str) -> str:
    # Truncamos a 72 bytes por limitación de bcrypt
    pwd_bytes = password[:72].encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        pwd_bytes = plain_password[:72].encode('utf-8')
        hash_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except Exception:
        return False

# --- DASHBOARD GENERAL ---
@app.get("/dashboard-metrics")
def obtener_metricas_unificadas(db: Session = Depends(get_db)):
    total_proyectos = db.execute(select(func.count(proyectos.c.id))).scalar() or 0
    proyectos_activos = db.execute(select(func.count(proyectos.c.id)).where(proyectos.c.estado == "En Desarrollo")).scalar() or 0
    proyectos_desplegados = db.execute(select(func.count(proyectos.c.id)).where(proyectos.c.estado == "Desplegado")).scalar() or 0
    total_requisitos = db.execute(select(func.count(requisitos.c.id))).scalar() or 0
    total_pruebas = db.execute(select(func.count(pruebas.c.id))).scalar() or 0
    pruebas_exitosas = db.execute(select(func.count(pruebas.c.id)).where(pruebas.c.resultado == True)).scalar() or 0
    total_despliegues = db.execute(select(func.count(despliegues.c.id))).scalar() or 0
    total_co2_kg = db.execute(select(func.sum(optimizaciones.c.emisiones_co2_kg))).scalar() or 0
    total_optimizaciones = db.execute(select(func.count(optimizaciones.c.id))).scalar() or 0
    total_alertas_activas = db.execute(select(func.count(alertas.c.id)).where(alertas.c.resuelta == False)).scalar() or 0

    return {
        "resumen": {
            "proyectos": {"total": total_proyectos, "activos": proyectos_activos, "desplegados": proyectos_desplegados},
            "requisitos": {"total": total_requisitos},
            "calidad": {"total_pruebas": total_pruebas, "exitosas": pruebas_exitosas},
            "infraestructura": {"total_despliegues": total_despliegues},
            "alertas": {"activas": total_alertas_activas}
        },
        "impacto_ambiental": {"co2_total_generacion_kg": total_co2_kg, "total_optimizaciones_ia": total_optimizaciones}
    }

# --- PROYECTOS Y REQUISITOS ---
@app.post("/proyectos")
def crear_proyecto(req: ProyectoCreate, db: Session = Depends(get_db)):
    db.execute(proyectos.insert().values(nombre=req.nombre, fecha_inicio=datetime.datetime.now().date(), estado=req.estado))
    db.commit()
    return {"status": "ok"}

@app.get("/proyectos")
def listar_proyectos(db: Session = Depends(get_db)):
    return db.execute(select(proyectos).order_by(text("id DESC"))).mappings().fetchall()

@app.put("/proyectos/{proyecto_id}/estado")
def actualizar_estado_proyecto(proyecto_id: int, req: EstadoProyecto, db: Session = Depends(get_db)):
    db.execute(update(proyectos).where(proyectos.c.id == proyecto_id).values(estado=req.estado))
    db.commit()
    return {"status": "ok"}

@app.delete("/proyectos/{proyecto_id}")
def eliminar_proyecto(proyecto_id: int, db: Session = Depends(get_db)):
    db.execute(requisitos.delete().where(requisitos.c.proyecto_id == proyecto_id))
    db.execute(despliegues.delete().where(despliegues.c.proyecto_id == proyecto_id))
    db.execute(pruebas.delete().where(pruebas.c.proyecto_id == proyecto_id))
    db.execute(proyectos.delete().where(proyectos.c.id == proyecto_id))
    db.commit()
    return {"status": "ok"}

@app.post("/requisitos")
def crear_requisito(req: RequisitoCreate, db: Session = Depends(get_db)):
    db.execute(requisitos.insert().values(descripcion=req.descripcion, prioridad=req.prioridad, kwh_estimado=req.kwh_estimado, proyecto_id=req.proyecto_id))
    db.execute(update(proyectos).where(proyectos.c.id == req.proyecto_id, proyectos.c.estado == "En Planificación").values(estado="En Desarrollo"))
    db.commit()
    return {"status": "ok"}

@app.get("/requisitos")
def listar_requisitos(db: Session = Depends(get_db)):
    return db.execute(select(requisitos).order_by(text("id DESC"))).mappings().fetchall()

@app.delete("/requisitos/{req_id}")
def eliminar_requisito(req_id: int, db: Session = Depends(get_db)):
    db.execute(requisitos.delete().where(requisitos.c.id == req_id))
    db.commit()
    return {"status": "ok"}

# --- SEGURIDAD: HASHING Criptográfico ---
@app.post("/registro")
def registrar_usuario(req: RegistroRequest, db: Session = Depends(get_db)):
    if db.execute(select(usuarios).where(usuarios.c.email == req.email)).first(): raise HTTPException(status_code=400, detail="Correo registrado.")
    
    # ENCRIPTAMOS LA CLAVE
    hashed_password = hash_password(req.password)
    db.execute(usuarios.insert().values(nombre=req.nombre, email=req.email, password=hashed_password, rol=req.rol))
    db.commit()
    return {"status": "ok"}

@app.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.execute(select(usuarios).where(usuarios.c.email == req.email)).mappings().first()
    if not user: raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    
    # Validamos la clave (con fallback para usuarios no encriptados de prueba)
    if not verify_password(req.password, user['password']) and req.password != user['password']:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    
    return {"status": "mfa_required", "email": user['email'], "rol": user['rol']}

@app.post("/mfa-verify")
def verify_mfa(req: MFARequest):
    if req.pin == "123456": return {"status": "success"}
    raise HTTPException(status_code=401, detail="PIN MFA Inválido")

@app.put("/cambiar-password")
def cambiar_password(req: ChangePasswordRequest, db: Session = Depends(get_db)):
    user = db.execute(select(usuarios).where(usuarios.c.email == req.email)).mappings().first()
    if not user: raise HTTPException(status_code=400, detail="Usuario no encontrado.")
    
    # Validamos clave actual
    if not verify_password(req.actual, user['password']) and req.actual != user['password']:
        raise HTTPException(status_code=400, detail="La contraseña actual es incorrecta.")
    
    # Guardamos nuevo hash
    hashed_nueva = hash_password(req.nueva)
    db.execute(update(usuarios).where(usuarios.c.email == req.email).values(password=hashed_nueva))
    db.commit()
    return {"status": "ok", "mensaje": "Contraseña actualizada exitosamente."}

# --- PRUEBAS, DESPLIEGUES, REPORTES, ALERTAS, OPTIMIZACION ---
@app.post("/pruebas")
def registrar_prueba(req: PruebaCreate, db: Session = Depends(get_db)):
    db.execute(pruebas.insert().values(tipo=req.tipo, resultado=req.resultado, eficiencia_energetica=req.eficiencia_energetica, proyecto_id=req.proyecto_id))
    db.commit()
    return {"status": "ok"}

@app.post("/despliegues")
def registrar_despliegue(req: DespliegueCreate, db: Session = Depends(get_db)):
    db.execute(despliegues.insert().values(entorno=req.entorno, fecha_despliegue=datetime.datetime.now().date(), metricas_eco=req.metricas_eco, proyecto_id=req.proyecto_id))
    db.commit()
    return {"status": "ok"}

@app.get("/despliegues")
def listar_despliegues(db: Session = Depends(get_db)):
    query = text("SELECT d.id, d.fecha_despliegue, d.entorno, d.metricas_eco, p.nombre as proyecto_nombre FROM despliegues d JOIN proyectos p ON d.proyecto_id = p.id ORDER BY d.id DESC")
    return db.execute(query).mappings().fetchall()

@app.post("/reportes-log")
def registrar_reporte(req: ReporteCreate, db: Session = Depends(get_db)):
    db.execute(reportes.insert().values(fecha=datetime.datetime.now().date(), estimacion_co2=req.estimacion_co2, comparacion=req.comparacion))
    db.commit()
    return {"status": "ok"}

@app.get("/reportes-log")
def listar_reportes(db: Session = Depends(get_db)):
    return db.execute(select(reportes).order_by(text("id DESC"))).mappings().fetchall()

@app.get("/configuracion")
def obtener_configuracion(db: Session = Depends(get_db)): return db.execute(select(configuracion).where(configuracion.c.id == 1)).mappings().first()

@app.put("/configuracion")
def actualizar_configuracion(req: ConfigUpdate, db: Session = Depends(get_db)):
    db.execute(update(configuracion).where(configuracion.c.id == 1).values(nombre_completo=req.nombre_completo, motor_ia=req.motor_ia, umbral_co2=req.umbral_co2))
    db.commit()
    return {"status": "ok"}

@app.get("/alertas")
def listar_alertas(db: Session = Depends(get_db)): return db.execute(select(alertas).order_by(text("id DESC"))).mappings().fetchall()

@app.put("/alertas/{alerta_id}/resolver")
def resolver_alerta(alerta_id: int, db: Session = Depends(get_db)):
    db.execute(update(alertas).where(alertas.c.id == alerta_id).values(resuelta=True))
    db.commit()
    return {"status": "ok"}

@app.post("/optimizar-codigo")
def optimizar_codigo(req: CodigoRequest, db: Session = Depends(get_db)):
    tracker = EmissionsTracker(project_name="ecodev_ia", measure_power_secs=1)
    tracker.start()
    prompt_ia = (
        "Actúa como un desarrollador senior experto en Green Coding y refactorización semántica.\n"
        "Te proporcionaré un diseño Frontend (HTML/CSS) y una lógica Backend (Código Fuente).\n"
        f"Debes optimizar el código completo basándote en el lenguaje seleccionado: {req.lenguaje}.\n\n"
        "Reglas:\n"
        "1. Optimiza el Frontend para accesibilidad, SEO y renderizado rápido del DOM.\n"
        "2. Optimiza la Lógica Backend usando mejores prácticas de Green Coding para {req.lenguaje}.\n"
        "3. Devuelve SOLO el código unificado y optimizado, sin explicaciones.\n\n"
        f"--- DISEÑO FRONTEND ---\n{req.codigo_ui}\n\n"
        f"--- LÓGICA BACKEND ({req.lenguaje}) ---\n{req.codigo_logica}"
    )
    try:
        respuesta_ia = requests.post("http://localhost:11434/api/generate", json={"model": "gemma:2b", "prompt": prompt_ia, "stream": False})
        codigo_optimizado = respuesta_ia.json().get("response", "")
    except Exception as e:
        codigo_optimizado = f"Error IA: {str(e)}"
        
    emisiones_kg = tracker.stop()

    codigo_completo_original = f"UI:\n{req.codigo_ui}\nLogica:\n{req.codigo_logica}"
    db.execute(optimizaciones.insert().values(codigo_original=codigo_completo_original, codigo_optimizado=codigo_optimizado, emisiones_co2_kg=emisiones_kg, fecha=datetime.datetime.now().date()))
    
    config = db.execute(select(configuracion).where(configuracion.c.id == 1)).mappings().first()
    umbral = config['umbral_co2'] if config else 0.05
    if emisiones_kg > umbral:
        db.execute(alertas.insert().values(severidad="Alta", mensaje=f"Pico detectado: La refactorización generó {emisiones_kg:.6f} kg CO2.", recomendacion="Revisar código full-stack enviado o umbral LLM.", resuelta=False, fecha=datetime.datetime.now().date()))

    db.commit()
    return {"codigo_optimizado": codigo_optimizado, "emisiones_co2_kg": emisiones_kg}

@app.get("/optimizaciones")
def listar_optimizaciones(db: Session = Depends(get_db)): return db.execute(select(optimizaciones).order_by(text("id DESC"))).mappings().fetchall()