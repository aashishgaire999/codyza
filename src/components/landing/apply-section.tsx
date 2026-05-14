"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Sparkles, ArrowRight, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

const schema = z.object({
  name: z.string().min(2, "Name too short"),
  email: z.string().email("Invalid email"),
  github: z.string().min(2, "GitHub username required"),
  skills: z.string().min(3, "Add at least one skill"),
  role: z.string().min(1, "Select a role"),
  level: z.string().min(1, "Select your level"),
  why: z.string().min(20, "Tell us a bit more (20+ chars)"),
})

type FormData = z.infer<typeof schema>

export function ApplySection() {
  const [submitted, setSubmitted] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    try {
      await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
    } catch (e) {
      console.error(e)
    }
    setSubmitted(true)
  }

  return (
    <section id="apply" className="relative scroll-mt-32 border-t border-white/[0.04] bg-[#050508] py-32">
      <div className="mx-auto max-w-3xl px-6 md:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }} className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-zinc-400">
            <Sparkles className="h-3 w-3 text-[#8b5cf6]" />
            Apply To Join
          </div>
          <h2 className="font-[family-name:var(--font-heading)] text-4xl font-bold tracking-tight text-white md:text-5xl">
            Ready to <span className="text-gradient-codyza">build with us?</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-zinc-400">
            Applications take ~3 minutes. We review every one within 48 hours.
          </p>
        </motion.div>
        {submitted ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-[#22c55e]/20 bg-[#22c55e]/5 p-10 text-center backdrop-blur-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#22c55e]/10">
              <Check className="h-6 w-6 text-[#22c55e]" />
            </div>
            <h3 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-white">Application received</h3>
            <p className="mt-2 text-sm text-zinc-400">We will reach out within 48 hours. Check your inbox.</p>
          </motion.div>
        ) : (
          <motion.form initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }} onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-sm">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Ada Lovelace" {...register("name")} />
                {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
                {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="github">GitHub Username</Label>
                <Input id="github" placeholder="aashishgaire999" {...register("github")} />
                {errors.github && <p className="text-xs text-red-400">{errors.github.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="skills">Top Skills</Label>
                <Input id="skills" placeholder="React, Python, Postgres" {...register("skills")} />
                {errors.skills && <p className="text-xs text-red-400">{errors.skills.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="role">Role Interest</Label>
                <select id="role" {...register("role")} className="flex h-10 w-full rounded-md border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white">
                  <option value="">Select role</option>
                  <option value="frontend">Frontend Engineer</option>
                  <option value="backend">Backend Engineer</option>
                  <option value="fullstack">Fullstack Engineer</option>
                  <option value="ai">AI / ML Engineer</option>
                  <option value="design">Product Designer</option>
                </select>
                {errors.role && <p className="text-xs text-red-400">{errors.role.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">Experience Level</Label>
                <select id="level" {...register("level")} className="flex h-10 w-full rounded-md border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white">
                  <option value="">Select level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                {errors.level && <p className="text-xs text-red-400">{errors.level.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="why">Why Codyza?</Label>
              <Textarea id="why" placeholder="What do you want to build, learn, or ship with us?" rows={4} {...register("why")} />
              {errors.why && <p className="text-xs text-red-400">{errors.why.message}</p>}
            </div>
            <Button type="submit" size="lg" disabled={isSubmitting} className="group h-12 w-full bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] text-base font-medium text-white hover:opacity-90">
              {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>) : (<>Submit Application <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></>)}
            </Button>
          </motion.form>
        )}
      </div>
    </section>
  )
}
