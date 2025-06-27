from openai import OpenAI

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key="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"
)

def generate_query(question):
    prompt= f'''
    Convert the following question into a SQLite query for a table with exactly these columns in this order: 
    date (text), week_day (text), hour (text), ticket_number (text), waiter (integer), product_name (text), quantity (integer), unitary_price (integer), total (integer)

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
    8. Never use LIMIT unless explicitly asked for in the question

    Example valid responses:
    SELECT * FROM table WHERE product_name = 'Alfajor choc x un'
    SELECT SUM(total) AS sum_total FROM table WHERE date = '10/26/2024'

    Question: {question}
    '''
    response = client.chat.completions.create(
    model="deepseek/deepseek-r1:free",
    messages=[
        {
        "role": "user",
        "content": prompt
        }
    ]
    )
    print(response.choices[0].message.content)
    return response.choices[0].message.content