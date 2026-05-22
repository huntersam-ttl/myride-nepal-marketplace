# First 30 Days Growth Plan

**Purpose:** Structured launch and growth strategy for MyRideNepal  
**Date:** 22 May 2026  
**Goal:** Launch successfully, onboard 20-30 dealers, reach 500+ listings, validate market fit

---

## Overview

**Launch Philosophy:** Start small, move fast, learn quickly

**Week 1:** Clean & Seed (Internal)  
**Week 2:** Dealer Outreach (Beta Partners)  
**Week 3:** Content & Visibility (Public Awareness)  
**Week 4:** Scale & Optimize (Expand Reach)

**Key Success Metrics:**
- Listings added: 50+ (Week 1), 150+ (Week 2), 300+ (Week 3), 500+ (Week 4)
- Dealers contacted: 0 (Week 1), 50+ (Week 2), 100+ (Week 3), 150+ (Week 4)
- Dealers onboarded: 2-3 (Week 1), 10-15 (Week 2), 20-25 (Week 3), 30-40 (Week 4)
- Website visits: 100+ (Week 1), 500+ (Week 2), 2000+ (Week 3), 5000+ (Week 4)
- WhatsApp clicks: 5+ (Week 1), 25+ (Week 2), 100+ (Week 3), 250+ (Week 4)
- Buyer inquiries: 2+ (Week 1), 15+ (Week 2), 50+ (Week 3), 150+ (Week 4)

---

## WEEK 1: Clean & Seed (Days 1-7)

**Theme:** Get the house ready before guests arrive

### Day 1-2: Data Cleanup (Follow ADMIN_DATA_CLEANUP_GUIDE.md)

**Tasks:**
- [ ] Create database backup via Supabase Dashboard
- [ ] Run cleanup queries to soft-delete test listings
- [ ] Suspend test dealer profiles
- [ ] Remove test reviews, leads, notifications
- [ ] Verify public pages show no test data
- [ ] Run verification SQL queries from guide
- [ ] Document cleanup results

**Time:** 2-3 hours  
**Owner:** Technical team  
**Success:** 0 test listings visible on public pages

---

### Day 2-5: Seed Quality Data (Follow SEED_DATA_PLAN.md)

**Day 2: Image Gathering (3-4 hours)**
- [ ] Prepare seed-listings.csv with 20-30 listing ideas
- [ ] Gather 60-90 bike images (3 per listing)
  - Real bikes from friends/family (preferred)
  - Stock photos from Unsplash/Pexels "motorcycle nepal"
  - Organize in folders: listing-001/, listing-002/, etc.
- [ ] Upload images to Supabase Storage

**Day 3: Create Listings (4-5 hours)**
- [ ] Create 20-30 quality listings with variety:
  - Hero 4-6, Honda 4-6, Pulsar 3-5, Yamaha 2-4, KTM 2-3, TVS 2-3
  - Kathmandu 8-12, Lalitpur 3-5, Bhaktapur 2-3, Pokhara 2-4
  - Price ranges: Budget 5-7, Mid 8-10, Premium 5-7
  - Realistic details, natural descriptions, valid phone numbers
- [ ] Run quality control checks (10-point checklist)

**Day 4: Dealer Profiles (3-4 hours)**
- [ ] Create 2-3 complete dealer profiles:
  - "Kathmandu Motors" (Hero/Honda/Yamaha)
  - "Valley Bikes" (Pulsar/KTM)
  - Optional 3rd: "Pokhara Two Wheelers"
- [ ] Add 5-10 listings per dealer
- [ ] Upload logos and banners
- [ ] Complete all profile fields
- [ ] Run quality control checks (9-point checklist)

**Day 5: Content & QA (2-3 hours)**
- [ ] Write 1 blog article: "10 Things to Check Before Buying a Used Bike in Nepal"
- [ ] Add featured images
- [ ] Publish article
- [ ] Test all pages (homepage, browse, dealer directory)
- [ ] Verify no console errors
- [ ] Test on mobile

**Time:** 12-16 hours total  
**Owner:** Content/operations team  
**Success:** 20-30 listings, 2-3 dealers, 1 blog post live

---

