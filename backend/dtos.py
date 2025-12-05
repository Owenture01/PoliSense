from pydantic import BaseModel


class UploadedFileDto(BaseModel):
    filename: str
    content_type: str
    extracted_text: str


class EvaluationDto(BaseModel):
    predicted_class_id: int
    probabilities: list[float]


class BiasItemDto(BaseModel):
    sentence: str
    predicted_class_id: int
    confidence_score: float


class BiasEvaluationDto(BaseModel):
    top_biased_sentences: list[BiasItemDto]
