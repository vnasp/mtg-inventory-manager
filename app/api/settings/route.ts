import { NextResponse } from 'next/server';
import { createClient as createSupabase } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(req: Request) {
  try {
    const supabase = createSupabase(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'fx_usdclp')
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const record = data as any;
    if (!record || record.value == null) {
      return NextResponse.json(
        { error: 'FX rate not configured in settings' },
        { status: 404 }
      );
    }

    let rate: number;
    try {
      if (typeof record.value === 'object') {
        rate = Number(record.value.rate);
      } else {
        const parsed = JSON.parse(String(record.value));
        rate = Number(parsed.rate);
      }

      if (isNaN(rate)) {
        throw new Error('Invalid rate value');
      }
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid FX rate format in settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({ rate });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: (error as any)?.message ?? String(error) },
      { status: 500 }
    );
  }
}
