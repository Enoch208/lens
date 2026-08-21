#!/usr/bin/env node
import { resetWorkspace } from "../lib/store.ts";
import { formatMoney } from "../lib/money.ts";

/** Restore Seatline to the one state every Kane flow assumes. Also reachable at /demo/reset. */
const workspace = resetWorkspace();
const active = workspace.members.filter((member) => member.status === "active").length;

process.stdout.write(
  `Seatline reset — ${workspace.workspace} · ${active} active members · ` +
    `${formatMoney(active * workspace.pricePerSeatCents)} per month\n`,
);
