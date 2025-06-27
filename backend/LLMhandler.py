from openai import OpenAI

client = OpenAI(
    api_key="ca1dd6e2-a863-4869-88b0-13b88fec9211",
    base_url="https://api.sambanova.ai/v1",
)

def generate_query(question):
    prompt= f'''
    Convert the following question into a SQLite query for a table called sales with exactly these columns in this order: 
    date (text), week_day (text), hour (text), ticket_number (text), waiter (text), product_name (text), quantity (integer), unitary_price (integer), total (integer)

    STRICT RULES:
    1. ONLY return the SQL query, nothing else - no explanations, no markdown, no formatting
    2. Always use exact column names from the schema
    3. For aggregation queries:
    - SUM() operations must be aliased as "sum_columnname" (e.g., SUM(total) AS sum_total)
    - COUNT() operations must be aliased as "count_columnname"
    4. For date comparisons, use the format "MM/DD/YYYY"
    5. For text comparisons, use exact matches with = operator unless specified otherwise
    6. When returning full rows, use SELECT * unless specific columns are requested
    7. Always include the ticket_number when filtering by product or date
    9. If the query is out of the scope of the database, send back the following string "UNABLE TO MAKE QUERY"
    10. always try to return full rows when possible, if not possible, return as much columns from those rows as possible

    Example valid responses:
    SELECT * FROM sales WHERE product_name = 'Alfajor choc x un'
    SELECT SUM(total) AS sum_total FROM sales WHERE date = '10/26/2024'

    Question: {question}
    '''
    response = client.chat.completions.create(
    model="Llama-4-Maverick-17B-128E-Instruct",
    messages=[
        {
        "role": "user",
        "content": prompt
        }
    ]
    )
    print(response.choices[0].message.content)
    return response.choices[0].message.content