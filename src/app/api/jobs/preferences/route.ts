import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { prompt } = await req.json()
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // In a real flow, you would pass `prompt` to `ai-service/app/main.py`
    // which decomposes it into JSON and drops it into the Redis Queue.
    // For now, we simulate the database update and background trigger.
    
    // Simulate network delay for the AI breakdown integration
    await new Promise(r => setTimeout(r, 1000));

    // Optional: Log it in user's profile table or an analysis table
    console.log(`[AI-Scraper Trigger] User ${user.id} requested: ${prompt}`)

    return NextResponse.json({ success: true, message: 'Preferences updated and sent to scraper queue.' })
  } catch (error: any) {
    console.error('Job preferences error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
