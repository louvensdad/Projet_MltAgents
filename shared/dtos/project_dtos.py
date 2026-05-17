from pydantic import BaseModel, Field
from typing import Dict, Any, Optional

class ProjectRequestDTO(BaseModel):
    project_name: str = Field(..., description="Name of the project")
    stack_id: str = Field(..., description="Registry ID of the tech stack")
    prompt_data: Dict[str, Any] = Field(..., description="Wizard provided context")

class GenerationResultDTO(BaseModel):
    project_id: str
    status: str
    artifacts: Dict[str, Any]
    preview_url: str
    download_url: str
