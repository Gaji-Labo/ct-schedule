"""基底ハーネスで1回だけ rollout する（改善はしない）。タスク定義と足場の確認用。

    experiments/harness2/h2 smoke --task mypage [--label base]
    experiments/harness2/h2 judge --task mypage --ns smoke
"""

from __future__ import annotations

import argparse
import sys

from .adapter import CtdsAdapter


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--task", required=True)
    ap.add_argument("--label", default="base")
    args = ap.parse_args(argv)
    ad = CtdsAdapter()
    out = ad.execute(args.task, None, f"smoke/{args.task}/{args.label}")
    print(out)
    return 0 if ad.delivered(out) else 1


if __name__ == "__main__":
    sys.exit(main())
