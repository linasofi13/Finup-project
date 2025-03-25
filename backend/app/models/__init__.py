from app.database import Base
from app.models.evc import EVC
from app.models.evc_q import EVC_Q
from app.models.technical_leader import TechnicalLeader
from app.models.functional_leader import FunctionalLeader
from app.models.entorno import Entorno
from app.models.provider import Provider
from app.models.evc_provider import EVCProvider
from app.models.evc_financial import EVC_Financial

# This ensures all models are registered with SQLAlchemy
__all__ = [
    "EVC",
    "EVC_Q",
    "TechnicalLeader",
    "FunctionalLeader",
    "Entorno",
    "Provider",
    "EVCProvider",
    "EVC_Financial",
]
