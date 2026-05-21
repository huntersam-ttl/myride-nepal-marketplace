-- Seed blog posts for testing
INSERT INTO public.blog_posts (
  title,
  slug,
  content,
  excerpt,
  category,
  author,
  published,
  cover_image
) VALUES
(
  'Top 5 Bikes for Nepal''s Mountain Roads',
  'top-5-bikes-nepal-mountain-roads',
  '<h2>Introduction</h2><p>Nepal''s diverse terrain demands reliable motorcycles. From Kathmandu''s busy streets to mountain passes, here are the top 5 bikes that handle it all.</p><h2>1. Royal Enfield Himalayan</h2><p>Built for adventure, the Himalayan excels on rough terrain with its long-travel suspension and fuel-injected engine.</p><h2>2. Hero Xpulse 200</h2><p>Lightweight and affordable, perfect for both city commuting and weekend trail rides.</p><h2>3. Yamaha FZ Series</h2><p>Excellent for urban riding with great fuel efficiency and comfortable ergonomics.</p><h2>4. KTM Duke 200</h2><p>Powerful and agile, ideal for spirited riding on mountain roads.</p><h2>5. Honda CB Hornet 160R</h2><p>Reliable commuter with enough power for highway cruising.</p>',
  'Discover the best motorcycles for Nepal''s challenging roads and terrain.',
  'Guides',
  'MyRideNepal Team',
  true,
  NULL
),
(
  'How to Check a Used Bike Before Buying',
  'how-to-check-used-bike-before-buying',
  '<h2>Introduction</h2><p>Buying a used bike can save money, but only if you know what to check. Here''s a comprehensive checklist.</p><h2>Engine & Mechanics</h2><p>Start the engine cold. Listen for unusual knocking or rattling. Check for oil leaks around the engine gasket.</p><h2>Paperwork</h2><p>Verify the bluebook matches the seller''s name. Check insurance validity and tax clearance.</p><h2>Test Ride</h2><p>Test the brakes, clutch, and gears. Feel for vibrations at different speeds.</p><h2>Accident History</h2><p>Look for misaligned body panels, repainted parts, or frame damage.</p>',
  'Essential checklist for inspecting used motorcycles in Nepal.',
  'Buying Guide',
  'MyRideNepal Team',
  true,
  NULL
),
(
  'Nepal Bike Insurance: Complete Guide 2026',
  'nepal-bike-insurance-guide-2026',
  '<h2>Types of Insurance</h2><p>Understand third-party vs comprehensive coverage for your bike in Nepal.</p><h2>Third-Party Insurance</h2><p>Legally mandatory. Covers damages to others in an accident.</p><h2>Comprehensive Insurance</h2><p>Covers your bike''s damage too. More expensive but worth it for expensive bikes.</p><h2>How to Claim</h2><p>Step-by-step process for filing insurance claims in Nepal.</p>',
  'Everything you need to know about bike insurance in Nepal.',
  'Insurance',
  'MyRideNepal Team',
  true,
  NULL
);
