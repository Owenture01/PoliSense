from fastapi import FastAPI, File, UploadFile, Depends
from file_service import FileService
from dtos import UploadedFileDto, EvaluationDto, BiasEvaluationDto

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...), file_service: FileService = Depends()
):
    uploaded_file_dto: UploadedFileDto = await file_service.upload_file(file)
    leaning_evaluation_dto: EvaluationDto = await file_service.evaluate_leaning(
        uploaded_file_dto.extracted_text
    )
    bias_evaluation_dto: BiasEvaluationDto = await file_service.evaluate_bias(
        uploaded_file_dto.extracted_text
    )
    return {"leaning": leaning_evaluation_dto, "bias": bias_evaluation_dto}
