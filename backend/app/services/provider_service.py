from sqlalchemy.orm import Session
from app.models.provider import Provider
from app.schemas.provider import ProviderCreate
from sqlalchemy.orm import Session, joinedload

def create_provider(db: Session, provider_data: ProviderCreate):
    """Creates a new provider in the database."""
    provider = Provider(**provider_data.dict())
    db.add(provider)
    db.commit()
    db.refresh(provider)
    return provider


def get_providers(db: Session) -> List[Provider]:
    providers = db.query(Provider).options(
        joinedload(Provider.category_provider),
        joinedload(Provider.category_line),
        joinedload(Provider.role_providers).joinedload(RoleProvider.role),
        joinedload(Provider.role_providers).joinedload(RoleProvider.country)
    ).all()
    
    for p in providers:
        if p.role_providers:
            rp = p.role_providers[0]  # Primer role_provider
            p.cost_usd = rp.price_usd
            p.country = rp.country.name if rp.country else None
            p.role = rp.role.name if rp.role else p.role

    return providers



def get_provider_by_id(db: Session, provider_id: int):
    """Returns a single provider by ID."""
    return db.query(Provider).filter(Provider.id == provider_id).first()


def delete_provider(db: Session, provider_id: int):
    """Deletes a provider by ID if found."""
    provider = db.query(Provider).filter(Provider.id == provider_id).first()
    if provider:
        db.delete(provider)
        db.commit()
        return True
    return False


# def update_provider(db: Session, provider_id: int, provider_data: ProviderCreate):
#     """Updates a provider by ID."""
#     provider = db.query(Provider).filter(Provider.id == provider_id).first()
#     if provider:
#         for key, value in provider_data.dict().items():
#             setattr(provider, key, value)
#         db.commit()
#         db.refresh(provider)
#         return provider
#     return None


def bulk_create_providers(db: Session, providers_data: list[ProviderCreate]):
    """Creates multiple providers in the database, avoiding duplicates."""
    existing_emails = {
        p.email for p in db.query(Provider.email).all()
    }  # Verificar duplicados
    new_providers = []

    for provider_data in providers_data:
        if provider_data.email in existing_emails:
            continue  # Saltar duplicados
        new_providers.append(Provider(**provider_data.dict()))

    db.bulk_save_objects(new_providers)
    db.commit()
    return new_providers
