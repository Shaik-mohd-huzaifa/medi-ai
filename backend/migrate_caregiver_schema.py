"""
Migration script to add new columns to caregiver_profiles table
Run this to add consultation_modes, rating, and total_consultations columns
"""
import sqlite3
import os

# Path to your database
DB_PATH = os.path.join(os.path.dirname(__file__), "medi_ai.db")

def migrate():
    """Add new columns to caregiver_profiles table"""
    print(f"Connecting to database: {DB_PATH}")
    
    if not os.path.exists(DB_PATH):
        print(f"❌ Database not found at {DB_PATH}")
        print("Please make sure the backend has been run at least once to create the database.")
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Check if columns already exist
        cursor.execute("PRAGMA table_info(caregiver_profiles)")
        columns = [col[1] for col in cursor.fetchall()]
        
        print(f"Current columns in caregiver_profiles: {columns}")
        
        # Add consultation_modes column if it doesn't exist
        if 'consultation_modes' not in columns:
            print("Adding consultation_modes column...")
            cursor.execute("""
                ALTER TABLE caregiver_profiles 
                ADD COLUMN consultation_modes VARCHAR
            """)
            print("✅ Added consultation_modes column")
        else:
            print("⏭️  consultation_modes column already exists")
        
        # Add rating column if it doesn't exist
        if 'rating' not in columns:
            print("Adding rating column...")
            cursor.execute("""
                ALTER TABLE caregiver_profiles 
                ADD COLUMN rating INTEGER
            """)
            print("✅ Added rating column")
        else:
            print("⏭️  rating column already exists")
        
        # Add total_consultations column if it doesn't exist
        if 'total_consultations' not in columns:
            print("Adding total_consultations column...")
            cursor.execute("""
                ALTER TABLE caregiver_profiles 
                ADD COLUMN total_consultations INTEGER DEFAULT 0
            """)
            print("✅ Added total_consultations column")
        else:
            print("⏭️  total_consultations column already exists")
        
        conn.commit()
        print("\n🎉 Migration completed successfully!")
        print("\nNext steps:")
        print("1. Run: python seed_caregivers.py")
        print("2. Restart your backend server")
        
    except Exception as e:
        print(f"\n❌ Error during migration: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    print("=" * 60)
    print("🔧 Running Database Migration")
    print("=" * 60)
    migrate()
    print("=" * 60)
