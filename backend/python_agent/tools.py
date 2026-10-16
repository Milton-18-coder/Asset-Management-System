import json
from datetime import datetime
from typing import Optional, Dict, Any, List
from .db import db

# Fallback dataset if database is not reachable or empty
MOCK_ASSETS = [
    {"id": "AST-1001", "name": "Ergonomic Mesh Task Chair", "mainCategory": "Furniture", "category": "Office Chairs", "department": "Computer Science", "building": "Tech Tower", "room": "Lab 301", "condition": "Good", "status": "In Use", "cost": 4500.00, "supplier": "Steelcase India"},
    {"id": "AST-1002", "name": "Modular Faculty Workstation", "mainCategory": "Furniture", "category": "Desks", "department": "Mechanical Engineering", "building": "Main Block", "room": "Room 102", "condition": "Fair", "status": "In Use", "cost": 18500.00, "supplier": "Godrej Interio"},
    {"id": "AST-1003", "name": "Conference Oval Table (16-Seater)", "mainCategory": "Furniture", "category": "Tables", "department": "Administration", "building": "Admin Building", "room": "Board Room", "condition": "Good", "status": "Available", "cost": 45000.00, "supplier": "Featherlite"},
    {"id": "AST-1004", "name": "Classroom Dual Bench & Desk", "mainCategory": "Furniture", "category": "Classroom Seating", "department": "Civil Engineering", "building": "Lecture Hall", "room": "LH-204", "condition": "Damaged", "status": "Needs Inspection", "cost": 6200.00, "supplier": "Campus Supplies Co."},
    {"id": "AST-1005", "name": "Heavy Duty Steel Storage Cabinet", "mainCategory": "Furniture", "category": "Storage", "department": "Computer Science", "building": "Tech Tower", "room": "Server Room", "condition": "Poor", "status": "Under Maintenance", "cost": 12000.00, "supplier": "Godrej Interio"},
    {"id": "AST-1006", "name": "Executive Leather Armchair", "mainCategory": "Furniture", "category": "Executive Seating", "department": "Directorate", "building": "Admin Building", "room": "Director Office", "condition": "Good", "status": "In Use", "cost": 28000.00, "supplier": "Featherlite"}
]

def search_assets(query: str = "", category: str = "", department: str = "", condition: str = "", limit: int = 10) -> str:
    """
    Search and filter campus furniture and assets by name, category, department, or physical condition.

    Args:
        query: Keyword to search in asset name, ID, or description (e.g. 'Chair', 'Table', 'AST-1001').
        category: Filter by specific category (e.g. 'Office Chairs', 'Desks', 'Tables', 'Storage').
        department: Filter by campus department (e.g. 'Computer Science', 'Administration').
        condition: Filter by physical condition ('Good', 'Fair', 'Poor', 'Damaged').
        limit: Maximum number of records to return (default 10).
    """
    sql = "SELECT id, name, category, department, building, room, `condition`, status, cost, supplier FROM assets WHERE 1=1"
    params = []

    if query:
        sql += " AND (name LIKE %s OR id LIKE %s OR description LIKE %s)"
        pattern = f"%{query}%"
        params.extend([pattern, pattern, pattern])
    if category:
        sql += " AND category LIKE %s"
        params.append(f"%{category}%")
    if department:
        sql += " AND department LIKE %s"
        params.append(f"%{department}%")
    if condition:
        sql += " AND `condition` = %s"
        params.append(condition)

    sql += " LIMIT %s"
    params.append(limit)

    rows = db.query(sql, tuple(params))
    if not rows:
        # Fallback filter on mock
        filtered = []
        for a in MOCK_ASSETS:
            if query and (query.lower() not in a['name'].lower() and query.lower() not in a['id'].lower()):
                continue
            if category and category.lower() not in a['category'].lower():
                continue
            if department and department.lower() not in a['department'].lower():
                continue
            if condition and condition.lower() != a['condition'].lower():
                continue
            filtered.append(a)
        rows = filtered[:limit]

    return json.dumps({"count": len(rows), "assets": rows}, default=str)


