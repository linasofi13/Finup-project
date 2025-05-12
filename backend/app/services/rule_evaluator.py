from sqlalchemy.orm import Session
from app.models.notification_rule import NotificationRule
from app.models.notification import Notification
from app.models.provider import Provider
from sqlalchemy import func, text


def evaluate_rules(db: Session, changed_table: str = None, changed_id: int = None):
    """
    Evalúa reglas activas, opcionalmente filtradas por tabla o entidad modificada.

    :param db: DB session
    :param changed_table: (opcional) nombre de la tabla afectada
    :param changed_id: (opcional) ID del registro afectado
    """
    query_rules = db.query(NotificationRule).filter(NotificationRule.active.is_(True))

    if changed_table:
        query_rules = query_rules.filter(NotificationRule.target_table == changed_table)

    rules = query_rules.all()

    for rule in rules:
        table = rule.target_table
        field = rule.condition_field
        comparison = rule.comparison
        threshold = rule.threshold

        try:
            if comparison.startswith("custom:"):
                # Evaluaciones personalizadas
                if comparison == "custom:min_cost":
                    min_cost = db.query(func.min(Provider.cost_usd)).scalar()
                    newest = db.query(Provider).order_by(Provider.id.desc()).first()
                    if newest and newest.cost_usd == min_cost:
                        db.add(
                            Notification(
                                message=rule.message, type=rule.type, read=False
                            )
                        )

                elif comparison == "custom:is_null_technical":
                    sql = "SELECT COUNT(*) FROM evc WHERE technical_leader_id IS NULL"
                    result = db.execute(text(sql)).scalar()
                    if result > 0:
                        db.add(
                            Notification(
                                message=rule.message, type=rule.type, read=False
                            )
                        )

                elif comparison == "custom:is_null_functional":
                    sql = "SELECT COUNT(*) FROM evc WHERE functional_leader_id IS NULL"
                    result = db.execute(text(sql)).scalar()
                    if result > 0:
                        db.add(
                            Notification(
                                message=rule.message, type=rule.type, read=False
                            )
                        )

                elif comparison == "custom:empty_country":
                    sql = "SELECT COUNT(*) FROM provider WHERE country IS NULL OR TRIM(country) = ''"
                    result = db.execute(text(sql)).scalar()
                    if result > 0:
                        db.add(
                            Notification(
                                message=rule.message, type=rule.type, read=False
                            )
                        )

                elif comparison == "custom:empty_category":
                    sql = "SELECT COUNT(*) FROM provider WHERE category IS NULL OR TRIM(category) = ''"
                    result = db.execute(text(sql)).scalar()
                    if result > 0:
                        db.add(
                            Notification(
                                message=rule.message, type=rule.type, read=False
                            )
                        )

            else:
                if changed_id:
                    sql = f"SELECT COUNT(*) FROM {table} WHERE id = :id AND {field} {comparison} :val"
                    result = db.execute(
                        text(sql), {"id": changed_id, "val": threshold}
                    ).scalar()
                else:
                    sql = (
                        f"SELECT COUNT(*) FROM {table} WHERE {field} {comparison} :val"
                    )
                    result = db.execute(text(sql), {"val": threshold}).scalar()

                if result > 0:
                    db.add(
                        Notification(message=rule.message, type=rule.type, read=False)
                    )

        except Exception as e:
            print(f"[evaluate_rules] Error evaluando regla '{rule.name}':", e)

    db.commit()
