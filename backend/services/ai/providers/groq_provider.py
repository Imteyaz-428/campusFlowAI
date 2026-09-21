import os
from typing import Iterator

from dotenv import load_dotenv
from groq import Groq

from services.ai.providers.base_provider import BaseProvider


load_dotenv()


class GroqProvider(BaseProvider):

    def __init__(self):

        self.client = Groq(
            api_key=os.getenv("GROQ_API_KEY")
        )

        # Current Groq production model.
        #
        # llama-3.3-70b-versatile was deprecated for
        # free/developer-tier usage.
        self.model = "openai/gpt-oss-120b"

    # ============================================================
    # GENERATE
    # ============================================================

    def generate(
        self,
        prompt: str,
    ) -> str:

        response = self.client.chat.completions.create(
            model=self.model,

            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
        )

        return response.choices[0].message.content

    # ============================================================
    # STREAM
    # ============================================================

    def stream(
        self,
        prompt: str,
    ) -> Iterator[str]:

        stream = self.client.chat.completions.create(
            model=self.model,

            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],

            stream=True,
        )

        for chunk in stream:

            if (
                chunk.choices
                and chunk.choices[0].delta.content
            ):

                yield chunk.choices[0].delta.content