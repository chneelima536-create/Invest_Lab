import unittest
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.tutor_service import TutorEngine

class TestTutorEngine(unittest.TestCase):
    def test_pe_ratio_explanation(self):
        res = TutorEngine.get_response("What is a P/E ratio and how is it calculated?")
        self.assertIn("Price-to-Earnings", res["reply"])
        self.assertIn("disclaimer", res)
        self.assertIn("₹", res["reply"])

    def test_sip_compounding_explanation(self):
        res = TutorEngine.get_response("Explain SIPs with an example")
        self.assertIn("Systematic Investment Plan", res["reply"])
        self.assertIn("₹", res["reply"])
        self.assertIn("Compounding", res["reply"])

    def test_diversification_explanation(self):
        res = TutorEngine.get_response("Why is portfolio diversification important?")
        self.assertIn("Diversification", res["reply"])
        self.assertIn("risk", res["reply"].lower())

    def test_disclaimer_present(self):
        res = TutorEngine.get_response("Should I invest in penny stocks?")
        self.assertIn("disclaimer", res)
        self.assertIn("educational", res["disclaimer"].lower())

if __name__ == '__main__':
    unittest.main()
