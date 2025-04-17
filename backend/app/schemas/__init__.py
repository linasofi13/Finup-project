from .functional_leader import FunctionalLeader, FunctionalLeaderUpdate, FunctionalLeaderResponse
from .technical_leader import TechnicalLeader, TechnicalLeaderResponse, TechnicalLeaderUpdate
from .entorno import Entorno, EntornoResponse, EntornoUpdate
from .evc import EVC, EVCCreate, EVCResponse, EVCUpdate
from .evc_q import EVC_Q, EVC_QCreate
from .evc_financial import EVC_Financial, EVC_FinancialCreate
from .category_role import CategoryRole, CategoryRoleCreate
from .role import Role, RoleCreate
from .role_provider import RoleProvider, RoleProviderCreate
from .country import Country, CountryCreate
from .category_provider import CategoryProvider, CategoryProviderCreate
from .provider import Provider, ProviderCreate
from .app_user import AppUser, AppUserCreate
from .category import Category, CategoryCreate
from .app_user_category import AppUserCategory, AppUserCategoryCreate


schemas=[FunctionalLeader, TechnicalLeader, Entorno, EVC]
responses=[FunctionalLeaderResponse, TechnicalLeaderResponse, EntornoResponse, EVCResponse]
schemas_update=[EntornoUpdate,FunctionalLeaderUpdate, TechnicalLeaderUpdate, EVCUpdate]

for schema in schemas:
    schema.model_rebuild()
for response in responses:
    response.model_rebuild()
    
for schema_update in schemas_update:
    schema_update.model_rebuild()



# FunctionalLeader.model_rebuild()
# TechnicalLeader.model_rebuild()
# Entorno.model_rebuild()
# FunctionalLeaderResponse.model_rebuild()
# EntornoResponse.model_rebuild()
