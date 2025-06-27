import pytest
from unittest.mock import patch
from LLMhandler import generate_query

# Mocking the OpenAI client response
class MockResponse:
    def __init__(self, content):
        self.choices = [self]
        self.message = self
        self.content = content

@pytest.fixture
def mock_openai():
    with patch('LLMhandler.client.chat.completions.create') as mock:
        yield mock

def test_generate_query_valid_question(mock_openai):
    # Arrange
    question = "What is the total sales for the product 'Alfajor choc x un'?"
    expected_query = "SELECT * FROM sales WHERE product_name = 'Alfajor choc x un'"
    mock_openai.return_value = MockResponse(expected_query)

    # Act
    result = generate_query(question)

    # Assert
    assert result == expected_query

def test_generate_query_unable_to_make_query(mock_openai):
    # Arrange
    question = "Invalid question that cannot be processed."
    expected_response = "UNABLE TO MAKE QUERY"
    mock_openai.return_value = MockResponse(expected_response)

    # Act
    result = generate_query(question)

    # Assert
    assert result == expected_response