### Day 6-7: Soft Launch to Friends/Family

**Tasks:**
- [ ] Send launch message to 10-15 close friends/family
- [ ] Ask them to:
  - Create account and browse
  - Create 1-2 test listings (can delete later)
  - Try dealer signup flow
  - Report bugs, UX issues, confusing parts
  - Share honest feedback
- [ ] Monitor feedback in shared doc/WhatsApp group
- [ ] Fix critical bugs immediately
- [ ] Note "nice to have" improvements for later

**Message Template:**
```
Hey [Name]! 👋

I'm launching MyRideNepal — a free bike marketplace for Nepal. Would love your help testing it before we go public!

Can you:
1. Visit myridenepal.com
2. Browse around
3. Create a free listing (use fake data, we'll delete later)
4. Tell me what's confusing/broken

Should take 10-15 minutes. Your honest feedback would help a lot!

Thanks! 🙏
```

**Time:** 2-3 hours (monitoring + fixes)  
**Owner:** Founder/core team  
**Success:** 5-10 users test, 2-3 critical bugs found and fixed

---

### Week 1 Success Metrics

**By End of Week 1:**
- ✅ 20-30 quality listings live
- ✅ 2-3 complete dealer profiles
- ✅ 1 blog article published
- ✅ Test data cleaned
- ✅ 5-10 friends/family tested
- ✅ Critical bugs fixed
- ✅ Website fast and functional

---

## WEEK 2: Dealer Outreach (Days 8-14)

**Theme:** Build the dealer base

### Day 8-9: Prepare Outreach Materials

**Tasks:**
- [ ] Review DEALER_OUTREACH_MESSAGES.md
- [ ] Customize WhatsApp templates with your info
- [ ] Prepare dealer list (research 50-100 dealers):
  - 30-40 Kathmandu Valley dealers
  - 10-15 Pokhara dealers
  - 5-10 other major cities
- [ ] Add to DEALER_OUTREACH_TRACKER_TEMPLATE.md
- [ ] Prioritize Tier 1 dealers (large, multi-brand, established)
- [ ] Set up WhatsApp Business account (if not done)

**Time:** 3-4 hours  
**Owner:** Sales/outreach team  
**Success:** 50+ dealer contacts ready, templates personalized

---

### Day 9-14: Active Dealer Outreach (20-30 contacts)

**Daily Schedule:**
```
Morning (10am-12pm):
- Contact 5-7 dealers via WhatsApp
- Make 2-3 phone calls to high-priority dealers
- Follow up on previous day's interested dealers

Afternoon (2pm-5pm):
- Respond to dealer inquiries
- Help interested dealers with onboarding
- Update tracker with results
- Send follow-up messages

Evening (6pm-7pm):
- Review day's results
- Plan next day's outreach
- Update strategy based on what's working
```

**Outreach Mix:**
- 60% WhatsApp messages (quick, non-intrusive)
- 30% Phone calls (high-priority dealers)
- 10% In-person visits (Kathmandu local dealers)

**Daily Targets:**
- Contact: 5-7 new dealers per day
- Responses: 2-3 per day (40-50% response rate)
- Onboarded: 1-2 per day

**Tasks:**
- [ ] Day 9: Contact 5 Kathmandu dealers (WhatsApp)
- [ ] Day 10: Contact 5 Kathmandu dealers + follow up yesterday's
- [ ] Day 11: Contact 5 dealers + 2 phone calls to interested
- [ ] Day 12: Contact 5 dealers + help 2 onboard
- [ ] Day 13: Contact 5 dealers + in-person visit to 1-2
- [ ] Day 14: Follow up all interested, help 2-3 complete setup

**Use DEALER_OUTREACH_TRACKER_TEMPLATE.md to track:**
- Contacted date
- Response status
- Objections raised
- Onboarding status
- Follow-up dates

**Time:** 4-6 hours per day  
**Owner:** Sales/founder  
**Success:** 30+ dealers contacted, 10-15 interested, 5-7 onboarded

---

### Day 12-14: First Social Posts

**Tasks:**
- [ ] Set up social media pages:
  - Facebook page: "MyRideNepal"
  - Instagram account: @myridenepal
  - TikTok account: @myridenepal
