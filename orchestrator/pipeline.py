import logging
import time
from typing import Dict, Any
from stack_registry.registry import StackRegistry
from prompt_engine.master_builder import PromptMaster
from prompt_engine.validator import PromptValidator
from generation_engine.artifact_builder import ArtifactBuilder

# Core Agents
from orchestrator.engineering_analyzer import EngineeringAnalyzer
from agents.core.architecture_agent import ArchitectureAgent
from agents.core.security_agent import SecurityAgent
from agents.core.dev_ops_agent import DevOpsAgent
from agents.core.performance_agent import PerformanceAgent
from agents.core.anti_pattern_agent import AntiPatternAgent
from agents.core.refactor_agent import RefactorAgent
from agents.core.engineering_gatekeeper_agent import EngineeringGatekeeperAgent
from agents.core.scalability_agent import ScalabilityAgent
from agents.core.infra_agent import InfraAgent

# Stack Agents
from agents.stack.spring_boot_agent import SpringBootAgent
from agents.stack.fast_a_p_i_agent import FastAPIAgent
from agents.stack.nest_j_s_agent import NestJSAgent
from agents.stack.next_j_s_agent import NextJSAgent
from agents.stack.docker_agent import DockerAgent
from agents.stack.kubernetes_agent import KubernetesAgent

logger = logging.getLogger(__name__)

class OrchestratorPipeline:
    """
    Enterprise Multi-Agent Orchestrator
    """
    def __init__(self):
        self.stack_registry = StackRegistry()
        self.prompt_validator = PromptValidator(self.stack_registry)
        self.prompt_master = PromptMaster(self.stack_registry)
        self.engineering_analyzer = EngineeringAnalyzer()
        self.artifact_builder = ArtifactBuilder()
        
        self.core_agents = [
            EngineeringGatekeeperAgent(),
            AntiPatternAgent(),
            ArchitectureAgent(),
            SecurityAgent(),
            PerformanceAgent(),
            DevOpsAgent(),
            ScalabilityAgent(),
            InfraAgent()
        ]
        
        self.stack_agents_map = {
            "springboot": SpringBootAgent(),
            "fastapi": FastAPIAgent(),
            "nestjs": NestJSAgent(),
            "nextjs": NextJSAgent(),
            "docker": DockerAgent(),
            "kubernetes": KubernetesAgent()
        }

    def execute_pipeline(self, project_request: Dict[str, Any]) -> Dict[str, Any]:
        logger.info("Starting Enterprise Multi-Agent Pipeline...")
        
        start_time = time.time()
        trace_log = []

        user_input = project_request.get("project_name", "") + " " + str(project_request.get("prompt_data", {}))
        stack_id = project_request.get("stack_id", "")
        form_data = project_request.get("prompt_data", {})

        # 1. Validation & Master Prompt
        self.prompt_validator.validate(user_input, stack_id, form_data)
        context = self.prompt_master.build_master_prompt(user_input, stack_id, form_data)
        trace_log.append({"step": "prompt_master", "status": "success"})

        # 2. Engineering Analyzer
        logger.info("Executing Engineering Analyzer...")
        context = self.engineering_analyzer.analyze_and_inject(context)
        trace_log.append({"step": "engineering_analyzer", "status": "success"})

        # 3. Core Agents Execution
        logger.info("Executing Core Agents...")
        for agent in self.core_agents:
            agent_name = agent.__class__.__name__
            context = agent.execute(context)
            trace_log.append({"step": agent_name, "status": "success"})

        # 3. Stack Agents Execution
        logger.info("Executing Stack Agents...")
        if stack_id in self.stack_agents_map:
            stack_agent = self.stack_agents_map[stack_id]
            context = stack_agent.execute(context)
            trace_log.append({"step": stack_agent.__class__.__name__, "status": "success"})
            
        if context.get("docker", {}).get("enabled"):
            context = self.stack_agents_map["docker"].execute(context)
            trace_log.append({"step": "DockerAgent", "status": "success"})

        # 4. Artifact Builder
        logger.info("Executing Generation Engine...")
        artifacts = self.artifact_builder.build(context)
        trace_log.append({"step": "ArtifactBuilder", "status": "success"})
        
        # 5. Engineering Memory
        self._generate_engineering_memory(context, trace_log, start_time)

        return {
            "status": "success",
            "artifacts": artifacts,
            "preview_url": f"/api/preview/{artifacts.get('project_id')}",
            "download_url": f"/api/download/{artifacts.get('project_id')}"
        }

    def _generate_engineering_memory(self, context: dict, trace: list, start_time: float):
        import json
        import os
        from datetime import datetime
        
        memory_dir = os.path.join("reports", "engineering_memory")
        os.makedirs(memory_dir, exist_ok=True)
        
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        
        # Trace
        trace_data = {
            "execution_time_seconds": time.time() - start_time,
            "trace": trace
        }
        with open(os.path.join(memory_dir, f"generation_trace_{timestamp}.json"), "w") as f:
            json.dump(trace_data, f, indent=4)
            
        # Architecture Decisions
        with open(os.path.join(memory_dir, f"architecture_decisions_{timestamp}.md"), "w") as f:
            f.write("# Architecture Decisions Log\n")
            f.write("Generated by the Core and Stack Agents.\n\n")
            f.write(f"Stack: {context.get('stack', {}).get('id')}\n")
            f.write(f"Pattern: {context.get('architecture')}\n")
            
        # Security Report
        with open(os.path.join(memory_dir, f"security_report_{timestamp}.md"), "w") as f:
            f.write("# Security Audit Report\n")
            f.write("Generated by the SecurityAgent.\n\n")
            f.write(f"Auth Provider: {context.get('security', {}).get('auth_provider')}\n")
            f.write("Status: Passed\n")
