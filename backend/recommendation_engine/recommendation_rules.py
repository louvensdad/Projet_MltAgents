RECOMMENDATION_RULES = [
    {
        "if_all": ["Multi-agent", "AI Assistant", "API pública"],
        "suggest": ["Redis", "Queue", "Rate limiting", "Audit logs", "Async architecture"],
        "risk": ["Aumento de complexidade operacional"],
    },
    {
        "if_all": ["Kafka"],
        "suggest": ["Observabilidade", "Dead-letter queue", "Schema validation"],
        "risk": ["Necessidade de monitoramento contínuo"],
    },
    {
        "if_all": ["SQLite"],
        "suggest": ["PostgreSQL para alto volume"],
        "risk": ["Escalabilidade limitada"],
    },
]
