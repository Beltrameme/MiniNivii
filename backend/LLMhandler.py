from openai import OpenAI

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key="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"
)

def generate_query(question,schema):
    prompt= f'''
    Conver the question below into a SQLite query for a table with the following schema {schema}
    Here is an example row in csv "10/26/2024,Saturday,15:53,FCB 0003-000015941,52,Alfajor choc x un,1,1900,1900"
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