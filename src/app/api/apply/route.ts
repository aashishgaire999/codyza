import { Resend } from "resend"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const resend = new Resend(process.env.RESEND_API_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, github, skills, role, level, why } = body

    // Save to database
    await supabase.from("applications").insert({
      name,
      email,
      github,
      skills,
      role,
      level,
      why,
      status: "pending",
    })

    // Email notification to hiring
    await resend.emails.send({
      from: "Codyza Applications <noreply@codyza.com>",
      to: "hiring@codyza.com",
      subject: `New Application: ${name} — ${role}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0a0a12;color:#f1f5f9;border-radius:12px;">
          <h2 style="color:#a855f7;margin-bottom:20px;">New Codyza Application</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#94a3b8;width:120px;">Name</td><td style="padding:8px 0;font-weight:600;">${name}</td></tr>
            <tr><td style="padding:8px 0;color:#94a3b8;">Email</td><td style="padding:8px 0;">${email}</td></tr>
            <tr><td style="padding:8px 0;color:#94a3b8;">GitHub</td><td style="padding:8px 0;"><a href="https://github.com/${github}" style="color:#67e8f9;">@${github}</a></td></tr>
            <tr><td style="padding:8px 0;color:#94a3b8;">Role</td><td style="padding:8px 0;">${role}</td></tr>
            <tr><td style="padding:8px 0;color:#94a3b8;">Level</td><td style="padding:8px 0;">${level}</td></tr>
            <tr><td style="padding:8px 0;color:#94a3b8;">Skills</td><td style="padding:8px 0;">${skills}</td></tr>
          </table>
          <div style="margin-top:20px;padding:16px;background:rgba(255,255,255,0.05);border-radius:8px;border-left:3px solid #8b5cf6;">
            <p style="color:#94a3b8;margin-bottom:8px;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Why Codyza</p>
            <p style="margin:0;">${why}</p>
          </div>
          <p style="margin-top:20px;color:#64748b;font-size:12px;">Review this application in the <a href="https://codyza.com/admin" style="color:#a855f7;">Admin Dashboard</a></p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Apply error:", error)
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 })
  }
}