- [ ] Post launch announcement (use SOCIAL_LAUNCH_CONTENT.md)
- [ ] Post dealer beta announcement
- [ ] Post 1-2 featured listings
- [ ] Join 5-10 Nepal bike Facebook groups (request permission)
- [ ] Share in 2-3 groups (with admin approval)

**Platforms to Start:**
- Facebook (primary)
- Instagram (visual)
- TikTok (if you have video content)

**Time:** 2-3 hours  
**Owner:** Marketing/content  
**Success:** Pages set up, 3-5 posts published, 50-100 followers

---

### Week 2 Success Metrics

**By End of Week 2:**
- ✅ 30+ dealers contacted
- ✅ 10-15 dealers interested
- ✅ 5-10 dealers onboarded (with 5+ listings each)
- ✅ 80-100 total listings (seed + dealer)
- ✅ Social pages set up and active
- ✅ 5-10 buyer inquiries via WhatsApp/phone
- ✅ 300-500 website visits

---

## WEEK 3: Content & Visibility (Days 15-21)

**Theme:** Make noise, get noticed

### Day 15-17: Content Push

**Blog Content:**
- [ ] Day 15: Write "Most Popular Commuter Bikes in Kathmandu Valley 2024" (600-800 words)
- [ ] Day 16: Write "How to Sell Your Bike Faster on MyRideNepal" (600-800 words)
- [ ] Day 17: Publish both articles with featured images

**Social Content (Use SOCIAL_LAUNCH_CONTENT.md):**
- [ ] Post safety tips (Facebook)
- [ ] Post buyer-focused content (Instagram)
- [ ] Create listing tutorial video (TikTok/Instagram Reels)
- [ ] Share dealer spotlight (feature 1 beta dealer)

**Time:** 6-8 hours  
**Owner:** Content team  
**Success:** 3 blog articles total, 5-7 social posts, video content created

---

### Day 16-21: Expand Dealer Outreach (30+ more contacts)

**Continue Daily Outreach:**
- Contact 5-7 new dealers per day
- Focus on Tier 2 dealers (mid-size, dual-brand)
- Expand to Pokhara, Biratnagar, Bharatpur, Butwal
- Follow up Week 2 interested dealers
- Help Week 2 dealers add more listings

**Outreach Adjustments:**
- Use social proof ("15 dealers joined already")
- Share success stories (if dealers getting leads)
- Adjust pitch based on common objections
- Focus on dealers who responded positively in Week 2

**Daily Targets:**
- Contact: 5-7 new dealers
- Follow-ups: 3-5 previous contacts
- Onboarded: 2-3 per day

**Tasks:**
- [ ] Contact 35+ new dealers (5 per day)
- [ ] Follow up 20+ previous contacts
- [ ] Onboard 10-15 more dealers
- [ ] Help dealers optimize their listings

**Time:** 4-6 hours per day  
**Owner:** Sales team  
**Success:** 60+ total dealers contacted, 20-25 total onboarded

---

### Day 18-21: Community Engagement

**Facebook Groups:**
- [ ] Post in 5-7 bike groups (with permission)
- [ ] Engage with comments on posts
- [ ] Answer questions in groups
- [ ] Share helpful safety tips (not promotional)

**Direct Engagement:**
- [ ] Respond to all social media comments within 2 hours
- [ ] Answer all WhatsApp inquiries same day
- [ ] Help sellers optimize listings
- [ ] Collect feedback from early users

**Time:** 2-3 hours per day  
**Owner:** Community manager  
**Success:** Active in 5+ groups, responding to all inquiries quickly

---

### Day 19-21: Feedback & Improvement

**Tasks:**
- [ ] Collect feedback from 5-10 dealers
- [ ] Collect feedback from 5-10 buyers/sellers
- [ ] Document common pain points
- [ ] Fix 2-3 small UX issues
- [ ] Update FAQ based on common questions
- [ ] Improve empty states if needed

**Feedback Questions:**
- What's confusing about the platform?
- What would make it more useful?
- Are you getting buyer inquiries?
- What features are missing?
- Would you recommend to other dealers?

**Time:** 3-4 hours  
**Owner:** Product/founder  
**Success:** 10+ feedback responses, 2-3 improvements implemented

