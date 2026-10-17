"""Register CampusFlow Router with Agentverse using values from local .env.

Set CAMPUS_ROUTER_ENDPOINT to the currently reachable public URL ending in /submit.
Never commit .env or expose your Agentverse key/seed phrase.
"""
import os
from dotenv import load_dotenv
from uagents_core.utils.registration import (
    RegistrationRequestCredentials,
    register_chat_agent,
)

load_dotenv()

name = os.getenv("AGENTVERSE_AGENT_NAME", "CampusFlow-Router").strip()
endpoint = os.getenv("CAMPUS_ROUTER_ENDPOINT", "").strip()
api_key = os.getenv("AGENTVERSE_KEY", "").strip()
agent_seed = os.getenv("AGENT_SEED_PHRASE", "").strip()
router_seed = os.getenv("CAMPUS_ROUTER_SEED", "").strip()

missing = [key for key, value in {
    "CAMPUS_ROUTER_ENDPOINT": endpoint,
    "AGENTVERSE_KEY": api_key,
    "AGENT_SEED_PHRASE": agent_seed,
    "CAMPUS_ROUTER_SEED": router_seed,
}.items() if not value or value.startswith("replace_with_")]
if missing:
    raise SystemExit("Set these values in .env before registering: " + ", ".join(missing))
if not endpoint.startswith("https://") or not endpoint.endswith("/submit"):
    raise SystemExit("CAMPUS_ROUTER_ENDPOINT must be the current public HTTPS URL ending in /submit")
if agent_seed != router_seed:
    raise SystemExit("AGENT_SEED_PHRASE must match CAMPUS_ROUTER_SEED for the Router identity")

register_chat_agent(
    name,
    endpoint,
    active=True,
    credentials=RegistrationRequestCredentials(
        agentverse_api_key=api_key,
        agent_seed_phrase=agent_seed,
    ),
)
