import pytest
import json
from unittest.mock import patch, MagicMock
from core_ingestion import fetch_spacex_data

@patch('core_ingestion.urllib.request.urlopen')
def test_fetch_spacex_data_success(mock_urlopen):
    # Setup mock response
    mock_response = MagicMock()
    mock_response.read.return_value = json.dumps({"docs": [{"id": "1"}], "totalDocs": 1}).encode('utf-8')
    # Enter context manager
    mock_urlopen.return_value.__enter__.return_value = mock_response

    result = fetch_spacex_data("http://fakeurl", {"query": {}})
    
    assert result == {"docs": [{"id": "1"}], "totalDocs": 1}
    mock_urlopen.assert_called_once()

@patch('core_ingestion.urllib.request.urlopen')
def test_fetch_spacex_data_http_error(mock_urlopen):
    # Simulate an HTTP error (e.g., 404 or 500)
    mock_urlopen.side_effect = Exception("HTTP Error 500")

    result = fetch_spacex_data("http://fakeurl", {"query": {}})
    
    assert result == {}  # Gracefully returns empty dict on failure
    mock_urlopen.assert_called_once()
