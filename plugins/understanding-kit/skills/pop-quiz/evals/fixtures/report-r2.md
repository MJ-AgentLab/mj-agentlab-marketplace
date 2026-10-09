# Synthetic report task — snapshot synthetic-report-r2

This accepted revision supersedes REQ-REPORT-1 only for payment/refund eligibility. It was provided after the quiz started against synthetic-report-r1.

## Accepted requirements — REQ-REPORT-2

The report includes paid orders that have never been refunded. Refunded orders are excluded entirely, rather than subtracted by refund amount. Canceled orders remain excluded. Gross amount is counted once per eligible order; equal amounts on distinct eligible orders both contribute. Item count belongs only to eligible orders. Integer cents and zero-item orders retain their prior meaning.

## Revised data — DATA-REPORT-2

Order 102 from DATA-REPORT-1 has now been marked refunded. Orders 101, 103, and 104 and all item rows retain their prior attributes. The new implementation filters `status = 'paid' AND refunded_cents = 0` before grouping. In this supplied snapshot, order 101 has refunded_cents 0, order 102 has refunded_cents 3000 and status refunded, and order 104 has refunded_cents 0.

## Supplied synthetic test record — TEST-REPORT-2

The revised test returns C1: gross_cents 10000, item_count 2; C2: gross_cents 15000, item_count 0. This is supplied fixture evidence, not an execution performed by the quiz. Any earlier question or answer whose correct result depends on order 102 being eligible must be reconsidered before it is applied to this revision.
