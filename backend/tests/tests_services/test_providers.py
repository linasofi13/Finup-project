import pytest
from sqlalchemy.orm import Session
from app.models.provider import Provider
from app.schemas.provider import ProviderCreate
from app.services.provider_service import create_provider, update_provider, delete_provider, get_provider_by_id

@pytest.fixture
def provider_data():
    """Datos de prueba para un proveedor."""
    return ProviderCreate(
        name="Proveedor Test",
        role="DevOps",
        company="Tech Corp",
        country="USA",
        cost_usd=1000.0,
        category="Cloud Services",
        line="Technical",
        email="test@provider.com"
    )

def test_create_provider(test_db: Session, provider_data):
    """Prueba la creación de un proveedor en la base de datos."""
    provider = create_provider(test_db, provider_data)
    
    assert provider.id is not None
    assert provider.name == provider_data.name
    assert provider.role == provider_data.role
    assert provider.company == provider_data.company
    assert provider.country == provider_data.country
    assert provider.cost_usd == provider_data.cost_usd
    assert provider.category == provider_data.category
    assert provider.line == provider_data.line
    assert provider.email == provider_data.email

def test_update_provider(test_db: Session, provider_data):
    """Prueba la actualización de un proveedor."""
    provider = create_provider(test_db, provider_data)
    
    updated_data = ProviderCreate(
        name="Proveedor Actualizado",
        role="Data Engineer",
        company="New Tech",
        country="Canada",
        cost_usd=1200.0,
        category="AI Services",
        line="Professional",
        email="updated@provider.com"
    )
    
    updated_provider = update_provider(test_db, provider.id, updated_data)
    
    assert updated_provider is not None
    assert updated_provider.name == "Proveedor Actualizado"
    assert updated_provider.role == "Data Engineer"
    assert updated_provider.company == "New Tech"
    assert updated_provider.country == "Canada"
    assert updated_provider.cost_usd == 1200.0
    assert updated_provider.category == "AI Services"
    assert updated_provider.line == "Professional"
    assert updated_provider.email == "updated@provider.com"

def test_delete_provider(test_db: Session, provider_data):
    """Prueba la eliminación de un proveedor."""
    provider = create_provider(test_db, provider_data)
    
    assert get_provider_by_id(test_db, provider.id) is not None
    
    result = delete_provider(test_db, provider.id)
    
    assert result is True
    assert get_provider_by_id(test_db, provider.id) is None
