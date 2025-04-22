from sqlalchemy.orm import Session
from app.models.provider import Provider
from app.schemas.provider import ProviderCreate
from app.repositories.notification_rule_repository import get_active_rules_by_table
from app.repositories.notification_repository import create_notification


def evaluate_notification_rules(entity_data: dict, db: Session, table_name: str):
    rules = get_active_rules_by_table(db, table_name)

    for rule in rules:
        field = rule.condition_field
        value = entity_data.get(field)

        if value is None:
            continue

        triggered = False
        if rule.comparison == ">" and value > rule.threshold:
            triggered = True
        elif rule.comparison == "<" and value < rule.threshold:
            triggered = True
        elif rule.comparison == "==" and value == rule.threshold:
            triggered = True
        elif rule.comparison == ">=" and value >= rule.threshold:
            triggered = True
        elif rule.comparison == "<=" and value <= rule.threshold:
            triggered = True

        if triggered:
            create_notification(db, {"message": rule.message, "type": rule.type})


def create_provider(db: Session, provider_data: ProviderCreate):
    provider = Provider(**provider_data.dict())
    db.add(provider)
    db.commit()
    db.refresh(provider)

    # Evaluar reglas de notificaciones
    evaluate_notification_rules(provider_data.dict(), db, "provider")

    return provider


def get_providers(db: Session):
    return db.query(Provider).all()


def get_provider_by_id(db: Session, provider_id: int):
    return db.query(Provider).filter(Provider.id == provider_id).first()


def delete_provider(db: Session, provider_id: int):
    provider = db.query(Provider).filter(Provider.id == provider_id).first()
    if provider:
        db.delete(provider)
        db.commit()
        return True
    return False


def update_provider(db: Session, provider_id: int, provider_data: ProviderCreate):
    provider = db.query(Provider).filter(Provider.id == provider_id).first()
    if provider:
        for key, value in provider_data.dict().items():
            setattr(provider, key, value)
        db.commit()
        db.refresh(provider)

        # Evaluar reglas después de actualizar
        evaluate_notification_rules(provider_data.dict(), db, "provider")

        return provider
    return None


def bulk_create_providers(db: Session, providers_data: list[ProviderCreate]):
    existing_emails = {
        p.email for p in db.query(Provider.email).all()
    }
    new_providers = []

    for provider_data in providers_data:
        if provider_data.email in existing_emails:
            continue
        provider_dict = provider_data.dict()
        provider = Provider(**provider_dict)
        db.add(provider)
        db.flush()  # Obtener ID sin commit aún
        evaluate_notification_rules(provider_dict, db, "provider")
        new_providers.append(provider)

    db.commit()
    return new_providers