---

### Week 3 Success Metrics

**By End of Week 3:**
- ✅ 60-70 dealers contacted total
- ✅ 20-25 dealers onboarded
- ✅ 200-300 total listings
- ✅ 3 blog articles published
- ✅ Active in 5+ Facebook groups
- ✅ 30-50 buyer inquiries
- ✅ 1,500-2,000 website visits
- ✅ 10-20 WhatsApp clicks per day
- ✅ First testimonials collected

---

## WEEK 4: Scale & Optimize (Days 22-30)

**Theme:** Expand reach, optimize conversion

### Day 22-24: Dealer Push (Final Beta Spots)

**Tasks:**
- [ ] Contact remaining 30-40 dealers from list
- [ ] Create urgency ("Only 10 beta spots left")
- [ ] Focus on quality over quantity
- [ ] Prioritize multi-brand dealers
- [ ] Target dealers with 10+ bikes
- [ ] Help existing dealers add more listings

**Outreach Strategy:**
- Use stronger social proof ("30 dealers joined")
- Share early success metrics (if available)
- Offer extra help for onboarding
- Focus on Tier 1 dealers still not contacted

**Time:** 4-6 hours per day  
**Owner:** Sales team  
**Success:** 80-100 total dealers contacted, 30-40 total onboarded

---

### Day 23-26: Content Campaign

**Blog Content:**
- [ ] Write safety guide: "How to Avoid Scams When Buying a Bike in Nepal"
- [ ] Write market insight: "Best Time to Buy/Sell a Bike in Nepal"

**Video Content (If Resources Allow):**
- [ ] Create platform demo video (2-3 minutes)
- [ ] Create dealer testimonial video (1-2 minutes)
- [ ] Create listing tutorial video (90 seconds)

**Social Content:**
- [ ] Daily posts on Facebook/Instagram
- [ ] Share featured listings (highlight best deals)
- [ ] Post dealer spotlights (2-3 dealers)
- [ ] Share buyer success stories (if available)
- [ ] Post behind-the-scenes content

**Time:** 5-7 hours  
**Owner:** Content/marketing  
**Success:** 2 more blog articles, video content created, daily social activity

---

### Day 25-28: Seller Acquisition Push

**Focus on Individual Sellers:**
- [ ] Post in Facebook groups (focus on sellers)
- [ ] Create Instagram post targeting sellers
- [ ] Reach out to friends who own bikes
- [ ] Encourage dealers to refer individual sellers
- [ ] Offer help with listing creation

**Messaging:**
- "Sell your bike for free"
- "No commission, no middleman"
- "List in 5 minutes"

**Target:** 20-30 individual seller listings

**Time:** 2-3 hours per day  
**Owner:** Marketing  
**Success:** 20-30 new individual seller listings added

---

### Day 26-30: Analytics & Optimization

**Data Analysis:**
- [ ] Review Google Analytics (if set up)
- [ ] Check which pages have highest bounce rate
- [ ] Identify which listings get most views
- [ ] Track WhatsApp click-through rate
- [ ] Analyze dealer dashboard usage
- [ ] Review which social posts performed best

**Optimization:**
- [ ] Improve high-bounce pages
- [ ] Add more listings in popular categories
- [ ] Fix any slow-loading pages
- [ ] Improve mobile experience if needed
- [ ] Update homepage with best-performing content

**Time:** 4-5 hours  
**Owner:** Technical/product  
**Success:** 2-3 optimizations implemented, analytics dashboard set up

---

### Day 28-30: Prepare for Month 2

**Planning:**
- [ ] Review Month 1 metrics vs goals
- [ ] Document what worked / what didn't
- [ ] Plan Month 2 strategy
- [ ] Set Month 2 targets
- [ ] Identify blockers and solutions
- [ ] Celebrate wins with team!

**Month 2 Preview:**
- [ ] Expand to more cities (Biratnagar, Bharatpur, Hetauda)
- [ ] Launch referral program for dealers
- [ ] Start small paid ad testing (if budget)
- [ ] Host first dealer meetup (if 20+ dealers in Kathmandu)
- [ ] Improve features based on feedback

