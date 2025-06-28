# Mini Nivil Assignment

A simplified version of Nivil that answers natural language questions with data visualizations.

## Setup Instructions

Dependencies needed before installation:
   - Python 3.12
   - Pip 25.0
   - Node 20
   - Javascript ES6
   - React 19

1. Clone this repository
2. Install dependencies:
   - Backend:
   ```bash
      cd backend
      python3 -m venv venv
      source venv/bin/activate
      pip install -r requirements.txt
      cd app
      touch .env
      deactivate
    ```
   For the backend, inside the .env, please write your llm api key like this: `LLM_API_KEY=<your_api_key>`
   
   - Frontend:
   ```bash
      git clone <repo>
      cd frontend
      npm install
      npm start
    ```
4. Run the application:
   - Backend:
     ```bash
        cd backend
        source venv/bin/activate
        cd app
        python app.py
     ```
     This application is runnning in a virtual enviroment, if one wishes to close this enviroment, copy this code:
     ```
     deactivate
     ```
   - Frontend:
     ```bash
        cd frontend
        npm start
     ```
5. To run in docker:
   - `docker-compose up --build`

## Tech Stack

- **Backend**: Python (FastAPI)
- **Frontend**: React
- **Database**: SQLite
- **Visualization**: Chart.js
- **LLM Integration**: OpenAI API

## Project Structure
```bash
miniNivii/
├── backend/
│ ├── app/ # FastAPI backend code
│ ├── data/ # CSV files
│ └── dockerfile
├── frontend/
│ ├── src/ # React components
│ └── dockerfile
├── docker-compose.yml
├── README.md
```
## Design Desicions

FastAPI was chosen as the backend framework for its fast performance and ease of use. Although it may not have the large communities of Flask or Django, its lightweight design and API-first approach make it well-suited for AI-driven projects.

React offers a flexible architecture for the frontend. While it might have a steeper learning curve compared to frameworks like Vue, its optimized rendering provides a fast and responsive user experience.

Chart.js was implemented because of its lightweight nature and ease of integration with React. Although it lacks some advanced chart types, the fast loading times and simplicity made it the most practical choice for this project.

SQLite was chosen for its lightweight, file-based design, which is ideal for single-user use cases. It makes the user experience frictionless and minimizes setup overhead. While PostgreSQL or MySQL could have been used, their additional complexity and features were unnecessary for a small-scale app like this.

## Scalability

### Multi-user Usage:

FastAPI would be replaced by a more robust and secure framework, such as Django, for its advanced session handling, authentication capabilities, and extensive ecosystem. Authentication could be implemented using JWT-based sessions to secure the API.

The database would be migrated to PostgreSQL for its support for concurrent connections and advanced indexing. PostgreSQL also includes a user-roles mechanism, allowing different access levels within the database—ideal for organizations with multiple user types and sensitive data.

Chart.js would be replaced by Plotly. While Plotly may have slightly slower rendering, it supports more complex and interactive charts with real-time updates, which would be valuable in a multi-user environment.

Finally, API rate limits would need to be introduced to prevent abuse or overloading of the system—especially important given the involvement of LLM API calls.


### Large Datasets & Complex Querys

For large datasets, switching to PostgreSQL would again be beneficial due to its indexing, query optimization, and efficient handling of large volumes of data.

Additional mechanisms would also be implemented to improve performance:

   - A caching layer (e.g., Redis) could be introduced to store frequently requested queries or their results.

   - A query engine like SQLAlchemy could be used to manage and optimize the queries being made to the database.

   - To avoid overloading the system and to handle intensive data processing, a task queue (e.g., Celery) could be introduced to offload heavy operations and maintain responsiveness.
