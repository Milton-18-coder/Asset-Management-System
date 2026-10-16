import pymysql
import pymysql.cursors
from typing import List, Dict, Any, Optional
from .config import config

class Database:
    def __init__(self):
        self._connection = None

    def get_connection(self):
        try:
            return pymysql.connect(
                host=config.DB_HOST,
                port=config.DB_PORT,
                user=config.DB_USER,
                password=config.DB_PASSWORD,
                database=config.DB_NAME,
                cursorclass=pymysql.cursors.DictCursor,
                autocommit=True
            )
        except Exception as e:
            return None

    def query(self, sql: str, params: Optional[tuple] = None) -> List[Dict[str, Any]]:
        conn = self.get_connection()
        if not conn:
            return []
        try:
            with conn.cursor() as cursor:
                cursor.execute(sql, params or ())
                return cursor.fetchall()
        except Exception as e:
            print(f"[DB Warning] Query error: {e}")
            return []
        finally:
            try:
                conn.close()
            except Exception:
                pass

    def execute(self, sql: str, params: Optional[tuple] = None) -> int:
        conn = self.get_connection()
        if not conn:
            return 0
        try:
            with conn.cursor() as cursor:
                affected = cursor.execute(sql, params or ())
                return affected
        except Exception as e:
            print(f"[DB Warning] Execute error: {e}")
            return 0
        finally:
            try:
                conn.close()
            except Exception:
                pass

db = Database()