**Time:** 3-4 hours  
**Owner:** Founder/team  
**Success:** Month 2 plan documented, team aligned on goals

---

### Week 4 Success Metrics

**By End of Week 4 (Day 30):**
- ✅ 80-100 dealers contacted total
- ✅ 30-40 dealers onboarded and active
- ✅ 400-500 total listings (dealer + individual)
- ✅ 5 blog articles published
- ✅ Video content created
- ✅ Active in 8-10 Facebook groups
- ✅ 100-150 buyer inquiries total
- ✅ 4,000-5,000 website visits
- ✅ 200-300 WhatsApp clicks
- ✅ 5-10 confirmed sales (listings marked as sold)

---

## Metrics Tracking

### Daily Metrics (Track Every Day)

| Metric | Target Week 1 | Target Week 2 | Target Week 3 | Target Week 4 |
|--------|---------------|---------------|---------------|---------------|
| Dealers contacted (new) | 0 | 5-7/day | 5-7/day | 4-5/day |
| Dealers onboarded (cumulative) | 2-3 | 5-10 | 20-25 | 30-40 |
| Total listings | 30-50 | 80-120 | 200-300 | 400-500 |
| Website visits | 100-200 | 300-500 | 1500-2000 | 4000-5000 |
| WhatsApp clicks | 5-10 | 20-30 | 80-120 | 200-300 |
| Phone clicks | 3-5 | 10-15 | 40-60 | 100-150 |
| Buyer inquiries | 2-5 | 10-20 | 40-60 | 120-180 |

### Weekly Review (End of Each Week)

**Questions to Answer:**
1. Did we hit our dealer onboarding target?
2. Are dealers adding 5+ listings each?
3. Are buyers contacting sellers? (conversion happening?)
4. Which listings get most views?
5. What are common dealer objections?
6. What are common buyer complaints?
7. What's our biggest bottleneck?
8. What worked best this week?
9. What should we do more of next week?
10. What should we stop doing?

---

## Resource Requirements

### Team Time Commitment (Hours per Week)

**Week 1:**
- Technical: 12 hours (cleanup + seed data)
- Content: 8 hours (listings + blog)
- QA: 3 hours (testing)
- Total: 23 hours

**Week 2:**
- Sales/Outreach: 30 hours (6 hours/day × 5 days)
- Content: 5 hours (social posts)
- Support: 5 hours (help dealers onboard)
- Total: 40 hours

**Week 3:**
- Sales/Outreach: 30 hours
- Content: 12 hours (blog + social + video)
- Community: 10 hours (engage in groups)
- Product: 4 hours (feedback + improvements)
- Total: 56 hours

**Week 4:**
- Sales/Outreach: 25 hours
- Content: 10 hours
- Community: 8 hours
- Analytics: 5 hours
- Planning: 4 hours
- Total: 52 hours

**Month 1 Total:** ~170 hours (roughly full-time for 1 person for a month, or part-time for 2-3 people)

---

## Budget (If Available)

**Optional Expenses:**

| Item | Cost (NPR) | Purpose |
|------|------------|---------|
| Facebook ads (testing) | 5,000-10,000 | Boost dealer beta post |
| Instagram ads (testing) | 3,000-5,000 | Reach bike enthusiasts |
| Stock photos (if needed) | 2,000-5,000 | Professional listing images |
| Domain/email (if not done) | 2,000-3,000 | Professional communication |
| WhatsApp Business | Free | Dealer communication |
| Canva Pro (optional) | 1,500/month | Social media graphics |
| **Total (optional)** | **15,000-25,000** | Helps but not required |

**Note:** Everything can be done with ZERO budget except domain/hosting (already assumed to exist).

---

## Risk Mitigation

### Risk 1: Dealers Don't Respond
**Mitigation:**
- Try different outreach channels (WhatsApp → Call → Visit)
- Adjust messaging based on feedback
- Offer more help with onboarding
- Focus on social proof from early dealers

### Risk 2: Buyers Don't Trust Platform
**Mitigation:**
- Add more verified badges
- Publish safety guides prominently
- Show testimonials from early users
- Add "How it works" explainer everywhere
- Respond quickly to buyer questions

