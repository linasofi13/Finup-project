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

                # EVC Budget Usage Alerts
                elif comparison == "custom:evc_high_usage":
                    if changed_id:
                        q = db.execute(text("SELECT id, evc_id, allocated_percentage FROM evc_q WHERE id = :id"), {"id": changed_id}).fetchone()
                        if q and q.allocated_percentage > 70 and q.allocated_percentage <= 90:
                            db.add(
                                Notification(
                                    message=f"El cuatrimestre (ID: {q.id}) del EVC {q.evc_id} tiene un uso de presupuesto superior al 70%.",
                                    type=rule.type,
                                    read=False
                                )
                            )
                    else:
                        qs = db.execute(text("SELECT id, evc_id, allocated_percentage FROM evc_q WHERE allocated_percentage > 70 AND allocated_percentage <= 90")).fetchall()
                        for q in qs:
                            db.add(
                                Notification(
                                    message=f"El cuatrimestre (ID: {q.id}) del EVC {q.evc_id} tiene un uso de presupuesto superior al 70%.",
                                    type=rule.type,
                                    read=False
                                )
                            )

                elif comparison == "custom:evc_critical_usage":
                    if changed_id:
                        q = db.execute(text("SELECT id, evc_id, allocated_percentage FROM evc_q WHERE id = :id"), {"id": changed_id}).fetchone()
                        if q and q.allocated_percentage > 90:
                            db.add(
                                Notification(
                                    message=f"El cuatrimestre (ID: {q.id}) del EVC {q.evc_id} tiene un uso de presupuesto superior al 90%.",
                                    type=rule.type,
                                    read=False
                                )
                            )
                    else:
                        qs = db.execute(text("SELECT id, evc_id, allocated_percentage FROM evc_q WHERE allocated_percentage > 90")).fetchall()
                        for q in qs:
                            db.add(
                                Notification(
                                    message=f"El cuatrimestre (ID: {q.id}) del EVC {q.evc_id} tiene un uso de presupuesto superior al 90%.",
                                    type=rule.type,
                                    read=False
                                )
                            )

                elif comparison == "custom:evc_low_usage":
                    if changed_id:
                        q = db.execute(text("SELECT id, evc_id, allocated_percentage FROM evc_q WHERE id = :id"), {"id": changed_id}).fetchone()
                        if q and q.allocated_percentage < 30:
                            db.add(
                                Notification(
                                    message=f"El cuatrimestre (ID: {q.id}) del EVC {q.evc_id} tiene un uso de presupuesto inferior al 30%.",
                                    type=rule.type,
                                    read=False
                                )
                            )
                    else:
                        qs = db.execute(text("SELECT id, evc_id, allocated_percentage FROM evc_q WHERE allocated_percentage < 30")).fetchall()
                        for q in qs:
                            db.add(
                                Notification(
                                    message=f"El cuatrimestre (ID: {q.id}) del EVC {q.evc_id} tiene un uso de presupuesto inferior al 30%.",
                                    type=rule.type,
                                    read=False
                                )
                            )

                # EVC Budget Allocation Alerts
                elif comparison == "custom:evc_budget_increase":
                    if changed_id:
                        q = db.execute(text("""
                            SELECT id, evc_id, year, q, allocated_budget,
                                LAG(allocated_budget) OVER (PARTITION BY evc_id ORDER BY year, q) as prev_budget
                            FROM evc_q WHERE id = :id
                        """), {"id": changed_id}).fetchone()
                        if q and q.prev_budget is not None and q.allocated_budget > q.prev_budget * 1.5:
                            db.add(
                                Notification(
                                    message=f"El cuatrimestre (ID: {q.id}) del EVC {q.evc_id} tuvo un aumento significativo de presupuesto respecto al anterior.",
                                    type=rule.type,
                                    read=False
                                )
                            )
                    else:
                        qs = db.execute(text("""
                            WITH evc_quarters AS (
                                SELECT 
                                    id, evc_id, year, q, allocated_budget,
                                    LAG(allocated_budget) OVER (PARTITION BY evc_id ORDER BY year, q) as prev_budget
                                FROM evc_q
                            )
                            SELECT * FROM evc_quarters WHERE allocated_budget > prev_budget * 1.5 AND prev_budget IS NOT NULL
                        """)).fetchall()
                        for q in qs:
                            db.add(
                                Notification(
                                    message=f"El cuatrimestre (ID: {q.id}) del EVC {q.evc_id} tuvo un aumento significativo de presupuesto respecto al anterior.",
                                    type=rule.type,
                                    read=False
                                )
                            )

                elif comparison == "custom:evc_budget_decrease":
                    if changed_id:
                        q = db.execute(text("""
                            SELECT id, evc_id, year, q, allocated_budget,
                                LAG(allocated_budget) OVER (PARTITION BY evc_id ORDER BY year, q) as prev_budget
                            FROM evc_q WHERE id = :id
                        """), {"id": changed_id}).fetchone()
                        if q and q.prev_budget is not None and q.allocated_budget < q.prev_budget * 0.5:
                            db.add(
                                Notification(
                                    message=f"El cuatrimestre (ID: {q.id}) del EVC {q.evc_id} tuvo una disminución significativa de presupuesto respecto al anterior.",
                                    type=rule.type,
                                    read=False
                                )
                            )
                    else:
                        qs = db.execute(text("""
                            WITH evc_quarters AS (
                                SELECT 
                                    id, evc_id, year, q, allocated_budget,
                                    LAG(allocated_budget) OVER (PARTITION BY evc_id ORDER BY year, q) as prev_budget
                                FROM evc_q
                            )
                            SELECT * FROM evc_quarters WHERE allocated_budget < prev_budget * 0.5 AND prev_budget IS NOT NULL
                        """)).fetchall()
                        for q in qs:
                            db.add(
                                Notification(
                                    message=f"El cuatrimestre (ID: {q.id}) del EVC {q.evc_id} tuvo una disminución significativa de presupuesto respecto al anterior.",
                                    type=rule.type,
                                    read=False
                                )
                            )

                # EVC Status Alerts
                elif comparison == "custom:evc_no_technical":
                    if changed_id:
                        evc = db.execute(text("SELECT id, name FROM evc WHERE id = :id AND technical_leader_id IS NULL"), {"id": changed_id}).fetchone()
                        if evc:
                            db.add(
                                Notification(
                                    message=f"El EVC '{evc.name}' (ID: {evc.id}) no tiene líder técnico asignado.",
                                    type=rule.type,
                                    read=False
                                )
                            )
                    else:
                        evcs = db.execute(text("SELECT id, name FROM evc WHERE technical_leader_id IS NULL")).fetchall()
                        for evc in evcs:
                            db.add(
                                Notification(
                                    message=f"El EVC '{evc.name}' (ID: {evc.id}) no tiene líder técnico asignado.",
                                    type=rule.type,
                                    read=False
                                )
                            )

                elif comparison == "custom:evc_no_functional":
                    if changed_id:
                        evc = db.execute(text("SELECT id, name FROM evc WHERE id = :id AND functional_leader_id IS NULL"), {"id": changed_id}).fetchone()
                        if evc:
                            db.add(
                                Notification(
                                    message=f"El EVC '{evc.name}' (ID: {evc.id}) no tiene líder funcional asignado.",
                                    type=rule.type,
                                    read=False
                                )
                            )
                    else:
                        evcs = db.execute(text("SELECT id, name FROM evc WHERE functional_leader_id IS NULL")).fetchall()
                        for evc in evcs:
                            db.add(
                                Notification(
                                    message=f"El EVC '{evc.name}' (ID: {evc.id}) no tiene líder funcional asignado.",
                                    type=rule.type,
                                    read=False
                                )
                            )

                elif comparison == "custom:evc_no_entorno":
                    if changed_id:
                        evc = db.execute(text("SELECT id, name FROM evc WHERE id = :id AND entorno_id IS NULL"), {"id": changed_id}).fetchone()
                        if evc:
                            db.add(
                                Notification(
                                    message=f"El EVC '{evc.name}' (ID: {evc.id}) no tiene entorno asignado.",
                                    type=rule.type,
                                    read=False
                                )
                            )
                    else:
                        evcs = db.execute(text("SELECT id, name FROM evc WHERE entorno_id IS NULL")).fetchall()
                        for evc in evcs:
                            db.add(
                                Notification(
                                    message=f"El EVC '{evc.name}' (ID: {evc.id}) no tiene entorno asignado.",
                                    type=rule.type,
                                    read=False
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
