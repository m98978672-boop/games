"""Choose format for the already-authorized review publisher workflow.

Schedule times are UTC cron literals from GitHub's event, not runner wall-clock
hours (scheduled jobs can start late). Unknown events fail closed.
"""
from __future__ import annotations
import os

from schedule_policy import CRON_SLOTS, slot_format

# No cron literal is hardcoded here on purpose. Format follows CRON_SLOTS in
# schedule_policy, so adding a slot never leaves this file behind and no
# scheduled run can die with "Unknown scheduled review event".


def choose_format(event: str, cron: str, manual: str) -> str:
    if event == 'schedule':
        if cron not in CRON_SLOTS:
            raise ValueError('Unknown scheduled review event')
        # The slot decides the category; the firing hour never does.
        slot_at = CRON_SLOTS[cron][1]
        return slot_format(slot_at)
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
