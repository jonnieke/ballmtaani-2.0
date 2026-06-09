# WC26 Load Testing Guide

## Overview

This guide covers stress testing BallMtaani's real-time features for World Cup 2026 launch (June 11, 2026). Tests simulate concurrent users hitting predictions, match commentary, zone polls, and debate flagging systems.

---

## Prerequisites

✅ Node.js 18+ installed  
✅ Supabase project created  
✅ Environment variables configured:
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_supabase_anon_key
```

---

## Running Load Tests

### Quick Test (100 users, 60 seconds)
```bash
npm run load-test
```

### Custom Config
```bash
LOAD_TEST_USERS=500 LOAD_TEST_DURATION=120 npm run load-test
```

### Recommended Scenarios

**Scenario 1: Pre-Launch Validation (30 min)**
```bash
LOAD_TEST_USERS=100 LOAD_TEST_DURATION=300 npm run load-test
```
Tests baseline performance with 100 concurrent users over 5 minutes.

**Scenario 2: Heavy Load (Match Day Simulation)**
```bash
LOAD_TEST_USERS=1000 LOAD_TEST_DURATION=600 npm run load-test
```
Simulates peak match-day load: 1000 users over 10 minutes.

**Scenario 3: Extreme Load (Stress Test)**
```bash
LOAD_TEST_USERS=5000 LOAD_TEST_DURATION=120 npm run load-test
```
Tests system breaking point: 5000 users over 2 minutes.

---

## What Gets Tested

✅ **Predictions** - User predictions locked for matches  
✅ **Match Comments** - Live fan reactions with emoji reactions  
✅ **Zone Polls** - Voting on fan zone polls  
✅ **Debate Flags** - Community flagging of inappropriate debates  

Each concurrent user randomly cycles through these operations every 100ms.

---

## Interpreting Results

### Success Rate
- **>99%**: ✅ Excellent - ready for production
- **95-99%**: ⚠️ Acceptable - monitor during launch
- **<95%**: ❌ Poor - optimize before launch

### Latency
- **<200ms avg**: ✅ Excellent
- **200-500ms avg**: ⚠️ Acceptable
- **>500ms avg**: ❌ Poor - needs optimization

### Common Issues

**Issue: High error rate (low success %)**
- Check Supabase realtime enabled on tables
- Verify RLS policies allow operations
- Check database connection limits

**Issue: High latency (>500ms)**
- Add indexes to frequently queried columns
- Reduce polling frequency
- Enable database read replicas
- Check network latency to Supabase

**Issue: Connection drops**
- Supabase free tier max ~200 concurrent connections
- Upgrade to paid plan for higher limits
- Implement connection pooling

---

## Pre-Launch Testing Checklist

### 24 Hours Before Launch

```
□ Run Scenario 1 (100 users, 5 min)
  - Verify >99% success rate
  - Verify latency <200ms avg
  
□ Run Scenario 2 (1000 users, 10 min)
  - Verify >95% success rate
  - Monitor Supabase CPU/connections
  
□ Check real-time subscriptions
  - Verify postgres_changes working
  - Test comment updates live
  
□ Verify all migrations applied
  - Check all tables exist
  - Test RLS policies
  
□ Monitor Supabase logs
  - Check for errors during load test
  - Note any timeouts
```

### Launch Day

```
□ Have dashboards open:
  - Supabase monitoring
  - Application error tracking
  - Database connection pool
  
□ Team on standby
  - Ready to scale up if needed
  - Contact Supabase support if issues
  
□ Gradual rollout
  - Start with 10% of users
  - Monitor for 15 minutes
  - Gradually increase to 100%
```

---

## Performance Targets for WC26

| Metric | Target | Critical |
|--------|--------|----------|
| Avg Latency | <250ms | <1000ms |
| Success Rate | >99% | >95% |
| Error Rate | <1% | <5% |
| Connection Errors | 0 | <10 |
| Realtime Update Delay | <500ms | <2000ms |

---

## Scaling Strategy

If load tests show issues:

### Level 1 (Quick Wins - 30 min)
- [ ] Add indexes to `match_id`, `fan_zone_id`, `debate_id`
- [ ] Enable connection pooling in Supabase
- [ ] Reduce poll update frequency from 10s to 30s
- [ ] Cache leaderboard results

### Level 2 (Database Optimization - 2-4 hours)
- [ ] Enable read replicas on Supabase
- [ ] Archive old match data (>1 month)
- [ ] Partition large tables by date
- [ ] Optimize slow queries via logs

### Level 3 (Architectural Changes - 6-12 hours)
- [ ] Implement message queue for high-volume writes
- [ ] Add Redis cache layer
- [ ] Split realtime subscriptions into regional channels
- [ ] Implement write sharding by match

---

## Monitoring During Launch

### Key Metrics to Watch

```bash
# Supabase Dashboard
- Database CPU: <80%
- Connection count: <150
- Query latency p95: <500ms
- Errors: 0

# Application
- Real-time update latency: <500ms
- Comment post-to-display: <1000ms
- Poll vote latency: <200ms
```

### Alert Thresholds

Set up alerts for:
- Error rate >2%
- Latency p95 >1000ms
- Database CPU >85%
- Connection pool >180/200

---

## Post-Launch Analysis

After WC26 concludes:

1. **Review load test results** vs actual traffic
2. **Document bottlenecks** found
3. **Implement optimizations** for next tournament
4. **Archive test data** for future benchmarking

---

## Support & Troubleshooting

### Supabase Rate Limits Exceeded?

**Free Tier Limits:**
- 200 concurrent connections
- 2,500 rows/second write
- Realtime: 100 concurrent subscriptions per table

**Solution:**
- Upgrade to Pro ($25/month)
- Pro tier: 320 connections, 10k rows/sec

### Test Won't Run?

Check environment variables:
```bash
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_KEY
```

If missing, set them:
```bash
export VITE_SUPABASE_URL=your_url
export VITE_SUPABASE_KEY=your_key
npm run load-test
```

### High Latency Spikes?

1. Check Supabase status page
2. Monitor your internet connection
3. Run test from server (not local)
4. Check for other background processes

---

## WC26 Launch Timeline

**June 9:** Run load tests, finalize optimizations  
**June 10:** Final 1000-user test, monitoring setup  
**June 11 06:00:** Team standby, real-time monitoring active  
**June 11 08:00:** Gradual user rollout begins  
**June 11 20:00:** Full traffic, continuous monitoring  

---

**Built for BallMtaani WC26 Launch | June 2026**
