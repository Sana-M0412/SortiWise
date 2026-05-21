import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export let supabase = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.warn("Supabase failed to initialize:", error);
  }
} else {
  console.warn("Supabase credentials missing. Running in local-first Guest Mode.");
}

// Helpers for syncing data from localStorage to Supabase once logged in
export async function syncLogsToSupabase(localLogs, userId) {
  if (!supabase || !userId) return [];
  const logsToInsert = localLogs.map(log => ({
    user_id: userId,
    item_name: log.itemName,
    category: log.category,
    confidence: log.confidence,
    carbon_footprint_kg: log.carbonFootprintKg,
    disposal_instructions: log.disposalInstructions,
    reuse_ideas: log.reuseIdeas,
    alternatives: log.alternatives,
    environmental_reasoning: log.environmentalReasoning,
    sustainability_score: log.sustainabilityScore,
    image_url: log.imageUrl || null,
    created_at: log.created_at || new Date().toISOString()
  }));

  const { data, error } = await supabase
    .from('waste_logs')
    .insert(logsToInsert)
    .select();

  if (error) {
    console.error("Sync error:", error);
    return [];
  }
  return data;
}

export async function fetchUserStats(userId) {
  if (!supabase || !userId) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error("Fetch stats error:", error);
    return null;
  }
  return data;
}

export async function updateUserStats(userId, statsUpdate) {
  if (!supabase || !userId) return false;
  const { error } = await supabase
    .from('profiles')
    .update(statsUpdate)
    .eq('id', userId);

  if (error) {
    console.error("Update stats error:", error);
    return false;
  }
  return true;
}
