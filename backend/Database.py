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
            waiter INTEGER NOT NULL,
            product_name TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            unitary_price INTEGER NOT NULL,
            total INTEGER NOT NULL
        )
    ''')
    
    return conn, cursor

def load_csv(csv_path):
    conn, cursor = get_connection()
    
    try:
        with open(csv_path, 'r', encoding='utf-8') as csv_file:
            csv_reader = csv.DictReader(csv_file)
            
            for row in csv_reader:
                cursor.execute('''
                INSERT INTO sales VALUES (
                    :date,
                    :week_day,
                    :hour,
                    :ticket_number,
                    :waiter,
                    :product_name,
                    :quantity,
                    :unitary_price,
                    :total
                )
                ''', row)
        conn.commit()
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