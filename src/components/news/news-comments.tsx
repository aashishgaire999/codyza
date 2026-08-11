"use client"

import { FormEvent, useEffect, useState } from "react"
import Link from "next/link"
import { MessageCircle, Send } from "lucide-react"
import { createClient } from "@/lib/supabase"

type Comment = { id: string; codyza_id: string; member_name: string; body: string; created_at: string }

export function NewsComments({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [signedIn, setSignedIn] = useState(false)
  const [body, setBody] = useState("")
  const [error, setError] = useState("")
  const [sending, setSending] = useState(false)

  useEffect(() => {
    void fetch(`/api/news/${slug}/comments`).then((response) => response.json()).then((data) => setComments(data.comments || []))
    void createClient().auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)))
  }, [slug])

  async function submit(event: FormEvent) {
    event.preventDefault()
    const comment = body.trim()
    if (!comment) return
    setSending(true)
    setError("")
    const { data: { session } } = await createClient().auth.getSession()
    if (!session) { setSignedIn(false); setSending(false); return }
    const response = await fetch(`/api/news/${slug}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ body: comment }),
    })
    const data = await response.json()
    if (!response.ok) setError(data.error || "Could not publish your comment")
    else { setComments((current) => [...current, data.comment]); setBody("") }
    setSending(false)
  }

  return (
    <section className="cz-news-comments" aria-labelledby="news-comments-title">
      <div className="flex items-center gap-3"><MessageCircle className="h-5 w-5" aria-hidden /><h2 id="news-comments-title">crew comments</h2><span>{comments.length}</span></div>
      {comments.length > 0 ? <div className="cz-comment-list">{comments.map((comment) => <article key={comment.id} className="cz-comment"><div><strong>{comment.member_name}</strong><span>{comment.codyza_id}</span><time dateTime={comment.created_at}>{new Date(comment.created_at).toLocaleDateString()}</time></div><p>{comment.body}</p></article>)}</div> : <p className="cz-body mt-6">No comments yet. Members can start the conversation.</p>}
      {signedIn ? (
        <form onSubmit={submit} className="cz-comment-form"><label htmlFor="news-comment">add to the conversation</label><textarea id="news-comment" value={body} onChange={(event) => setBody(event.target.value)} maxLength={1200} rows={4} placeholder="Share context, ask a useful question, or celebrate the work." /><div><span>{body.length}/1200</span><button type="submit" disabled={sending || !body.trim()}>{sending ? "publishing…" : "publish comment"}<Send className="h-4 w-4" aria-hidden /></button></div>{error && <p role="alert">{error}</p>}</form>
      ) : <div className="cz-comment-signin"><p>Comments are reserved for Codyza members.</p><Link href={`/login?next=/news/${slug}`}>sign in to comment</Link></div>}
    </section>
  )
}
