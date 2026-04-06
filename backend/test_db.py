from database.supabase_client import SupabaseDB
import traceback

db = SupabaseDB()
try:
    print(db.get_sessions())
except Exception as e:
    print("ERROR:", str(e))
    traceback.print_exc()