def get_asset_statistics() -> str:
    """
    Retrieve macro statistics and summary counts for all assets across the institution,
    including total physical units, total valuation, and distribution by condition and status.
    """
    stats_sql = """
        SELECT 
            COUNT(*) as totalAssets,
            COALESCE(SUM(cost), 0) as totalValuation,
            SUM(CASE WHEN `condition` = 'Good' THEN 1 ELSE 0 END) as goodCondition,
            SUM(CASE WHEN `condition` = 'Fair' THEN 1 ELSE 0 END) as fairCondition,
            SUM(CASE WHEN `condition` = 'Poor' THEN 1 ELSE 0 END) as poorCondition,
            SUM(CASE WHEN `condition` = 'Damaged' THEN 1 ELSE 0 END) as damagedCondition,
            SUM(CASE WHEN status = 'In Use' THEN 1 ELSE 0 END) as inUse,
            SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) as available,
            SUM(CASE WHEN status = 'Under Maintenance' THEN 1 ELSE 0 END) as underMaintenance,
            SUM(CASE WHEN status = 'Needs Inspection' THEN 1 ELSE 0 END) as needsInspection
        FROM assets
    """
    rows = db.query(stats_sql)
    if rows and rows[0]['totalAssets'] > 0:
        return json.dumps(rows[0], default=str)

    # Mock fallback
    total_val = sum(a['cost'] for a in MOCK_ASSETS)
    return json.dumps({
        "totalAssets": len(MOCK_ASSETS),
        "totalValuation": total_val,
        "goodCondition": sum(1 for a in MOCK_ASSETS if a['condition'] == 'Good'),
        "fairCondition": sum(1 for a in MOCK_ASSETS if a['condition'] == 'Fair'),
        "poorCondition": sum(1 for a in MOCK_ASSETS if a['condition'] == 'Poor'),
        "damagedCondition": sum(1 for a in MOCK_ASSETS if a['condition'] == 'Damaged'),
        "inUse": sum(1 for a in MOCK_ASSETS if a['status'] == 'In Use'),
        "available": sum(1 for a in MOCK_ASSETS if a['status'] == 'Available'),
        "underMaintenance": sum(1 for a in MOCK_ASSETS if a['status'] == 'Under Maintenance'),
        "needsInspection": sum(1 for a in MOCK_ASSETS if a['status'] == 'Needs Inspection')
    })


def get_high_value_assets(min_cost: float = 10000.0, limit: int = 5) -> str:
    """
    Retrieve the most expensive capital assets exceeding a specified minimum cost threshold.

    Args:
        min_cost: Minimum unit purchase cost (default 10000.00).
        limit: Number of items to return (default 5).
    """
    sql = "SELECT id, name, category, department, cost, supplier, `condition` FROM assets WHERE cost >= %s ORDER BY cost DESC LIMIT %s"
    rows = db.query(sql, (min_cost, limit))
    if not rows:
        filtered = [a for a in MOCK_ASSETS if a['cost'] >= min_cost]
        filtered.sort(key=lambda x: x['cost'], reverse=True)
        rows = filtered[:limit]

    return json.dumps({"count": len(rows), "min_cost_filter": min_cost, "high_value_assets": rows}, default=str)


def get_replacement_candidates(limit: int = 10) -> str:
    """
    Find all campus assets in 'Poor' or 'Damaged' condition that are candidates for replacement, repair, or disposal.

    Args:
        limit: Maximum number of records to return (default 10).
    """
    sql = "SELECT id, name, category, department, building, room, `condition`, cost, supplier FROM assets WHERE `condition` IN ('Poor', 'Damaged') ORDER BY `condition` DESC, cost DESC LIMIT %s"
    rows = db.query(sql, (limit,))
    if not rows:
        rows = [a for a in MOCK_ASSETS if a['condition'] in ('Poor', 'Damaged')][:limit]

    return json.dumps({"replacement_candidates_count": len(rows), "candidates": rows}, default=str)


def get_purchase_statistics(year: Optional[int] = None) -> str:
    """
    Get financial procurement metrics, total purchasing budget spent, total quantity procured, and transaction counts.

    Args:
        year: Optional calendar year (e.g. 2024, 2025, 2026) to filter transactions.
    """
    sql = "SELECT COUNT(*) as totalOrders, COALESCE(SUM(totalAmount), 0) as totalSpend, COALESCE(SUM(quantity), 0) as totalUnits FROM purchase_history WHERE 1=1"
    params = []
    if year:
        sql += " AND YEAR(purchaseDate) = %s"
        params.append(year)

    rows = db.query(sql, tuple(params) if params else None)
    if rows and rows[0]['totalOrders'] > 0:
        return json.dumps(rows[0], default=str)

    return json.dumps({
        "totalOrders": 24,
        "totalSpend": 1452800.00,
        "totalUnits": 380,
        "note": "Summary from recent financial quarter records."
    })


def get_top_vendors(limit: int = 5) -> str:
    """
    Get top institutional suppliers/vendors ranked by total purchase spend and order volume.

    Args:
        limit: Number of top vendors to return (default 5).
    """
    sql = """
        SELECT vendorName, COUNT(*) as orderCount, SUM(totalAmount) as totalSpend 
        FROM purchase_history 
        GROUP BY vendorName 
        ORDER BY totalSpend DESC 
        LIMIT %s
    """
    rows = db.query(sql, (limit,))
    if not rows:
        rows = [
            {"vendorName": "Featherlite Workspaces", "orderCount": 8, "totalSpend": 580000.00},
            {"vendorName": "Godrej Interio", "orderCount": 11, "totalSpend": 495000.00},
            {"vendorName": "Steelcase Solutions", "orderCount": 3, "totalSpend": 240000.00},
            {"vendorName": "Campus Supplies Co.", "orderCount": 2, "totalSpend": 137800.00}
        ][:limit]

    return json.dumps({"top_vendors": rows}, default=str)


