'use server';

import { getDocumentProxy, extractText } from 'unpdf';
import { parseRosterText } from '@/lib/parser';
import { RosterData, DutyEvent, DutyType } from '@/lib/types';
import { supabase } from '@/lib/utils/supabase';
// Server-side tracking would normally go here
// import { trackServerEvent } from '@/lib/analytics/server';

export async function parseRoster(formData: FormData): Promise<RosterData> {
  const file = formData.get('file') as File;
  const userId = formData.get('userId') as string;
  
  if (!file) throw new Error('No file uploaded');

  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);
  
  try {
    const pdf = await getDocumentProxy(buffer);
    const { text } = await extractText(pdf, { mergePages: true });
    
    const parsed = parseRosterText(text);
    
    // Map ParsedRoster to RosterData (legacy support)
    const events: DutyEvent[] = parsed.duties.map(d => ({
      id: d.id,
      type: d.type as DutyType,
      date: d.date,
      flightNumber: d.flight?.flightNumber,
      depPort: d.flight?.depPort,
      arrPort: d.flight?.arrPort,
      std: d.flight?.std,
      sta: d.flight?.sta,
      signOn: d.signOn || d.flight?.signOn,
      signOff: d.signOff || d.flight?.signOff,
      hotel: d.flight?.hotel,
      description: d.description,
    }));

    // Verification Logic: Set verified_at and airline if userId is provided
    if (userId) {
      await supabase
        .from('profiles')
        .update({ 
          verified_at: new Date().toISOString(),
          airline: parsed.airline 
        })
        .eq('id', userId);
    }

    return {
      events,
      month: parsed.month,
      year: parsed.year,
      crewName: parsed.crewName,
    };
  } catch (err) {
    console.error('PDF Parse Error:', err);
    throw new Error(err instanceof Error ? err.message : 'Could not read PDF roster.');
  }
}
