from fastapi import UploadFile, HTTPException
import pypdf
import io
import docx
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from config import settings
import os
from dtos import UploadedFileDto, EvaluationDto, BiasEvaluationDto, BiasItemDto
from typing import List


import re


class FileService:
    async def upload_file(self, file: UploadFile) -> UploadedFileDto:
        content = await file.read()

        filename = file.filename.lower() if file.filename else ""
        text_content = ""

        if filename.endswith(".txt"):
            try:
                text_content = content.decode("utf-8")
            except UnicodeDecodeError:
                raise HTTPException(
                    status_code=400, detail="Invalid UTF-8 encoding in text file"
                )

        elif filename.endswith(".pdf"):
            try:
                pdf_file = io.BytesIO(content)
                reader = pypdf.PdfReader(pdf_file)
                for page in reader.pages:
                    text_content += page.extract_text() + "\n"
            except Exception as e:
                raise HTTPException(
                    status_code=400, detail=f"Error reading PDF: {str(e)}"
                )

        elif filename.endswith(".docx"):
            try:
                doc_file = io.BytesIO(content)
                doc = docx.Document(doc_file)
                for paragraph in doc.paragraphs:
                    text_content += paragraph.text + "\n"
            except Exception as e:
                raise HTTPException(
                    status_code=400, detail=f"Error reading DOCX: {str(e)}"
                )

        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file type. Please upload .txt, .pdf, or .docx",
            )

        return UploadedFileDto(
            filename=file.filename if file.filename else "",
            content_type=file.content_type if file.content_type else "",
            extracted_text=text_content,
        )

    async def evaluate_leaning(self, extracted_text: str) -> EvaluationDto:
        MODEL_PATH = os.path.join(settings.MODEL_PATH, "leaning")
        tokenizer = AutoTokenizer.from_pretrained(os.path.join(MODEL_PATH, "tokenizer"))
        model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)

        model.eval()
        device = torch.device(
            "cuda"
            if torch.cuda.is_available()
            else "mps" if torch.backends.mps.is_available() else "cpu"
        )
        model.to(device)

        inputs = tokenizer(
            extracted_text, return_tensors="pt", truncation=True, max_length=512
        )
        inputs = {key: value.to(device) for key, value in inputs.items()}

        with torch.no_grad():
            outputs = model(**inputs)

        logits = outputs.logits
        probabilities = torch.softmax(logits, dim=-1)
        predicted_class_id = torch.argmax(probabilities, dim=-1).item()

        print(f"Predicted class ID: {predicted_class_id}")
        print(f"Probabilities: {probabilities}.cpu().numpy()")
        probs_list = probabilities[0].cpu().numpy().tolist()
        rounded_probs = [round(p, 3) for p in probs_list]
        return EvaluationDto(
            predicted_class_id=int(predicted_class_id),
            probabilities=rounded_probs,
        )

    async def evaluate_bias(self, extracted_text: str) -> BiasEvaluationDto:
        MODEL_PATH = os.path.join(settings.MODEL_PATH, "bias")
        tokenizer = AutoTokenizer.from_pretrained(os.path.join(MODEL_PATH, "tokenizer"))
        model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)

        model.eval()
        device = torch.device(
            "cuda"
            if torch.cuda.is_available()
            else "mps" if torch.backends.mps.is_available() else "cpu"
        )
        model.to(device)

        # Split text into sentences, filter empty strings, and remove duplicates
        # Replace newlines with periods to handle both delimiters, then split by period
        normalized_text = extracted_text.replace("\n", ".")

        # Regex to identify website related metadata (http, https, www, html)
        metadata_pattern = re.compile(r"https?://|www\.|html", re.IGNORECASE)

        sentence_list: List[str] = list(
            dict.fromkeys(
                [
                    s.strip()
                    for s in normalized_text.split(".")
                    if s.strip() and not metadata_pattern.search(s)
                ]
            )
        )

        if not sentence_list:
            return BiasEvaluationDto(top_biased_sentences=[])

        inputs = tokenizer(
            sentence_list,
            return_tensors="pt",
            truncation=True,
            max_length=512,
            padding=True,
        )
        inputs = {key: value.to(device) for key, value in inputs.items()}

        with torch.no_grad():
            outputs = model(**inputs)

        logits = outputs.logits
        probabilities = torch.softmax(logits, dim=-1)

        # Process results
        bias_items = []
        for i, sentence in enumerate(sentence_list):
            probs = probabilities[i]
            confidence_score, predicted_class_id = torch.max(probs, dim=-1)

            bias_items.append(
                BiasItemDto(
                    sentence=sentence,
                    predicted_class_id=int(predicted_class_id.item()),
                    confidence_score=round(float(confidence_score.item()), 3),
                )
            )

        # Filter for class 1 (biased), sort by confidence score descending and take top 5
        biased_only = [item for item in bias_items if item.predicted_class_id == 1]
        # percentage of biased sentences
        percentage_biased = round(len(biased_only) / len(bias_items) * 100, 2)
        top_biased = sorted(
            biased_only, key=lambda x: x.confidence_score, reverse=True
        )[:5]

        return BiasEvaluationDto(top_biased_sentences=top_biased, percentage_biased=percentage_biased)
