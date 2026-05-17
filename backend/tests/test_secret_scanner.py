import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from app.security.secret_scanner import SecretScanner


def _types(findings):
    return [f.get("type") for f in findings]


def test_secret_scanner_allows_env_references():
    content = 'sendgrid_key = os.getenv("EMAIL_API_KEY", "")\npassword = os.environ.get("SMTP_PASSWORD")\n'
    findings = SecretScanner.scan_string(content, file_rel_path="integrations/email_service.py")
    assert "real_secret" not in _types(findings)
    assert "env_reference" in _types(findings)


def test_secret_scanner_allows_empty_env_example():
    content = "EMAIL_API_KEY=\nSMTP_PASSWORD=change-me\nYOUR_EMAIL_API_KEY_HERE\nyour-api-key-here\n"
    findings = SecretScanner.scan_string(content, file_rel_path=".env.example")
    assert "real_secret" not in _types(findings)
    assert "safe_placeholder" in _types(findings)


def test_secret_scanner_blocks_real_api_key():
    content = 'EMAIL_API_KEY=placeholder_value_for_test_1234\n'
    findings = SecretScanner.scan_string(content, file_rel_path=".env")
    assert "real_secret" in _types(findings)


def test_secret_scanner_blocks_private_key():
    content = "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBK\n"
    findings = SecretScanner.scan_string(content, file_rel_path="backend/config.py")
    assert "real_secret" in _types(findings)
