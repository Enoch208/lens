---
mode: testing
max_steps: 30
tags: [lens, seatline]
---

# Annual billing

The billing breakdown, on both cadences. Seat count, price per seat and subtotal are recorded as
protected observations; the discount and total are recorded as the numbers the annual-billing
feature is expected to move.

## Reset the workspace
Go to {{app_url}}/demo/reset and assert the text "Workspace reset" is visible.

## Open the billing page
Go to {{app_url}}/billing and assert the heading "Billing" is visible.

## Record the billable seat count
Store the value shown under the "Billable seats" label as "billable_seats".

## Record the price per seat
Store the value shown under the "Price per seat" label as "price_per_seat".

## Record the monthly subtotal
Store the value shown under the "Subtotal" label as "monthly_subtotal".

## Switch to annual billing
Click the "Annual — Save 10%" button.

## Record the annual discount
Store the value shown under the "Annual discount" label as "annual_discount".

## Record the billed total
Store the value shown under the "Total" label as "billing_total".
