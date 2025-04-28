from .functional_leader import (
    FunctionalLeader,
    FunctionalLeaderUpdate,
    FunctionalLeaderResponse,
)
from .technical_leader import (
    TechnicalLeader,
    TechnicalLeaderResponse,
    TechnicalLeaderUpdate,
)
from .entorno import Entorno, EntornoResponse, EntornoUpdate
from .evc import EVC, EVCCreate, EVCResponse, EVCUpdate
from .evc_q import EVC_Q, EVC_QCreate, EVC_QResponse, EVC_QShortResponse
from .evc_financial import (
    EVC_Financial,
    EVC_FinancialCreate,
    EVC_FinancialResponse,
    EVC_FinancialUpdate,
)

# from .category_role import (
#     CategoryRole,
#     CategoryRoleCreate,
#     CategoryRoleResponse,
#     CategoryRoleUpdate,
# )
# from .role import Role, RoleCreate, RoleUpdate, RoleResponse
# from .role_provider import (
#     RoleProvider,
#     RoleProviderCreate,
#     RoleProviderUpdate,
#     RoleProviderResponse,
# )
# from .country import Country, CountryCreate, CountryUpdate, CountryResponse
# from .category_provider import (
#     CategoryProvider,
#     CategoryProviderCreate,
#     CategoryProviderUpdate,
#     CategoryProviderResponse,
# )
from .provider import ProviderCreate, ProviderResponse
from .user import User, UserCreate, UserUpdate, UserResponse, Token, TokenData
from .category import Category, CategoryCreate
from .user_category import UserCategory, UserCategoryCreate


schemas = [
    FunctionalLeader,
    TechnicalLeader,
    Entorno,
    EVC,
    EVC_Q,
    EVC_Financial,
    # CategoryRole,
    # CategoryRoleResponse,
    # Role,
    # RoleUpdate,
    # RoleResponse,
    # Country,
    # CountryUpdate,
    # CountryResponse,
    # CategoryProvider,
    # CategoryProviderUpdate,
    # CategoryProviderResponse,
    # Provider,
    # ProviderUpdate,
    ProviderResponse,
    # RoleProvider,
    # RoleProviderUpdate,
    # RoleProviderResponse,
    User,
    UserCreate,
    UserUpdate,
    UserResponse,
    Token,
    TokenData,
    UserCategory,
    UserCategoryCreate,
    Category,
    CategoryCreate,
]
responses = [
    FunctionalLeaderResponse,
    TechnicalLeaderResponse,
    EntornoResponse,
    EVCResponse,
    EVC_QResponse,
    EVC_FinancialResponse,
    EVC_QShortResponse,
]
schemas_update = [
    EntornoUpdate,
    FunctionalLeaderUpdate,
    TechnicalLeaderUpdate,
    EVCUpdate,
    EVC_FinancialUpdate,
    # CategoryRoleUpdate,
]

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
