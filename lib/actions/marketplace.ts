'use server';

import { supabase } from '@/lib/utils/supabase';
import { revalidatePath } from 'next/cache';

interface ReportData {
  listingId: string;
  reporterId: string;
  reason: string;
  details?: string;
}

export async function reportListing({ listingId, reporterId, reason, details }: ReportData) {
  try {
    // 1. Insert the report
    const { error: reportError } = await supabase
      .from('marketplace_reports')
      .insert({
        listing_id: listingId,
        reporter_id: reporterId,
        reason,
        details
      });

    if (reportError) throw reportError;

    // 2. Increment report count on the listing
    const { data: listing, error: fetchError } = await supabase
      .from('marketplace_listings')
      .select('reports_count')
      .eq('id', listingId)
      .single();

    if (fetchError) throw fetchError;

    const newCount = (listing.reports_count || 0) + 1;

    // 3. Update listing status if report count >= 3
    const updateData: { reports_count: number; status?: string } = { reports_count: newCount };
    if (newCount >= 3) {
      updateData.status = 'hidden';
    }

    const { error: updateError } = await supabase
      .from('marketplace_listings')
      .update(updateData)
      .eq('id', listingId);

    if (updateError) throw updateError;

    revalidatePath('/marketplace');
    return { success: true };
  } catch (err) {
    console.error('Error reporting listing:', err);
    throw new Error('Failed to submit report');
  }
}
