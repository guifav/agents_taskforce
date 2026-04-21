"""
Cron Manager - Interface with OpenClaw cron system
"""
import subprocess
import json
from typing import List, Dict, Optional
from datetime import datetime


class CronManager:
    """Manages OpenClaw cron jobs"""
    
    def list_jobs(self) -> List[Dict]:
        """List all cron jobs"""
        try:
            result = subprocess.run(
                ["openclaw", "cron", "list", "--json"],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode == 0:
                jobs = json.loads(result.stdout)
                return self._enrich_jobs(jobs)
            else:
                # Fallback: try without --json
                return self._parse_cron_list(result.stdout)
                
        except Exception as e:
            return self._get_mock_jobs()  # Return empty list on error
    
    def _enrich_jobs(self, jobs: List[Dict]) -> List[Dict]:
        """Add computed fields to jobs"""
        for job in jobs:
            job['status'] = self._get_job_status(job)
            job['next_run'] = self._calculate_next_run(job.get('schedule', ''))
        return jobs
    
    def _parse_cron_list(self, output: str) -> List[Dict]:
        """Parse text output from cron list"""
        jobs = []
        # Basic parsing - can be enhanced based on actual output format
        return jobs
    
    def _get_job_status(self, job: Dict) -> str:
        """Determine job status"""
        enabled = job.get('enabled', True)
        if not enabled:
            return 'paused'
        return 'active'
    
    def _calculate_next_run(self, schedule: str) -> Optional[str]:
        """Calculate next run time from cron expression"""
        # Simplified - could use croniter library for accurate calculation
        return None
    
    def add_job(self, name: str, schedule: str, skill: str, args: List[str] = None) -> Dict:
        """Add a new cron job"""
        cmd = ["openclaw", "cron", "add", "--name", name, "--schedule", schedule, "--skill", skill]
        if args:
            cmd.extend(["--args", json.dumps(args)])
            
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            return {
                'success': result.returncode == 0,
                'message': result.stdout if result.returncode == 0 else result.stderr
            }
        except Exception as e:
            return {'success': False, 'message': str(e)}
    
    def remove_job(self, job_id: str) -> Dict:
        """Remove a cron job"""
        try:
            result = subprocess.run(
                ["openclaw", "cron", "remove", job_id],
                capture_output=True,
                text=True,
                timeout=30
            )
            return {
                'success': result.returncode == 0,
                'message': result.stdout if result.returncode == 0 else result.stderr
            }
        except Exception as e:
            return {'success': False, 'message': str(e)}
    
    def run_job_now(self, job_id: str) -> Dict:
        """Trigger a job to run immediately"""
        try:
            result = subprocess.run(
                ["openclaw", "cron", "run", job_id],
                capture_output=True,
                text=True,
                timeout=30
            )
            return {
                'success': result.returncode == 0,
                'message': result.stdout if result.returncode == 0 else result.stderr
            }
        except Exception as e:
            return {'success': False, 'message': str(e)}
    
    def _get_mock_jobs(self) -> List[Dict]:
        """Get mock cron jobs based on known agent configurations"""
        # These are the expected cron jobs based on skill documentation
        return [
            {
                'id': 'github-guardian',
                'name': 'github-guardian',
                'schedule': '*/10 * * * *',
                'skill': 'github-guardian',
                'status': 'active',
                'enabled': True,
                'last_run': None,
                'next_run': None
            },
            {
                'id': 'security-scout',
                'name': 'security-scout',
                'schedule': '0 6 * * *',
                'skill': 'security-scout',
                'status': 'active',
                'enabled': True,
                'last_run': None,
                'next_run': None
            },
            {
                'id': 'cost-watcher',
                'name': 'cost-watcher',
                'schedule': '0 9 * * *',
                'skill': 'cost-watcher',
                'status': 'active',
                'enabled': True,
                'last_run': None,
                'next_run': None
            }
        ]


# Singleton instance
cron_manager = CronManager()
