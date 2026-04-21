"""
Agent Discovery Service - Detects and manages OpenClaw skills
"""
import os
import yaml
import subprocess
from pathlib import Path
from typing import List, Dict, Optional
from datetime import datetime

OPENCLAW_SKILLS_DIR = Path(os.getenv("OPENCLAW_WORKSPACE", "/Users/gui/.openclaw/workspace")).parent / "skills"
# Fallback for Docker container structure
if not OPENCLAW_SKILLS_DIR.exists():
    OPENCLAW_SKILLS_DIR = Path("/openclaw/.openclaw/skills")

# Check if openclaw is available
OPENCLAW_PATH = os.getenv("OPENCLAW_PATH", "/usr/local/bin/openclaw")

def is_openclaw_available() -> bool:
    """Check if openclaw CLI is available"""
    try:
        result = subprocess.run(
            ["which", "openclaw"],
            capture_output=True,
            text=True,
            timeout=5
        )
        return result.returncode == 0
    except:
        return False


class AgentDiscovery:
    """Discovers and manages OpenClaw skills/agents"""
    
    def __init__(self):
        self.skills_dir = OPENCLAW_SKILLS_DIR
        self._openclaw_available = is_openclaw_available()
        
    def list_skills(self) -> List[Dict]:
        """List all available skills"""
        skills = []
        
        if not self.skills_dir.exists():
            return skills
            
        for skill_dir in self.skills_dir.iterdir():
            if skill_dir.is_dir() and not skill_dir.name.startswith('.'):
                skill_info = self._parse_skill(skill_dir)
                if skill_info:
                    skills.append(skill_info)
                    
        return sorted(skills, key=lambda x: x['name'])
    
    def _parse_skill(self, skill_dir: Path) -> Optional[Dict]:
        """Parse SKILL.md to extract metadata"""
        skill_file = skill_dir / "SKILL.md"
        
        if not skill_file.exists():
            return None
            
        try:
            content = skill_file.read_text()
            
            # Parse YAML frontmatter
            if content.startswith('---'):
                parts = content.split('---', 2)
                if len(parts) >= 3:
                    frontmatter = yaml.safe_load(parts[1])
                    body = parts[2]
                else:
                    frontmatter = {}
                    body = content
            else:
                frontmatter = {}
                body = content
                
            name = frontmatter.get('name', skill_dir.name)
            description = frontmatter.get('description', 'No description available')
            metadata = frontmatter.get('metadata', {}).get('openclaw', {})
            
            return {
                'id': skill_dir.name,
                'name': name,
                'description': description,
                'directory': str(skill_dir),
                'emoji': metadata.get('emoji', ''),
                'requires': metadata.get('requires', {}),
                'has_config': (skill_dir / 'config.json').exists(),
                'last_modified': datetime.fromtimestamp(skill_dir.stat().st_mtime).isoformat()
            }
            
        except Exception as e:
            return {
                'id': skill_dir.name,
                'name': skill_dir.name,
                'description': f'Error parsing: {str(e)}',
                'directory': str(skill_dir),
                'emoji': '',
                'requires': {},
                'has_config': False,
                'last_modified': datetime.fromtimestamp(skill_dir.stat().st_mtime).isoformat()
            }
    
    def get_skill(self, skill_id: str) -> Optional[Dict]:
        """Get specific skill details"""
        skill_dir = self.skills_dir / skill_id
        if skill_dir.exists():
            return self._parse_skill(skill_dir)
        return None
    
    def run_skill(self, skill_id: str, args: List[str] = None) -> Dict:
        """Execute a skill via OpenClaw CLI"""
        skill = self.get_skill(skill_id)
        if not skill:
            return {
                'success': False,
                'error': f'Agent "{skill_id}" not found',
                'timestamp': datetime.utcnow().isoformat()
            }
        
        # Check if openclaw is available
        if not self._openclaw_available:
            return {
                'success': False,
                'error': 'OpenClaw CLI not available in this environment. The dashboard is running in demo mode. To execute agents, please run the dashboard directly on your host machine instead of Docker.',
                'stdout': '',
                'stderr': '',
                'timestamp': datetime.utcnow().isoformat(),
                'demo_mode': True
            }
        
        cmd = ["openclaw", "skill", "run", skill_id]
        if args:
            cmd.extend(args)
            
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=300,
                cwd=str(self.skills_dir.parent.parent)
            )
            
            return {
                'success': result.returncode == 0,
                'stdout': result.stdout,
                'stderr': result.stderr,
                'returncode': result.returncode,
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except subprocess.TimeoutExpired:
            return {
                'success': False,
                'error': 'Agent execution timed out after 5 minutes',
                'timestamp': datetime.utcnow().isoformat()
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }
    
    def get_skill_config(self, skill_id: str) -> Optional[Dict]:
        """Get skill configuration if exists"""
        config_file = self.skills_dir / skill_id / "config.json"
        if config_file.exists():
            import json
            try:
                return json.loads(config_file.read_text())
            except:
                return None
        return None
    
    def update_skill_config(self, skill_id: str, config: Dict) -> bool:
        """Update skill configuration"""
        import json
        config_file = self.skills_dir / skill_id / "config.json"
        try:
            config_file.write_text(json.dumps(config, indent=2))
            return True
        except:
            return False
    
    def get_system_status(self) -> Dict:
        """Get overall system status"""
        return {
            'openclaw_available': self._openclaw_available,
            'skills_dir': str(self.skills_dir),
            'skills_dir_exists': self.skills_dir.exists(),
            'agent_count': len(self.list_skills())
        }


# Singleton instance
agent_discovery = AgentDiscovery()
