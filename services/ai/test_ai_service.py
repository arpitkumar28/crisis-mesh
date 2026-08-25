"""
Basic health test for CrisisMesh AI Service
Tests that the AI service can be imported and basic configuration works
"""

import sys
import pytest

def test_ai_service_import():
    """Test that the AI service module can be imported"""
    try:
        import main
        assert main is not None
    except ImportError as e:
        pytest.fail(f"Failed to import main module: {e}")

def test_ai_service_config():
    """Test that AIServiceConfig can be instantiated"""
    from main import AIServiceConfig
    
    config = AIServiceConfig()
    assert config.port == 5000
    assert config.host == "0.0.0.0"
    assert config.api_url == "http://localhost:3001/api"

def test_risk_predictor():
    """Test that RiskPredictor can be instantiated"""
    from main import RiskPredictor
    
    predictor = RiskPredictor()
    assert predictor is not None

def test_risk_predictor_health():
    """Test that RiskPredictor health check works"""
    from main import RiskPredictor
    
    predictor = RiskPredictor()
    health = predictor.health()
    
    assert health is not None
    assert health["status"] == "healthy"
    assert health["models_loaded"] == 0  # Phase 1 has no real models
    assert health["phase"] == "1"
    assert health["implementation"] == "skeleton_mock"

def test_risk_predictor_mock_prediction():
    """Test that RiskPredictor returns mock predictions"""
    from main import RiskPredictor
    
    predictor = RiskPredictor()
    features = {"temperature": 25.0}
    result = predictor.predict(features)
    
    assert result is not None
    assert "risk_level" in result
    assert "probability" in result
    assert result["phase_1_mock"] is True  # Should be marked as mock
    assert "disclaimer" in result

def test_risk_predictor_high_temperature():
    """Test mock prediction with high temperature"""
    from main import RiskPredictor
    
    predictor = RiskPredictor()
    features = {"temperature": 55.0}
    result = predictor.predict(features)
    
    assert result["risk_level"] == "HIGH"
    assert result["phase_1_mock"] is True

def test_risk_predictor_normal_temperature():
    """Test mock prediction with normal temperature"""
    from main import RiskPredictor
    
    predictor = RiskPredictor()
    features = {"temperature": 25.0}
    result = predictor.predict(features)
    
    assert result["risk_level"] == "LOW"
    assert result["phase_1_mock"] is True

def test_ai_service_initialization():
    """Test that CrisisMeshAIService can be instantiated"""
    from main import CrisisMeshAIService, AIServiceConfig
    
    config = AIServiceConfig()
    service = CrisisMeshAIService(config)
    assert service is not None
    assert service.config == config
    assert service.predictor is not None

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
