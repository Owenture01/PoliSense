from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    MODEL_PATH: str

    class Config:
        env_file = "../.env"


settings = Settings()
