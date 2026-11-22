"""Choose format for the already-authorized review publisher workflow.

Schedule times are UTC cron literals from GitHub's event, not runner wall-clock
hours (scheduled jobs can start late). Unknown events fail closed.
"""
from __future__ import annotations
import os

SHORT_CRON = '0 1,5 * * *'
LONG_CRON = '0 22 * * *'


def choose_format(event: str, cron: str, manual: str) -> str:
    if event == 'schedule':
        if cron == SHORT_CRON:
            return 'short'
        if cron == LONG_CRON:
            return 'long'
        raise ValueError('Unknown scheduled review event')
    if event == 'workflow_dispatch' and manual in ('short', 'long'):
        return manual
    raise ValueError('Unexpected review event or video format')


def main() -> None:
    result = choose_format(os.environ.get('GITHUB_EVENT_NAME', ''),
                           os.environ.get('REVIEW_SCHEDULE', ''),
                           os.environ.get('MANUAL_VIDEO_FORMAT', ''))
    with open(os.environ['GITHUB_ENV'], 'a', encoding='utf-8') as output:
        output.write(f'VIDEO_FORMAT={result}\n')
    print(f'Selected review format: {result}')


if __name__ == '__main__':
    main()
