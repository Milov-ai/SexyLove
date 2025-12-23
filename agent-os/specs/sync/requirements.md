# Spec: Offline Sync & Queue

## Status: Active / Core System

## Description

Local-First architecture using Zustand and Supabase.

## Core Requirements

1.  **Offline Availability**: Functional without internet.
2.  **Queue System**: Mutations stored in `OfflineQueue`.
3.  **Conflict Resolution**: Last-Write-Wins.
