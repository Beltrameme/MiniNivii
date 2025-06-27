import csv, sqlite3

def get_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sales (
            date TEXT NOT NULL,
            week_day TEXT NOT NULL,
            hour TEXT NOT NULL,
            ticket_number TEXT NOT NULL,
            waiter TEXT NOT NULL,
            product_name TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            unitary_price INTEGER NOT NULL,
            total INTEGER NOT NULL
        )
    ''')
    
    return conn, cursor

def is_table_empty(conn, table_name: str) -> bool:
    """Check if table exists and is empty"""
    conn, cursor = get_connection()
    
    # Check if table exists
    cursor.execute(f"""
        SELECT count(*) FROM sqlite_master 
        WHERE type='table' AND name='{table_name}'
    """)
    if not cursor.fetchone()[0]:
        return True  # Table doesn't exist
        
    # Check row count
    cursor.execute(f"SELECT count(*) as count FROM {table_name}")
    return cursor.fetchone()['count'] == 0

def load_csv(csv_path: str, force_reload: bool = False) -> bool:
    """
    Load CSV only if sales table is empty or doesn't exist.
    Returns True if data was loaded, False otherwise.
    """
    conn, cursor = get_connection()
    
    try:
        # Skip if table has data and not forced
        if not force_reload and not is_table_empty(conn, 'sales'):
            print("Sales table already has data. Skipping load.")
            return False
        
        # Create table if not exists
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sales (
                date TEXT NOT NULL,
                week_day TEXT NOT NULL,
                hour TEXT NOT NULL,
                ticket_number TEXT NOT NULL,
                waiter INTEGER NOT NULL,
                product_name TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                unitary_price INTEGER NOT NULL,
                total INTEGER NOT NULL
            )
        ''')
        
        # Load data
        with open(csv_path, 'r', encoding='utf-8') as csv_file:
            csv_reader = csv.DictReader(csv_file)
            cursor.executemany('''
                INSERT INTO sales VALUES (
                    :date, :week_day, :hour, :ticket_number, 
                    :waiter, :product_name, :quantity, 
                    :unitary_price, :total
                )
            ''', csv_reader)
        
        conn.commit()
        print(f"Loaded data from {csv_path}")
        return True
        
    except Exception as e:
        conn.rollback()
        print(f"Error loading CSV: {e}")
        raise
    finally:
        conn.close()

def query(query_str: str) -> list[dict[str, any]]:
    conn, cursor = get_connection()
    try:
        cursor.execute(query_str)
        # Convert SQLite rows to dictionaries
        results = [dict(row) for row in cursor.fetchall()]
        return results
    finally:
        conn.close()