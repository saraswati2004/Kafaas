from typing import Dict, Any, List
from fastapi import APIRouter, Query

router = APIRouter(prefix="/weather", tags=["Agri Weather Advisories"])


@router.get("/forecast")
async def get_weather_forecast(
    district: str = Query("Dhar", description="Agricultural district"),
    state: str = Query("Madhya Pradesh", description="State"),
) -> Dict[str, Any]:
    """
    Provide localized agricultural weather advisories and agrochemical spraying suitability indicators.
    """
    return {
        "location": {
            "district": district,
            "state": state,
            "latitude": 22.5975,
            "longitude": 75.3045,
        },
        "current": {
            "tempCelsius": 28.4,
            "humidityPercent": 68,
            "windSpeedKmph": 12.0,
            "condition": "Partly Cloudy with Humid Breeze",
            "spraySuitability": "Optimal",
            "sprayRecommendation": "Safe for foliar spray until 11:30 AM before surface wind speed increases.",
        },
        "dailyForecast": [
            {
                "day": "Today",
                "tempHigh": 32,
                "tempLow": 23,
                "rainProbabilityPercent": 15,
                "condition": "Scattered Clouds",
                "sprayWindow": "6:00 AM - 10:30 AM",
            },
            {
                "day": "Tomorrow",
                "tempHigh": 30,
                "tempLow": 22,
                "rainProbabilityPercent": 70,
                "condition": "Moderate Monsoon Showers",
                "sprayWindow": "Avoid Spraying (Rain Washout Risk)",
            },
            {
                "day": "Day After",
                "tempHigh": 29,
                "tempLow": 21,
                "rainProbabilityPercent": 40,
                "condition": "Overcast",
                "sprayWindow": "Late Afternoon Safe",
            },
        ],
    }