### Risk 3: Low Listing Quality
**Mitigation:**
- Review each dealer listing before approval
- Provide listing guidelines to dealers
- Help dealers improve photos/descriptions
- Remove low-quality listings

### Risk 4: Technical Issues
**Mitigation:**
- Monitor error logs daily
- Fix critical bugs within 24 hours
- Have backup plans (manual contact if platform down)
- Test on multiple devices regularly

### Risk 5: Low Buyer Engagement
**Mitigation:**
- Increase social media posting
- Share in more Facebook groups
- Improve SEO (add meta descriptions)
- Ask dealers to share their listings
- Create compelling featured listings

---

## Success Criteria (End of Month 1)

### Minimum Success:
- ✅ 20+ dealers onboarded with complete profiles
- ✅ 200+ listings (mix of dealer and individual)
- ✅ 2,000+ website visits
- ✅ 50+ buyer inquiries via WhatsApp/phone
- ✅ 3+ confirmed sales (bikes marked as sold)
- ✅ Zero critical bugs
- ✅ Positive feedback from 5+ dealers

### Target Success:
- ✅ 30-40 dealers onboarded
- ✅ 400-500 listings
- ✅ 4,000-5,000 website visits
- ✅ 120-180 buyer inquiries
- ✅ 8-12 confirmed sales
- ✅ Active community in 10+ Facebook groups
- ✅ 200-500 social media followers
- ✅ Testimonials from 10+ happy users

### Stretch Success:
- ✅ 50+ dealers onboarded
- ✅ 600+ listings
- ✅ 10,000+ website visits
- ✅ 300+ buyer inquiries
- ✅ 20+ confirmed sales
- ✅ Featured in local tech blog/news
- ✅ 500-1000 social followers
- ✅ Dealers asking to pay for premium features

---

## Next Steps After Day 30

**If Minimum Success Met:**
- Continue Month 2 with same strategy
- Expand to more cities
- Add 2-3 new team members (if budget)
- Consider premium features
- Host first dealer meetup

**If Target Success Met:**
- Accelerate growth (more outreach)
- Launch referral program
- Start small paid ads
- Invest in video content
- Plan public launch event

**If Below Minimum:**
- Pause outreach, focus on existing dealers
- Deep dive into why dealers aren't onboarding
- Improve platform based on feedback
- Consider pivoting strategy
- Get honest feedback from 10+ potential dealers

---

## Daily Routine (Sample)

**Morning (9am-12pm):**
- Check overnight inquiries (WhatsApp, email)
- Review yesterday's metrics
- Contact 3-5 new dealers
- Follow up interested dealers
- Post on social media

**Afternoon (2pm-5pm):**
- Help 1-2 dealers onboard
- Respond to buyer inquiries
- Engage in Facebook groups
- Update tracker with results
- Create content for tomorrow

**Evening (6pm-8pm):**
- Review day's progress
- Plan tomorrow's outreach
- Update metrics dashboard
- Quick team sync (if team)
- Note learnings in doc

**Time:** 6-8 hours per day (full-time) or 3-4 hours (part-time)

---

## Key Learnings to Document

**Track These Insights:**
1. Which dealer pitch works best?
2. What objections do dealers raise most?
3. Which listings get most views?
4. What time of day gets most traffic?
5. Which Facebook groups have best engagement?
6. What makes dealers decide to join?
7. What makes buyers contact sellers?
8. Which brands are most searched?
9. Which cities have most demand?
10. What features do users request most?

**Review Weekly:** Update strategy based on learnings

---

**Last Updated:** 22 May 2026  
**Owner:** Founder/Growth Team  
**Next Review:** End of Day 30 (Month 1 retrospective)

---

## Quick Reference Checklist

### Week 1: ☐ Clean ☐ Seed ☐ Test with friends
### Week 2: ☐ Contact 30+ dealers ☐ Onboard 10+ ☐ Launch social
### Week 3: ☐ Contact 30+ more ☐ Write content ☐ Join groups
### Week 4: ☐ Contact final dealers ☐ Optimize ☐ Plan Month 2

**End State:** 30-40 dealers, 400-500 listings, 4,000+ visits, proven market fit ✅
