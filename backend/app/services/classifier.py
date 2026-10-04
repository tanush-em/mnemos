from app.models.memory import MemoryType

SEMANTIC_PATTERNS = [
    "i prefer",
    "user prefers",
    "user likes",
    "user is comfortable",
    "user uses",
    "project uses",
    "the project uses",
    "prefers",
    "is the primary",
    "runs on",
    "comfortable with",
]

EPISODIC_PATTERNS = [
    "previous deployment",
    "yesterday",
    "last incident",
    "the release failed",
    "deployment failed",
    "caused",
    "revealed",
    "required a rollback",
    "failed because",
    "incident",
    "rollback",
]

PROCEDURAL_PATTERNS = [
    "repository uses",
    "run this command",
    "deployment requires",
    "workflow uses",
    "services use",
    "stored in",
    "require ci",
    "requires ci",
    "api uses",
    "pull requests",
    "environment variables",
    "backend services",
]


def classify_memory(content: str) -> MemoryType:
    """Rule-based memory type classifier. Manual override should win upstream."""
    text = content.lower().strip()

    episodic_hits = sum(1 for p in EPISODIC_PATTERNS if p in text)
    procedural_hits = sum(1 for p in PROCEDURAL_PATTERNS if p in text)
    semantic_hits = sum(1 for p in SEMANTIC_PATTERNS if p in text)

    scores = {
        MemoryType.EPISODIC: episodic_hits,
        MemoryType.PROCEDURAL: procedural_hits,
        MemoryType.SEMANTIC: semantic_hits,
    }
    best = max(scores, key=scores.get)
    if scores[best] == 0:
        return MemoryType.SEMANTIC
    return best
