import pytest
from core_ingestion import parse_and_map_launches


# Shared base_rockets fixture for tests that need rocket enrichment
@pytest.fixture
def base_rockets():
    return [
        {
            "id": "r1",
            "name": "Rocket 1",
            "height": {"meters": 10},
            "diameter": {"meters": 2},
            "mass": {"kg": 500},
            "description": "A rocket",
            "flickr_images": ["img.jpg"],
            "wikipedia": "https://en.wikipedia.org/wiki/Rocket_1"
        }
    ]


def test_parse_and_map_launches_success(base_rockets):
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

    parsed_data = parse_and_map_launches(mock_docs, base_rockets)
    result = parsed_data["items"]

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

    parsed_data = parse_and_map_launches(mock_docs, [])
    result = parsed_data["items"]
    assert len(result) == 1
    item = result[0]

    assert item["status"] == "upcoming"
    assert item["rocket"] is None
    assert item["failures"] == []
    assert item["payloads"] == []
    assert item["crew"] == []


def test_parse_and_map_invalid_doc_type():
    mock_docs = ["invalid_string", 123, None]
    parsed_data = parse_and_map_launches(mock_docs, [])
    result = parsed_data["items"]
    assert len(result) == 0


def test_parse_and_map_missing_id():
    mock_docs = [{"name": "No ID Launch"}]
    parsed_data = parse_and_map_launches(mock_docs, [])
    result = parsed_data["items"]
    assert len(result) == 0


def test_stats_calculation(base_rockets):
    """Verify stats (total, failures, payload mass, crew count) are computed correctly."""
    mock_docs = [
        {
            "id": "s1", "success": True, "upcoming": False,
            "rocket": {"id": "r1"},
            "payloads": [{"id": "p1", "mass_kg": 200}],
            "crew": [{"role": "Pilot", "crew": {"id": "c1", "name": "Alice", "agency": "ESA", "image": "a.jpg"}}]
        },
        {
            "id": "s2", "success": False, "upcoming": False,
            "rocket": {"id": "r1"},
            "payloads": [
                {"id": "p2", "mass_kg": 150},
                {"id": "p3", "mass_kg": 50}
            ],
            "crew": []
        },
        {
            "id": "s3", "upcoming": True,
            "rocket": {"id": "r1"},
            "payloads": [],
            "crew": []
        }
    ]

    parsed_data = parse_and_map_launches(mock_docs, base_rockets)
    stats = parsed_data["stats"]

    assert stats["total"] == 3
    assert stats["failures"] == 1
    assert stats["total_payload_mass"] == 400  # 200 + 150 + 50
    assert stats["humans_traveled"] == 1


def test_rocket_enrichment_from_base_rockets(base_rockets):
    """Verify rocket data is enriched from base_rockets and launch count is tracked."""
    mock_docs = [
        {"id": "e1", "success": True, "rocket": {"id": "r1"}},
        {"id": "e2", "success": True, "rocket": {"id": "r1"}},
    ]

    parsed_data = parse_and_map_launches(mock_docs, base_rockets)
    rockets = parsed_data["rockets"]

    assert len(rockets) == 1
    rocket = rockets[0]
    assert rocket["id"] == "r1"
    assert rocket["name"] == "Rocket 1"
    assert rocket["height"] == 10
    assert rocket["diameter"] == 2
    assert rocket["mass"] == 500
    assert rocket["image"] == "img.jpg"
    assert rocket["wikipedia"] == "https://en.wikipedia.org/wiki/Rocket_1"
    assert rocket["total_launches"] == 2


def test_rocket_fallback_when_not_in_base():
    """When a rocket in a launch doc isn't found in base_rockets, it should be built from the doc itself."""
    mock_docs = [{
        "id": "f1", "success": True,
        "rocket": {
            "id": "r_new",
            "name": "New Rocket",
            "height": {"meters": 50},
            "diameter": {"meters": 5},
            "mass": {"kg": 10000},
            "description": "Brand new",
            "flickr_images": ["new.jpg"],
            "wikipedia": "https://en.wikipedia.org/wiki/New"
        }
    }]

    parsed_data = parse_and_map_launches(mock_docs, [])
    rockets = parsed_data["rockets"]

    assert len(rockets) == 1
    rocket = rockets[0]
    assert rocket["id"] == "r_new"
    assert rocket["name"] == "New Rocket"
    assert rocket["total_launches"] == 1
