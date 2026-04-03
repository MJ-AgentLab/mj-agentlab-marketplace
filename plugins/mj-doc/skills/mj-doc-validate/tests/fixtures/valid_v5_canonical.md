---
type: guide
domain: QCM
summary: Developer guide for QueryCommonMetrics service setup
owner: team-mj
created: 2026-01-15
updated: 2026-03-20
state: active
---

# QueryCommonMetrics Developer Guide

## Overview

This guide covers the setup and configuration of the QueryCommonMetrics service.

## Prerequisites

- Python 3.11+
- Docker
- PostgreSQL 15+

## Setup Steps

1. Clone the repository
2. Install dependencies
3. Configure environment variables
4. Run migrations
5. Start the service

## Configuration

The service uses YAML configuration files located in `src/QueryCommonMetrics/configuration/`.

## Verification

Run the health check endpoint to verify the service is running correctly.

## Related Documents

- [[SPEC_QCM_Architecture]]
- [[RUNBOOK_QCM_Operations]]
