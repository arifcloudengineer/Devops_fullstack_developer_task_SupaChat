#!/usr/bin/env python3
"""
SupaChat DevOps Agent — AI-powered deployment & ops assistant
Usage: python devops_agent.py [command]
Commands: deploy, restart, logs, health, diagnose
"""

import subprocess
import sys
import os
import httpx
import json
from datetime import datetime

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
API_URL = "https://api.anthropic.com/v1/messages"

def call_claude(prompt: str, system: str = "") -> str:
    """Call Claude API for AI analysis"""
    headers = {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    }
    body = {
        "model": "claude-sonnet-4-20250514",
        "max_tokens": 1000,
        "messages": [{"role": "user", "content": prompt}]
    }
    if system:
        body["system"] = system

    resp = httpx.post(API_URL, headers=headers, json=body, timeout=30)
    return resp.json()["content"][0]["text"]

def run_cmd(cmd: str) -> tuple[str, str, int]:
    """Run shell command, return stdout, stderr, returncode"""
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return result.stdout, result.stderr, result.returncode

def print_section(title: str):
    print(f"\n{'='*50}")
    print(f"  {title}")
    print(f"{'='*50}")

def health_check():
    """Check health of all containers"""
    print_section("Health Check")
    stdout, _, _ = run_cmd("docker-compose ps --format json 2>/dev/null || docker-compose ps")
    print(stdout)

    stdout, _, code = run_cmd("curl -sf http://localhost/health")
    if code == 0:
        print("✅ API endpoint: healthy")
    else:
        print("❌ API endpoint: unhealthy")

    stdout, _, _ = run_cmd("docker stats --no-stream --format 'table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}'")
    print("\nResource Usage:")
    print(stdout)

def get_logs(lines: int = 100) -> str:
    """Fetch recent logs from all containers"""
    stdout, _, _ = run_cmd(f"docker-compose logs --tail={lines} 2>&1")
    return stdout

def summarize_logs():
    """AI-powered log summarization"""
    print_section("AI Log Analysis")
    print("Fetching logs...")
    logs = get_logs(200)

    if not logs.strip():
        print("No logs found.")
        return

    prompt = f"""Analyze these Docker container logs and provide:
1. A 2-3 sentence summary of what's happening
2. Any errors or warnings found (list them)
3. Root cause analysis if there are issues
4. Recommended fix if needed

Logs:
{logs[-4000:]}"""

    print("Analyzing with AI...\n")
    analysis = call_claude(prompt, system="You are a DevOps expert analyzing container logs. Be concise and actionable.")
    print(analysis)

def diagnose():
    """Full system diagnosis"""
    print_section("System Diagnosis")

    # Gather system info
    cpu, _, _ = run_cmd("top -bn1 | grep 'Cpu(s)' | awk '{print $2}'")
    mem, _, _ = run_cmd("free -h | grep Mem")
    disk, _, _ = run_cmd("df -h / | tail -1")
    containers, _, _ = run_cmd("docker ps --format '{{.Names}}: {{.Status}}'")
    logs = get_logs(50)

    system_info = f"""
CPU: {cpu.strip()}
Memory: {mem.strip()}
Disk: {disk.strip()}
Containers:
{containers}

Recent logs (last 50 lines):
{logs[-2000:]}
"""

    prompt = f"""As a DevOps engineer, diagnose this system and provide:
1. Overall health status (healthy/degraded/critical)
2. Key issues found
3. Step-by-step remediation plan
4. Preventive measures

System info:
{system_info}"""

    print(system_info)
    print("\n--- AI Diagnosis ---\n")
    diagnosis = call_claude(prompt, system="You are a senior DevOps engineer. Provide actionable diagnosis.")
    print(diagnosis)

def deploy():
    """Deploy latest version with zero-downtime"""
    print_section("Deploying SupaChat")
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Starting deployment...")

    steps = [
        ("git pull origin main", "Pulling latest code"),
        ("docker-compose build --no-cache backend", "Building backend"),
        ("docker-compose up -d --no-deps backend", "Starting backend"),
        ("sleep 10 && curl -sf http://localhost:8000/health", "Verifying backend"),
        ("docker-compose build --no-cache frontend", "Building frontend"),
        ("docker-compose up -d --no-deps frontend", "Starting frontend"),
        ("docker-compose up -d nginx", "Restarting nginx"),
        ("docker image prune -f", "Cleaning up old images"),
    ]

    failed_logs = []
    for cmd, description in steps:
        print(f"\n→ {description}...")
        stdout, stderr, code = run_cmd(cmd)
        if code != 0:
            print(f"  ❌ FAILED")
            failed_logs.append(f"Step: {description}\nError: {stderr}\nOutput: {stdout}")
        else:
            print(f"  ✅ Done")

    if failed_logs:
        print("\n--- AI Failure Analysis ---")
        prompt = f"""These deployment steps failed. Explain what went wrong and how to fix it:
{chr(10).join(failed_logs)}"""
        analysis = call_claude(prompt, system="You are a DevOps expert. Give specific, actionable fix instructions.")
        print(analysis)
    else:
        print(f"\n✅ Deployment successful at {datetime.now().strftime('%H:%M:%S')}")

def restart_containers():
    """Safely restart all containers"""
    print_section("Restarting Containers")
    _, _, code = run_cmd("docker-compose restart")
    if code == 0:
        print("✅ All containers restarted")
    else:
        print("❌ Restart failed — run 'python devops_agent.py diagnose' for details")

COMMANDS = {
    "health": health_check,
    "logs": summarize_logs,
    "diagnose": diagnose,
    "deploy": deploy,
    "restart": restart_containers,
}

def main():
    if len(sys.argv) < 2 or sys.argv[1] not in COMMANDS:
        print("SupaChat DevOps Agent")
        print("\nUsage: python devops_agent.py <command>")
        print("\nCommands:")
        for cmd, fn in COMMANDS.items():
            print(f"  {cmd:12} — {fn.__doc__}")
        sys.exit(1)

    command = sys.argv[1]
    COMMANDS[command]()

if __name__ == "__main__":
    main()
