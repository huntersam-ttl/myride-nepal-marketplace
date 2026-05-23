#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n');
  
  // Test 1: Check connection
  console.log('1. Checking connection to Supabase...');
  try {
    const { data, error } = await supabase.from('listings').select('count').limit(1);
    if (error) throw error;
    console.log('   ✅ Connected successfully!\n');
  } catch (error) {
    console.log(`   ❌ Connection failed: ${error.message}\n`);
    return false;
  }
  
  // Test 2: Check if rejection_reason column exists
  console.log('2. Checking if rejection_reason column exists...');
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('rejection_reason')
      .limit(1);
    
    if (error) {
      console.log('   ℹ️  Column does not exist yet\n');
      return false;
    }
    console.log('   ✅ Column already exists!\n');
    return true;
  } catch (error) {
    console.log('   ℹ️  Column does not exist yet\n');
    return false;
  }
}

async function checkTables() {
  console.log('3. Checking database tables...\n');
  
  const tables = ['listings', 'profiles', 'user_roles', 'dealer_profiles', 'blog_posts', 'saved_listings'];
  
  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`   ❌ ${table}: Not accessible`);
      } else {
        console.log(`   ✅ ${table}: ${count ?? 0} rows`);
      }
    } catch (error) {
      console.log(`   ❌ ${table}: Error`);
    }
  }
  console.log();
}

async function testAuthAndRLS() {
  console.log('4. Testing RLS policies...\n');
  
  // Test anonymous access to active listings
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('id, status')
      .eq('status', 'active')
      .limit(5);
    
    if (error) throw error;
    console.log(`   ✅ Can query active listings (found ${data.length})`);
  } catch (error) {
    console.log(`   ❌ Cannot query listings: ${error.message}`);
  }
  
  console.log();
}

// Run tests
console.log('╔═══════════════════════════════════════════════╗');
console.log('║   MyRideNepal - Supabase Connection Test     ║');
console.log('╚═══════════════════════════════════════════════╝\n');

const columnExists = await testConnection();
await checkTables();
await testAuthAndRLS();

console.log('═══════════════════════════════════════════════\n');

if (!columnExists) {
  console.log('⚠️  MIGRATION NEEDED');
  console.log('\nTo add the rejection_reason column, you need to:');
  console.log('1. Go to https://supabase.com/dashboard/project/rcypkqctgonotawnajqb/editor');
  console.log('2. Click on "SQL Editor"');
  console.log('3. Run this SQL:\n');
  console.log('   ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS rejection_reason TEXT;');
  console.log('\n   COMMENT ON COLUMN public.listings.rejection_reason IS');
  console.log('   \'Reason provided by admin when rejecting a listing\';');
  console.log('\n4. Click "Run" to execute the migration\n');
} else {
  console.log('✅ Database is up to date!\n');
}

console.log('🚀 Your application is ready for development!\n');
