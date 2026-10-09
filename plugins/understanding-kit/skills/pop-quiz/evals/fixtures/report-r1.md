# Synthetic report task — snapshot synthetic-report-r1

This file is a synthetic source fixture. The records below are supplied task facts, not a claim that any test was executed during this evaluation.

## Accepted requirements — REQ-REPORT-1

The customer report contains one row per customer having at least one paid order. `gross_cents` is the sum of each paid order's gross amount exactly once. Two different orders with the same amount both contribute. Canceled orders contribute neither gross amount nor item count. An order may have zero or many items. `item_count` counts item rows belonging to the customer's paid orders. All stored amounts are integer cents; discounts and refunds are outside this revision's scope.

## Responsibility templates

The developer reviewing this change owns query correctness and regression test design. The Requirement Owner owns the accepted metric definition, status exclusions, and acceptance boundary. These are task-role templates; this source does not assign either responsibility to the current person. Explicit responsibilities in the quiz request select the role being checked; neither role implies a skill level.

## Data and constraints — DATA-REPORT-1

`orders.order_id` is unique. `items.item_id` is unique; `items.order_id` references an order. `items.order_id` is not unique. Customer IDs below are deliberately synthetic.

| order_id | customer_id | status | gross_cents |
| --- | --- | --- | --- |
| 101 | C1 | paid | 10000 |
| 102 | C1 | paid | 10000 |
| 103 | C1 | canceled | 7000 |
| 104 | C2 | paid | 15000 |

| item_id | order_id |
| --- | --- |
| L1 | 101 |
| L2 | 101 |
| L3 | 102 |
| L4 | 103 |
| L5 | 103 |

## Change under review — QUERY-REPORT-1

The removed query directly joined item rows before summing order amounts:

```sql
SELECT o.customer_id, SUM(o.gross_cents) AS gross_cents,
       COUNT(i.item_id) AS item_count
FROM orders o
LEFT JOIN items i ON i.order_id = o.order_id
WHERE o.status = 'paid'
GROUP BY o.customer_id;
```

The current query first produces one item-count row per order:

```sql
WITH item_counts AS (
  SELECT order_id, COUNT(*) AS item_count
  FROM items
  GROUP BY order_id
)
SELECT o.customer_id, SUM(o.gross_cents) AS gross_cents,
       SUM(COALESCE(c.item_count, 0)) AS item_count
FROM orders o
LEFT JOIN item_counts c ON c.order_id = o.order_id
WHERE o.status = 'paid'
GROUP BY o.customer_id;
```

## Supplied engineering test record — TEST-REPORT-1

This synthetic review record states that the current query's table-driven test used DATA-REPORT-1 and returned C1: gross_cents 20000, item_count 3; C2: gross_cents 15000, item_count 0. A separate review checked that the current join's right side contains at most one row per order. The record demonstrates this fixture's behavior; it does not establish general production coverage or the Owner's understanding.

The pending review decisions are whether the query preserves the metric's order grain, whether same-valued orders remain distinct business entities, and whether regression cases expose duplicate counting and missing zero-item orders. Read the provided evidence; do not execute SQL, create tests, or change the engineering task.
