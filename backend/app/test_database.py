import pytest
import sqlite3
from Database import load_csv, query, get_connection

@pytest.fixture
def db_connection():
    conn, cursor = get_connection()
    yield conn, cursor
    conn.close()

def test_load_csv(db_connection):
    conn, cursor = db_connection
    # Assuming you have a sample CSV file for testing
    load_csv('../data/test_data.csv')  # Provide a path to a test CSV file

    cursor.execute("SELECT COUNT(*) FROM sales")
    count = cursor.fetchone()[0]
    assert count > 0  # Ensure that data was loaded

def test_query(db_connection):
    conn, cursor = db_connection
    # Clear the sales table before the test
    cursor.execute("DELETE FROM sales")
    
    # Insert a test record
    cursor.execute("INSERT INTO sales (date, week_day, hour, ticket_number, waiter, product_name, quantity, unitary_price, total) VALUES ('01/01/2025', 'Monday', '12:00', '123', 'John', 'Test Product', 1, 10, 10)")
    conn.commit()
    results = query("SELECT * FROM sales WHERE ticket_number = '123'")
    assert len(results) == 1  # Ensure only one result is returned
    assert results[0]['product_name'] == 'Test Product'
