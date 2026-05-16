import { getSupabaseServer } from '@/lib/utils/supabase';
import { Flight, CrewStats, CrewProfile } from '@/lib/types/passport';
import { ACHIEVEMENT_CATALOG } from './definitions';

/**
 * Evaluates all achievement definitions against current stats and flight data.
 * Returns an array of newly earned achievement keys.
 */
export async function evaluateAchievements(crewId: string, currentStats: CrewStats, lastFlight?: Flight) {
  const supabase = getSupabaseServer();
  // 1. Fetch user profile for evaluation
  const { data: profile } = await supabase
    .from('crew_profiles')
    .select('*')
    .eq('id', crewId)
    .single();

  // 2. Fetch existing achievements to avoid duplicates
  const { data: existing } = await supabase
    .from('achievements')
    .select('key')
    .eq('crew_id', crewId);

  const existingKeys = new Set(existing?.map(a => a.key) || []);
  const newAchievements: { crew_id: string; key: string; flight_id: string | null; metadata: Record<string, string | number | boolean | null> }[] = [];

  // 3. Check every definition
  ACHIEVEMENT_CATALOG.forEach(def => {
    if (existingKeys.has(def.key)) return;

    const result = def.unlock(currentStats, lastFlight, profile as unknown as CrewProfile);
    const earned = typeof result === 'boolean' ? result : result.earned;
    const metadata = typeof result === 'boolean' ? {} : result.metadata;

    if (earned) {
      newAchievements.push({
        crew_id: crewId,
        key: def.key,
        flight_id: lastFlight?.id || null,
        metadata
      });
    }
  });

  // 4. Save new achievements to Supabase
  if (newAchievements.length > 0) {
    const { error } = await supabase
      .from('achievements')
      .insert(newAchievements);

    if (error) console.error('Failed to save achievements:', error);
  }

  return newAchievements.map(a => a.key);
}
