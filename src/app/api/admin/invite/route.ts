import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const { application_id, action } = await req.json()

    const { data: app, error } = await supabase
      .from("applications")
      .select("*")
      .eq("id", application_id)
      .single()

    if (error || !app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    if (action === "approve") {
      // Send Supabase invite
      const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(app.email)
      if (inviteError) {
        return NextResponse.json({ error: inviteError.message }, { status: 500 })
      }

      // Send acceptance email
      await resend.emails.send({
        from: "Codyza Team <team@codyza.com>",
        to: app.email,
        subject: "You're in! Welcome to Codyza 🎉",
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#0a0a12;color:#f1f5f9;border-radius:12px;">
            <h1 style="font-size:28px;font-weight:900;margin-bottom:8px;">Welcome to Codyza, ${app.name}!</h1>
            <p style="color:#94a3b8;margin-bottom:24px;">Your application has been approved. You're now part of the crew.</p>

            <div style="padding:20px;background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.3);border-radius:10px;margin-bottom:24px;">
              <p style="color:#a855f7;font-weight:700;margin-bottom:8px;">What happens next:</p>
              <ol style="color:#cbd5e1;padding-left:20px;line-height:2;">
                <li>Check your inbox for a separate invite link from Supabase</li>
                <li>Click it to set your password</li>
                <li>Complete onboarding to get your CZX contributor ID</li>
                <li>Access the member portal, submit projects, earn XP</li>
              </ol>
            </div>

            <div style="padding:16px;background:rgba(6,182,212,0.08);border:1px solid rgba(6,182,212,0.2);border-radius:10px;margin-bottom:24px;">
              <p style="color:#67e8f9;font-weight:600;margin-bottom:4px;">Slack Access</p>
              <p style="color:#94a3b8;font-size:14px;margin:0;">Once you complete onboarding, your Slack invite will arrive from team@codyza.com within 24 hours.</p>
            </div>

            <p style="color:#64748b;font-size:12px;margin-top:24px;">Questions? Reply to this email or reach us at team@codyza.com</p>
            <p style="color:#475569;font-size:12px;">— The Codyza Team</p>
          </div>
        `,
      })

      // Update application status
      await supabase
        .from("applications")
        .update({ status: "approved", reviewed_at: new Date().toISOString() })
        .eq("id", application_id)

      return NextResponse.json({ success: true, action: "approved" })
    }

    if (action === "decline") {
      // Send decline email
      await resend.emails.send({
        from: "Codyza Team <team@codyza.com>",
        to: app.email,
        subject: "Your Codyza Application",
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#0a0a12;color:#f1f5f9;border-radius:12px;">
            <h2 style="margin-bottom:8px;">Hi ${app.name},</h2>
            <p style="color:#94a3b8;line-height:1.7;margin-bottom:16px;">
              Thank you for applying to Codyza. After reviewing your application, we're not moving forward at this time.
            </p>
            <p style="color:#94a3b8;line-height:1.7;margin-bottom:16px;">
              We encourage you to keep building, contribute to open source, and apply again in the future. 
              We review every application personally and appreciate you taking the time.
            </p>
            <p style="color:#64748b;font-size:12px;margin-top:24px;">— The Codyza Team</p>
          </div>
        `,
      })

      await supabase
        .from("applications")
        .update({ status: "declined", reviewed_at: new Date().toISOString() })
        .eq("id", application_id)

      return NextResponse.json({ success: true, action: "declined" })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })

  } catch (error) {
    console.error("Invite error:", error)
    return NextResponse.json({ error: "Failed to process application" }, { status: 500 })
  }
}
