from openai import OpenAI

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key="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"
)

def generate_query(question,schema):
    prompt= f'''
    Conver the question below into a SQLite query for a table with the following schema {schema}
    Question: {question}
    ONLY RETURN A SQL QUERY, no explanations needed, no markdown formatting, just the pure SQL query
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