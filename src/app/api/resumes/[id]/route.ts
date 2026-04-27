import { NextResponse } from 'next/server'
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@/lib/supabase-auth-helpers"

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    
    if (!id) {
      return NextResponse.json({ error: 'Resume ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('resumes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id) // Ensure they only delete their own resume

    if (error) {
      console.error('Error deleting resume:', error)
      return NextResponse.json({ error: 'Failed to delete resume' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: unknown) {
    console.error('DELETE resume error:', error)
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
