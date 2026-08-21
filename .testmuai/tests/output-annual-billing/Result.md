---
test: ../annual-billing_test.md
status: passed
started: 2026-08-21T16:41:55.083Z
duration_s: 285
session_id: d2f67679-5dfd-4cc5-a27f-77aacdf11dd3
---

# Annual billing — Result

## Reset the workspace ✓ passed (32.2s)
md5: b4dc70548fe294e5625abe794a7b4ddc
Go to {{app_url}}/demo/reset and assert the text "Workspace reset" is visible.

## Open the billing page ✓ passed (21s)
md5: e0e394bdfe36a63ff21a4b628aa70f61
Go to {{app_url}}/billing and assert the heading "Billing" is visible.

## Record the billable seat count ✓ passed (37.9s)
md5: 50124e846fee0e6a7fc6e6ecb3df70d8
Store the value shown under the "Billable seats" label as "billable_seats".

## Record the price per seat ✓ passed (47.7s)
md5: f5bc2a3087d7b4e9b9ac474613afd70f
Store the value shown under the "Price per seat" label as "price_per_seat".

## Record the monthly subtotal ✓ passed (50.4s)
md5: b63d5dbcf65057e93e46502e9faeb5c9
Store the value shown under the "Subtotal" label as "monthly_subtotal".

## Switch to annual billing ✓ passed (15.1s)
md5: da8d5559b7c7fe6a3faea0edbff2ee3c
Click the "Annual — Save 10%" button.

## Record the annual discount ✓ passed (35.8s)
md5: ac81a687c66e4b17798194e1e9456d7a
Store the value shown under the "Annual discount" label as "annual_discount".

## Record the billed total ✓ passed (41.8s)
md5: 27e65a683bf8ebf361d3ef784cd51595
Store the value shown under the "Total" label as "billing_total".
