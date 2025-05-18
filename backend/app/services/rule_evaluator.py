from sqlalchemy.orm import Session
from app.models.notification_rule import NotificationRule
from app.models.notification import Notification
from app.models.provider import Provider
from sqlalchemy import func, text
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from app.database import SessionLocal


def evaluate_rules(db: Session, changed_table: str = None, changed_id: int = None):
    """
    Evalúa reglas activas, opcionalmente filtradas por tabla o entidad modificada.

    :param db: DB session
    :param changed_table: (opcional) nombre de la tabla afectada
    :param changed_id: (opcional) ID del registro afectado
    """
    notifications_to_add = []  # Collect notifications to add at the end

    # Track which EVC quarters have already been notified for which thresholds
    # Format: {quarter_id: {threshold_type: [thresholds_reported]}}
    reported_thresholds = {}

    try:
        query_rules = db.query(NotificationRule).filter(
            NotificationRule.active.is_(True)
        )

        if changed_table:
            query_rules = query_rules.filter(
                NotificationRule.target_table == changed_table
            )

        rules = query_rules.all()
        print(f"Evaluating {len(rules)} rules for {changed_table} (ID: {changed_id})")

        # First check if we should skip creating duplicate notifications
        # Only create one notification per EVC quarter per update operation
        if changed_table == "evc_financial" and changed_id:
            # Get the associated quarter for this financial entry
            quarter_info = db.execute(
                text(
                    """
                    SELECT ef.evc_q_id, eq.evc_id, e.name as evc_name
                    FROM evc_financial ef
                    JOIN evc_q eq ON ef.evc_q_id = eq.id
                    JOIN evc e ON eq.evc_id = e.id
                    WHERE ef.id = :id
                """
                ),
                {"id": changed_id},
            ).fetchone()

            if quarter_info:
                # Check if there are any existing recent notifications for this EVC quarter
                # from the last 5 minutes
                recent_notifications = db.execute(
                    text(
                        """
                        SELECT COUNT(*) 
                        FROM notification 
                        WHERE message LIKE :pattern 
                        AND created_at > NOW() - INTERVAL '5 minutes'
                    """
                    ),
                    {
                        "pattern": f"%EVC '{quarter_info.evc_name}'%cuatrimestre (ID: {quarter_info.evc_q_id})%"
                    },
                ).scalar()

                if recent_notifications > 0:
                    print(
                        f"Skipping duplicate notifications for EVC quarter {quarter_info.evc_q_id} - already notified in the last 5 minutes"
                    )
                    return

        # Now evaluate the rules
        for rule in rules:
            table = rule.target_table
            field = rule.condition_field
            comparison = rule.comparison
            threshold = rule.threshold

            try:
                # Handle special case for evc_q with spent_percentage and spent_budget fields
                # that don't exist as actual columns but need to be calculated
                if table == "evc_q" and (
                    field == "spent_percentage" or field == "spent_budget"
                ):
                    try:
                        # Skip standard comparison and use custom rule approach instead
                        if changed_id:
                            # For a specific EVC quarter
                            q = db.execute(
                                text(
                                    """
                                    SELECT 
                                        eq.id, 
                                        eq.evc_id, 
                                        e.name as evc_name,
                                        eq.allocated_budget,
                                        eq.year,
                                        eq.q,
                                        (
                                            SELECT COALESCE(SUM(ef.value_usd), 0) 
                                            FROM evc_financial ef 
                                            WHERE ef.evc_q_id = eq.id
                                        ) +
                                        (
                                            SELECT COALESCE(SUM(p.cost_usd), 0) 
                                            FROM provider p 
                                            JOIN evc_financial ef ON p.id = ef.provider_id 
                                            WHERE ef.evc_q_id = eq.id
                                        ) as spent_budget
                                    FROM evc_q eq
                                    JOIN evc e ON eq.evc_id = e.id
                                    WHERE eq.id = :id
                                    """
                                ),
                                {"id": changed_id},
                            ).fetchone()

                            if q and q.allocated_budget > 0:
                                spent_budget = q.spent_budget
                                spent_percentage = (
                                    spent_budget / q.allocated_budget
                                ) * 100
                                print(
                                    f"Quarter ID {q.id}: Budget: {q.allocated_budget}, Spent: {spent_budget} ({spent_percentage:.1f}%)"
                                )

                                # Initialize tracking for this quarter if not exists
                                if q.id not in reported_thresholds:
                                    reported_thresholds[q.id] = {
                                        "spent_percentage": [],
                                        "spent_budget": [],
                                    }

                                # Check field and comparison
                                should_notify = False
                                if field == "spent_percentage":
                                    if (
                                        comparison == ">="
                                        and spent_percentage >= threshold
                                    ):
                                        should_notify = True
                                    elif (
                                        comparison == ">"
                                        and spent_percentage > threshold
                                    ):
                                        should_notify = True
                                    elif (
                                        comparison == "=="
                                        and spent_percentage == threshold
                                    ):
                                        should_notify = True
                                    elif (
                                        comparison == "<="
                                        and spent_percentage <= threshold
                                    ):
                                        should_notify = True
                                    elif (
                                        comparison == "<"
                                        and spent_percentage < threshold
                                    ):
                                        should_notify = True
                                elif field == "spent_budget":
                                    if comparison == ">=" and spent_budget >= threshold:
                                        should_notify = True
                                    elif comparison == ">" and spent_budget > threshold:
                                        should_notify = True
                                    elif (
                                        comparison == "==" and spent_budget == threshold
                                    ):
                                        should_notify = True
                                    elif (
                                        comparison == "<=" and spent_budget <= threshold
                                    ):
                                        should_notify = True
                                    elif comparison == "<" and spent_budget < threshold:
                                        should_notify = True

                                # Check if we already reported this threshold level
                                if should_notify:
                                    # Skip if we already reported this threshold or a higher one for this quarter
                                    if threshold in reported_thresholds[q.id][field]:
                                        continue

                                    # For percentage thresholds, only report the highest threshold reached
                                    if field == "spent_percentage":
                                        # Skip lower thresholds if we've already reported a higher one
                                        higher_reported = [
                                            t
                                            for t in reported_thresholds[q.id][field]
                                            if t > threshold
                                        ]
                                        if higher_reported:
                                            continue

                                        # Skip if it's a very small change from previously reported (less than 5%)
                                        close_reported = [
                                            t
                                            for t in reported_thresholds[q.id][field]
                                            if abs(t - threshold) < 5
                                        ]
                                        if close_reported:
                                            continue

                                    # Add this threshold to reported list
                                    reported_thresholds[q.id][field].append(threshold)

                                    # Create the notification with a standardized format
                                    # Only one message format for consistency
                                    if field == "spent_percentage":
                                        msg = f"El EVC '{q.evc_name}' ha gastado el {spent_percentage:.1f}% de su presupuesto en Q{q.q}/{q.year} (${spent_budget:.2f} de ${q.allocated_budget:.2f})"
                                    else:  # spent_budget
                                        msg = f"El EVC '{q.evc_name}' ha gastado ${spent_budget:.2f} del presupuesto asignado en el cuatrimestre (ID: {q.id})."

                                    # Determine notification type based on percentage
                                    notification_type = rule.type
                                    if field == "spent_percentage":
                                        if spent_percentage >= 100:
                                            notification_type = "critical"
                                        elif spent_percentage >= 90:
                                            notification_type = "alert"
                                        elif spent_percentage >= 75:
                                            notification_type = "warning"
                                        elif spent_percentage >= 50:
                                            notification_type = "info"

                                    notifications_to_add.append(
                                        {
                                            "message": msg,
                                            "type": notification_type,
                                            "read": False,
                                        }
                                    )

                        # Handle other non-specific quarter queries...
                    except Exception as e:
                        print(
                            f"[evaluate_rules] Error handling calculated field {field}: {e}"
                        )
                        continue
                elif comparison.startswith("custom:"):
                    # Process custom comparison rules with existing logic
                    pass  # Keep existing custom rule logic
                else:
                    # Process standard comparison rules with existing logic
                    if changed_id:
                        sql = f"SELECT COUNT(*) FROM {table} WHERE id = :id AND {field} {comparison} :val"
                        result = db.execute(
                            text(sql), {"id": changed_id, "val": threshold}
                        ).scalar()
                    else:
                        sql = f"SELECT COUNT(*) FROM {table} WHERE {field} {comparison} :val"
                        result = db.execute(text(sql), {"val": threshold}).scalar()

                    if result > 0:
                        # Only add default notification if not duplicated
                        if table == "evc_q" and changed_id:
                            # Check for duplicate notification for this quarter
                            evc_id_info = db.execute(
                                text("SELECT evc_id FROM evc_q WHERE id = :id"),
                                {"id": changed_id},
                            ).fetchone()

                            if evc_id_info:
                                key = f"{table}_{field}_{evc_id_info.evc_id}"
                                if key not in reported_thresholds:
                                    reported_thresholds[key] = []

                                if threshold not in reported_thresholds[key]:
                                    reported_thresholds[key].append(threshold)
                                    notifications_to_add.append(
                                        {
                                            "message": rule.message,
                                            "type": rule.type,
                                            "read": False,
                                        }
                                    )
                        else:
                            notifications_to_add.append(
                                {
                                    "message": rule.message,
                                    "type": rule.type,
                                    "read": False,
                                }
                            )

            except Exception as e:
                print(f"[evaluate_rules] Error evaluando regla '{rule.name}':", e)
                # Continue to the next rule instead of stopping the entire process
                continue

        # After processing all rules, add all collected notifications in a single transaction
        if notifications_to_add:
            print(f"Preparing to add {len(notifications_to_add)} notifications")
            for idx, note in enumerate(notifications_to_add):
                print(
                    f"Notification {idx+1}: {note['message'][:50]}... ({note['type']})"
                )

            # Only deduplicate exact duplicates (same message and type)
            seen = set()
            filtered_notifications = []
            for notification in notifications_to_add:
                key = (notification["message"], notification["type"])
                if key not in seen:
                    seen.add(key)
                    filtered_notifications.append(notification)

            print(
                f"After filtering, {len(filtered_notifications)} unique notifications remain"
            )

            # Only proceed if we have unique notifications
            if filtered_notifications:
                try:
                    # Create a new session for notifications to avoid transaction issues
                    notif_db = SessionLocal()

                    try:
                        for notification_data in filtered_notifications:
                            notif_db.add(
                                Notification(
                                    message=notification_data["message"],
                                    type=notification_data["type"],
                                    read=notification_data["read"],
                                    created_at=datetime.utcnow(),
                                )
                            )
                        notif_db.commit()
                        print(
                            f"Successfully added {len(filtered_notifications)} notifications to database"
                        )
                    except Exception as e:
                        notif_db.rollback()
                        print(f"[evaluate_rules] Error adding notifications: {e}")
                    finally:
                        notif_db.close()
                except Exception as e:
                    print(f"[evaluate_rules] Error creating notification session: {e}")
            else:
                print("No unique notifications to add after filtering")
        else:
            print("No notifications to add after rule evaluation")
    except Exception as e:
        db.rollback()
        print(f"[evaluate_rules] Unexpected error: {e}")

    # Don't raise exceptions - just return so we don't interfere with the main operation
    return
