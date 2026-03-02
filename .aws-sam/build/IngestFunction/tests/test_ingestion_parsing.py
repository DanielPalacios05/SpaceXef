import pytest
from core_ingestion import parse_and_map_launches

def test_parse_and_map_launches_success():
    mock_docs = [{
        "id": "123",
        "flight_number": 1,
        "name": "Test Launch",
        "date_unix": 10000,
        "date_precision": "hour",
        "success": True,
        "upcoming": False,
        "rocket": {
            "id": "r1",
            "name": "Rocket 1",
            "height": {"meters": 10},
            "diameter": {"meters": 2},
            "mass": {"kg": 500},
            "description": "A rocket",
            "flickr_images": ["img.jpg"]
        },
        "payloads": [
            {"id": "p1", "name": "Payload 1", "type": "Satellite", "mass_kg": 100}
        ],
        "crew": [
            {"role": "Commander", "crew": {"id": "c1", "name": "Bob", "agency": "NASA", "image": "bob.jpg"}}
        ],
        "links": {"patch": {"small": "patch.jpg"}, "youtube_id": "vid123"},
        "failures": [{"time": 10, "altitude": 50, "reason": "engine"}]
    }]
    
    result = parse_and_map_launches(mock_docs)
    
    assert len(result) == 1
    item = result[0]
    
    assert item["id"] == "123"
    assert item["status"] == "success"
    assert item["name"] == "Test Launch"
    assert item["rocket"]["name"] == "Rocket 1"
    assert item["rocket"]["height"] == 10
    assert len(item["payloads"]) == 1
    assert item["payloads"][0]["mass"] == 100
    assert len(item["crew"]) == 1
    assert item["crew"][0]["role"] == "Commander"
    assert item["crew"][0]["name"] == "Bob"
    assert item["patch"] == "patch.jpg"
    assert len(item["failures"]) == 1

def test_parse_and_map_launches_missing_data():
    mock_docs = [{
        "id": "124",
        "flight_number": 2,
        "upcoming": True,
        "rocket": "not_a_dict_so_it_fails_gracefully",
        "failures": "not_a_list"
    }]
    
    result = parse_and_map_launches(mock_docs)
    assert len(result) == 1
    item = result[0]
    
    assert item["status"] == "upcoming"
    assert item["rocket"] is None
    assert item["failures"] == []
    assert item["payloads"] == []
    assert item["crew"] == []

def test_parse_and_map_invalid_doc_type():
    mock_docs = ["invalid_string", 123, None]
    result = parse_and_map_launches(mock_docs)
    assert len(result) == 0

def test_parse_and_map_missing_id():
    mock_docs = [{"name": "No ID Launch"}]
    result = parse_and_map_launches(mock_docs)
    assert len(result) == 0
