import subprocess
import re

result = subprocess.run(['git', 'diff', 'portfolio.html'], capture_output=True, text=True, encoding='utf-8')
diff = result.stdout

# Find all lines added (+) or removed (-) containing data-subcat
lines = diff.split('\n')
for line in lines:
    if line.startswith('+') or line.startswith('-'):
        if 'data-subcat' in line or 'portfolio-card' in line:
            print(line)
