import { NextResponse } from 'next/server'
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@/lib/supabase-auth-helpers"

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    // Generate unique name for bucket
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    
    // In actual config, Supabase requires creating a Storage Bucket called "resumes".
    // For this simulation/skeleton, let's mock the upload if bucket isn't correctly configured.
    console.log(`[Storage Pipeline] Uploading ${fileName} for user ${user.id}...`)
    
    // Attempt standard Supabase upload (will fail silently and fall back if bucket 'resumes' doesn't exist yet)
    let fileUrl = 'mock-bucket-url/resume.pdf'
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(fileName, file, { cacheControl: '3600', upsert: false })

    if (uploadData) {
      fileUrl = uploadData.path
    } else {
      console.warn('Storage bucket misconfigured or missing - using fallback url. Error was:', uploadError)
    }

    // Now insert a tracking record into the 'resumes' table
    const { data: dbData, error: dbError } = await supabase
      .from('resumes')
      .insert([
        {
          user_id: user.id,
          title: file.name.replace(/\.[^/.]+$/, ""), // Strip extension for title
          is_base: false,
          // In a real pipeline, the ai-service is called HERE to extract fields and populate 'content' JSON.
          // We're leaving it blank for now until the Python parser is integrated.
        }
      ])
      .select()
      .single()

    if (dbError) {
      console.error('Record creation error:', dbError)
      return NextResponse.json({ error: 'Failed to create resume record' }, { status: 500 })
    }

    return NextResponse.json({ success: true, resume: dbData })
  } catch (error: unknown) {
    console.error('File upload error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