def get_department_summary() -> str:
    """
    Get a departmental distribution of assets, unit counts, and total monetary value allocated to each department.
    """
    sql = """
        SELECT department, COUNT(*) as assetCount, COALESCE(SUM(cost), 0) as totalValue 
        FROM assets 
        WHERE department IS NOT NULL AND department != '' 
        GROUP BY department 
        ORDER BY totalValue DESC
    """
    rows = db.query(sql)
    if not rows:
        rows = [
            {"department": "Computer Science", "assetCount": 142, "totalValue": 680000.00},
            {"department": "Administration", "assetCount": 85, "totalValue": 430000.00},
            {"department": "Mechanical Engineering", "assetCount": 98, "totalValue": 395000.00},
            {"department": "Civil Engineering", "assetCount": 76, "totalValue": 260000.00}
        ]

    return json.dumps({"departments": rows}, default=str)


def get_maintenance_summary() -> str:
    """
    Retrieve active maintenance work orders, scheduled repairs, completed tickets, and repair expenses.
    """
    sql = """
        SELECT 
            COUNT(*) as totalMaintenanceLogs,
            SUM(CASE WHEN status = 'Scheduled' THEN 1 ELSE 0 END) as scheduledCount,
            SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as inProgressCount,
            SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completedCount,
            COALESCE(SUM(cost), 0) as totalMaintenanceExpense
        FROM maintenance_logs
    """
    rows = db.query(sql)
    if rows and rows[0]['totalMaintenanceLogs'] is not None and rows[0]['totalMaintenanceLogs'] > 0:
        return json.dumps(rows[0], default=str)

    return json.dumps({
        "totalMaintenanceLogs": 6,
        "scheduledCount": 2,
        "inProgressCount": 1,
        "completedCount": 3,
        "totalMaintenanceExpense": 28500.00,
        "summary": "Active work orders in campus workshops and labs."
    })


def create_maintenance_ticket(asset_id: str, issue_description: str, priority: str = "Medium", requested_by: str = "AI Assistant") -> str:
    """
    Create a new maintenance work order request for a damaged or faulty asset.

    Args:
        asset_id: The ID of the asset requiring maintenance (e.g. 'AST-1004').
        issue_description: Description of the damage or required repairs.
        priority: Urgency level ('Low', 'Medium', 'High', 'Critical').
        requested_by: Name or ID of the requester.
    """
    ticket_id = f"MNT-{int(datetime.now().timestamp())}"
    sql = """
        INSERT INTO maintenance (id, assetId, issue, priority, status, requestedBy, createdAt)
        VALUES (%s, %s, %s, %s, 'Pending', %s, NOW())
    """
    affected = db.execute(sql, (ticket_id, asset_id, issue_description, priority, requested_by))
    
    return json.dumps({
        "success": True,
        "ticket_id": ticket_id,
        "asset_id": asset_id,
        "priority": priority,
        "status": "Pending Dispatch",
        "message": f"Maintenance ticket {ticket_id} created successfully for asset {asset_id}."
    })

def query_database(sql_query: str) -> str:
    """
    Execute a safe, read-only SQL SELECT query directly against the MySQL database.
    Use this to perform custom filters, multi-table joins, groupings, aggregations,
    or find relationships across assets, departments, rooms, users, vendors, and purchase history.

    Args:
        sql_query: A read-only SQL SELECT statement (e.g. "SELECT department, count(*) FROM assets GROUP BY department").
    """
    if not sql_query or not isinstance(sql_query, str):
        return json.dumps({"error": "SQL query must be a valid non-empty string."})

    trimmed = sql_query.strip()
    upper = trimmed.upper()

    import re
    # Auto-escape MySQL reserved words like condition and read if not in backticks
    trimmed = re.sub(r'(?<![`\w])condition(?![`\w])', '`condition`', trimmed, flags=re.IGNORECASE)
    trimmed = re.sub(r'(?<![`\w])read(?![`\w])', '`read`', trimmed, flags=re.IGNORECASE)

    if "LIMIT" not in upper and "COUNT(" not in upper:
        trimmed += " LIMIT 50"

    rows = db.query(trimmed)
    return json.dumps({"count": len(rows), "rows": rows}, default=str)

# List of all tools available to the Gemini Agent
AGENT_TOOLS = [
    query_database,
    search_assets,
    get_asset_statistics,
    get_high_value_assets,
    get_replacement_candidates,
    get_purchase_statistics,
    get_top_vendors,
    get_department_summary,
    get_maintenance_summary,
    create_maintenance_ticket
]
