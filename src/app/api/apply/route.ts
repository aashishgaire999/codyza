import { Resend } from "resend"
import { NextResponse } from "next/server"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, github, skills, role, level, why } = body

    await resend.emails.send({
      from: "Codyza Applications <onboarding@resend.dev>",
      to: "aashishgaire042@gmail.com",
      subject: `New Application: ${name} — ${role}`,
      html: `
        <h2>New Codyza Application</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>GitHub:</strong> <a href="https://github.com/${github}">@${github}</a></p>
        <p><strong>Skills:</strong> ${skills}</p>
        <p><strong>Role:</strong> ${role}</p>
        <p><strong>Level:</strong> ${level}</p>
        <p><strong>Why Codyza:</strong></p>
        <p>${why}</p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Email error:", error)
    return NextResponse.json({ error: "Failed to send" }, { status: 500 })
  }
}
