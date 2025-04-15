from app.database import Base
from app.models.app_user_category import AppUserCategory
from app.models.app_user import AppUser
from app.models.category_provider import CategoryProvider
from app.models.category_role import CategoryRole
from app.models.category import Category
from app.models.country import Country
from app.models.entorno import Entorno
from app.models.evc_financial import EVC_Financial
# from app.models.evc_provider import EVCProvider
from app.models.evc_q import EVC_Q
from app.models.evc import EVC
from app.models.functional_leader import FunctionalLeader
from app.models.provider import Provider
from app.models.role_provider import RoleProvider
from app.models.role import Role
from app.models.technical_leader import TechnicalLeader
from app.models.user import User



# This ensures all models are registered with SQLAlchemy
__all__ = [
    "AppUserCategory",
    "AppUser",
    "CategoryProvider",
    "CategoryRole",
    "Category",
    "Country",
    "Entorno",
    "EVC_Financial",
    # "EVCProvider",
    "EVC_Q",
    "EVC",
    "FunctionalLeader",
    "Provider",
    "RoleProvider",
    "Role",
    "TechnicalLeader",
    "User",
    
]
