import os
import sys

_REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_BACKEND = os.path.join(_REPO_ROOT, "kafaas_backend")

for _p in (_BACKEND, _REPO_ROOT):
    if _p not in sys.path:
        sys.path.insert(0, _p)

from app.main import app as application  # noqa: E402
