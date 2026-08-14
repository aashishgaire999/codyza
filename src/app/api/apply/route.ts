import { Resend } from "resend"
import { NextResponse } from "next/server"
import { z } from "zod"
import { consumeRateLimit } from "@/lib/security"
import { createServiceSupabase } from "@/lib/admin-auth"

const resend = new Resend(process.env.RESEND_API_KEY)

const applicationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  github: z.string().trim().min(2).max(80).regex(/^[a-zA-Z0-9-]+$/),
  skills: z.string().trim().min(3).max(500),
  role: z.enum(["frontend", "backend", "fullstack", "ai", "design"]),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  why: z.string().trim().min(20).max(5000),
})

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

export async function POST(req: Request) {
  try {
    const rateLimit = consumeRateLimit(req, "public-application", 5, 60 * 60 * 1000)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many applications from this connection. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } },
      )
    }
    const parsed = applicationSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: "Please check your answers and try again." }, { status: 400 })
    }
    const { name, email, github, skills, role, level, why } = parsed.data

    // Save to database
    const { error: insertError } = await createServiceSupabase().from("applications").insert({
      name,
      email,
      github,
      skills,
      role,
      level,
      why,
      status: "pending",
    })
    if (insertError) {
      console.error("Application database insert failed:", insertError.message)
      return NextResponse.json({ error: "We could not save your application. Please try again." }, { status: 503 })
    }

    const safe = {
      name: escapeHtml(name),
      email: escapeHtml(email),
      github: escapeHtml(github),
      skills: escapeHtml(skills),
      role: escapeHtml(role),
      level: escapeHtml(level),
      why: escapeHtml(why),
    }

    // Email notification to hiring
    const { error: emailError } = await resend.emails.send({
      from: "Codyza Applications <noreply@codyza.com>",
      to: "hiring@codyza.com",
      subject: `New Application: ${safe.name} — ${safe.role}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0a0a12;color:#f1f5f9;border-radius:12px;">
          <h2 style="color:#a855f7;margin-bottom:20px;">New Codyza Application</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#94a3b8;width:120px;">Name</td><td style="padding:8px 0;font-weight:600;">${safe.name}</td></tr>
            <tr><td style="padding:8px 0;color:#94a3b8;">Email</td><td style="padding:8px 0;">${safe.email}</td></tr>
            <tr><td style="padding:8px 0;color:#94a3b8;">GitHub</td><td style="padding:8px 0;"><a href="https://github.com/${safe.github}" style="color:#67e8f9;">@${safe.github}</a></td></tr>
            <tr><td style="padding:8px 0;color:#94a3b8;">Role</td><td style="padding:8px 0;">${safe.role}</td></tr>
            <tr><td style="padding:8px 0;color:#94a3b8;">Level</td><td style="padding:8px 0;">${safe.level}</td></tr>
            <tr><td style="padding:8px 0;color:#94a3b8;">Skills</td><td style="padding:8px 0;">${safe.skills}</td></tr>
          </table>
          <div style="margin-top:20px;padding:16px;background:rgba(255,255,255,0.05);border-radius:8px;border-left:3px solid #8b5cf6;">
            <p style="color:#94a3b8;margin-bottom:8px;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Why Codyza</p>
            <p style="margin:0;">${safe.why}</p>
          </div>
          <p style="margin-top:20px;color:#64748b;font-size:12px;">Review this application in the <a href="https://www.codyza.com/admin" style="color:#a855f7;">Admin Dashboard</a></p>
        </div>
      `,
    })

    if (emailError) {
      console.error("Application notification email failed:", emailError.message)
      // The application is safely stored. Do not tell the applicant it failed
      // just because the internal notification could not be delivered.
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Apply error:", error)
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 })
  }
}
