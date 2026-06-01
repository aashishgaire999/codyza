"use client"

import { useState, useEffect, useRef, KeyboardEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Sparkles, ArrowRight, ArrowLeft, Check, Loader2, Mail, GitBranch as Github, X } from "lucide-react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { SITE_CONFIG } from "@/constants/site"

const schema = z.object({
  name: z.string().min(2, "Name too short"),
  email: z.string().email("Invalid email"),
  github: z.string().min(2, "GitHub username required"),
  skills: z.string().min(3, "Add at least one skill"),
  role: z.string().min(1, "Pick one"),
  level: z.string().min(1, "Pick one"),
  why: z.string().min(20, "Tell us a bit more (20+ chars)"),
})

type FormData = z.infer<typeof schema>

const ROLES = [
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "fullstack", label: "Fullstack" },
  { value: "ai", label: "AI / ML" },
  { value: "design", label: "Design" },
]

const LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
]

const EMAIL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "proton.me",
  "aol.com",
  "live.com",
]

const SKILL_SUGGESTIONS = [
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Python",
  "Node.js",
  "Go",
  "Rust",
  "Postgres",
  "Tailwind",
  "Figma",
  "AWS",
  "Docker",
  "GraphQL",
  "Vue",
]

const ROADMAP = [
  { num: "01", color: "#8b5cf6", title: "You write 5 honest answers", desc: "About 3 minutes total" },
  { num: "02", color: "#3b82f6", title: "A founder reads every one", desc: "Within 48 hours" },
  { num: "03", color: "#06b6d4", title: "You get a Codyza ID", desc: "Something like CZX-0042" },
  { num: "04", color: "#22c55e", title: "You join the next standup", desc: "Welcome to the crew" },
]

interface GhUser {
  login: string
  avatar_url: string
  name: string | null
  public_repos: number
}

export function ApplySection() {
  const [submitted, setSubmitted] = useState(false)
  const [step, setStep] = useState(0)
  const [showEnterHint, setShowEnterHint] = useState(false)
  const [showWhyHint, setShowWhyHint] = useState(false)
  const [ghUser, setGhUser] = useState<GhUser | null>(null)
  const [ghError, setGhError] = useState(false)
  const [ghLoading, setGhLoading] = useState(false)
  const [replyByDate, setReplyByDate] = useState<string>("")
  const [skillInput, setSkillInput] = useState("")
  const [emailDomainPicked, setEmailDomainPicked] = useState(false)
  const ghDebounceRef = useRef<NodeJS.Timeout | null>(null)
  const whyHintTimerRef = useRef<NodeJS.Timeout | null>(null)

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  })

  const STEPS = [
    { fields: ["name", "email"] as const },
    { fields: ["github"] as const },
    { fields: ["skills"] as const },
    { fields: ["role", "level"] as const },
    { fields: ["why"] as const },
  ]

  // Enter-hint timer — appears 3s after entering each step
  useEffect(() => {
    setShowEnterHint(false)
    const t = setTimeout(() => setShowEnterHint(true), 3000)
    return () => clearTimeout(t)
  }, [step])

  // Why-hint timer — appears after 5s of inactivity on step 4
  useEffect(() => {
    if (step !== 4) {
      setShowWhyHint(false)
      return
    }
    if (whyHintTimerRef.current) clearTimeout(whyHintTimerRef.current)
    whyHintTimerRef.current = setTimeout(() => setShowWhyHint(true), 5000)
    return () => {
      if (whyHintTimerRef.current) clearTimeout(whyHintTimerRef.current)
    }
  }, [step])

  // Reset email autocomplete-closed state when the user resumes typing
  const lastPickedEmailRef = useRef<string>("")

  // GitHub live lookup (debounced)
  const ghValue = watch("github")
  useEffect(() => {
    if (step !== 1) return
    if (!ghValue || ghValue.length < 2) {
      setGhUser(null)
      setGhError(false)
      return
    }
    if (ghDebounceRef.current) clearTimeout(ghDebounceRef.current)
    ghDebounceRef.current = setTimeout(async () => {
      setGhLoading(true)
      setGhError(false)
      try {
        const res = await fetch(`https://api.github.com/users/${encodeURIComponent(ghValue)}`)
        if (res.ok) {
          const data = await res.json()
          setGhUser(data)
          setGhError(false)
        } else {
          setGhUser(null)
          setGhError(true)
        }
      } catch {
        setGhUser(null)
        setGhError(true)
      } finally {
        setGhLoading(false)
      }
    }, 400)
    return () => {
      if (ghDebounceRef.current) clearTimeout(ghDebounceRef.current)
    }
  }, [ghValue, step])

  function calcReplyDate() {
    const d = new Date()
    d.setHours(d.getHours() + 48)
    const opts: Intl.DateTimeFormatOptions = { weekday: "long" }
    setReplyByDate(d.toLocaleDateString("en-US", opts))
  }

  const onSubmit = async (data: FormData) => {
    // Fire the email in the background - don't block the UI
    fetch("/api/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).catch((e) => console.error("Apply email failed:", e))
    calcReplyDate()
    setSubmitted(true)
  }

  async function nextStep() {
    const valid = await trigger(STEPS[step].fields as unknown as (keyof FormData)[])
    if (!valid) return
    if (step < STEPS.length - 1) setStep(step + 1)
  }

  function backStep() {
    if (step > 0) setStep(step - 1)
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter" && step < STEPS.length - 1) {
      const target = e.target as HTMLElement
      // Allow Enter inside textarea (only on last step where textarea exists)
      if (target.tagName === "TEXTAREA") return
      e.preventDefault()
      nextStep()
    }
  }

  const roleValue = watch("role")
  const levelValue = watch("level")
  const emailValue = watch("email") || ""
  const whyValue = watch("why") || ""

  // Email domain suggestions
  const emailAtIdx = emailValue.indexOf("@")
  const showEmailSuggestions =
    step === 0 &&
    emailAtIdx >= 0 &&
    emailAtIdx < emailValue.length &&
    !emailDomainPicked
  const emailLocalPart = emailAtIdx >= 0 ? emailValue.slice(0, emailAtIdx) : ""
  const emailDomainTyped = emailAtIdx >= 0 ? emailValue.slice(emailAtIdx + 1) : ""
  const filteredEmailDomains = EMAIL_DOMAINS.filter((d) =>
    d.startsWith(emailDomainTyped.toLowerCase())
  )

  useEffect(() => {
    if (emailDomainPicked && emailValue !== lastPickedEmailRef.current) {
      setEmailDomainPicked(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailValue])

  // Skills chips logic

  const skillsValue = watch("skills") || ""
  const skillsArray = skillsValue
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)

  function addSkill(skill: string) {
    const cleaned = skill.trim()
    if (!cleaned) return
    if (skillsArray.includes(cleaned)) return
    const next = [...skillsArray, cleaned].join(", ")
    setValue("skills", next, { shouldValidate: true })
    setSkillInput("")
  }

  function removeSkill(skill: string) {
    const next = skillsArray.filter((s) => s !== skill).join(", ")
    setValue("skills", next, { shouldValidate: true })
  }

  function toggleSkill(skill: string) {
    if (skillsArray.includes(skill)) removeSkill(skill)
    else addSkill(skill)
  }

  function handleSkillKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addSkill(skillInput)
    } else if (e.key === "Backspace" && skillInput === "" && skillsArray.length > 0) {
      removeSkill(skillsArray[skillsArray.length - 1])
    }
  }
  const showCharCount = step === 4 && whyValue.length >= 20

  return (
    <section
      id="apply"
      className="relative scroll-mt-32 border-t border-white/[0.04] bg-[#050508] py-20"
    >
      <div className="mx-auto max-w-6xl px-6 md:px-8">

        {/* HEADER */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-zinc-400">
            <Sparkles className="h-3 w-3 text-[#8b5cf6]" />
            Apply To Join
          </div>
          <h2 className="font-[family-name:var(--font-heading)] text-4xl font-bold tracking-tight text-white md:text-5xl">
            Ready to <span className="text-gradient-codyza">build with us?</span>
          </h2>
        </div>

        {submitted ? (
          <div className="mx-auto max-w-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="rounded-2xl border border-[#22c55e]/20 bg-[#22c55e]/[0.04] p-10 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#22c55e]/10"
              >
                <Check className="h-7 w-7 text-[#22c55e]" />
              </motion.div>
              <h3 className="font-[family-name:var(--font-heading)] text-3xl font-semibold text-white">
                You are in.
              </h3>
              <p className="mx-auto mt-3 max-w-md text-sm text-zinc-400">
                Your application is in front of us. Our team will review and get in touch with you.
              </p>
              {replyByDate && (
                <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
                  Expect a reply by <span className="text-zinc-300">{replyByDate}</span>.
                </p>
              )}
            </motion.div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[38%_1fr] lg:gap-12">

            {/* LEFT: Roadmap */}
            <div>
              <div className="lg:sticky lg:top-28">
                <div className="mb-3 text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-500">
                  What happens next
                </div>
                <h3 className="mb-6 text-xl font-semibold leading-tight text-white">
                  Apply once. We handle the rest.
                </h3>
                <div className="flex flex-col gap-4">
                  {ROADMAP.map((s, i) => {
                    const isActive = i === step
                    return (
                      <div
                        key={s.num}
                        className={`flex items-start gap-3 transition-opacity ${
                          isActive ? "opacity-100" : "opacity-60"
                        }`}
                      >
                        <div
                          className={`min-w-[26px] font-mono text-sm font-semibold transition-all ${
                            isActive ? "scale-110" : ""
                          }`}
                          style={{ color: s.color }}
                        >
                          {s.num}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{s.title}</div>
                          <div className="text-xs text-zinc-500">{s.desc}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-7 border-t border-white/[0.06] pt-5">
                  <div className="text-xs text-zinc-500">Got questions first?</div>
                  <div className="mt-1 flex items-center gap-2 text-sm text-blue-400">
                    <Mail className="h-3.5 w-3.5" />
                    {SITE_CONFIG.email}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Conversational form */}
            <div
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 md:p-8"
              onKeyDown={onKeyDown}
            >
              {/* Progress */}
              <div className="mb-7 flex items-center justify-between">
                <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                  Question {step + 1} / {STEPS.length}
                </div>
                <div className="flex gap-1.5">
                  {STEPS.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 w-6 rounded-full transition-colors duration-300 ${
                        i <= step ? "bg-[#8b5cf6]" : "bg-white/[0.08]"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    {/* STEP 0 — Name + Email */}
                    {step === 0 && (
                      <div>
                        <h4 className="mb-1 text-2xl font-semibold leading-tight text-white">
                          Who are you?
                        </h4>
                        <p className="mb-5 text-sm text-zinc-500">
                          Your name and email. We will not share or sell it.
                        </p>
                        <div className="space-y-3">
                          <Input placeholder="Your name" autoFocus {...register("name")} />
                          {errors.name && (
                            <p className="text-xs text-red-400">{errors.name.message}</p>
                          )}
                          <div className="relative">
                            <Input
                              type="email"
                              placeholder="you@example.com"
                              autoComplete="off"
                              {...register("email")}
                            />
                            {showEmailSuggestions && filteredEmailDomains.length > 0 && (
                              <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-md border border-white/[0.08] bg-[#0a0a0f] shadow-xl"
                              >
                                {filteredEmailDomains.map((d) => (
                                  <button
                                    key={d}
                                    type="button"
                                    onClick={() => {
                                      const fullEmail = `${emailLocalPart}@${d}`
                                      lastPickedEmailRef.current = fullEmail
                                      setValue("email", fullEmail, {
                                        shouldValidate: true,
                                      })
                                      setEmailDomainPicked(true)
                                    }}
                                    className="flex w-full items-center px-3 py-2 text-left text-sm text-zinc-300 transition-colors hover:bg-white/[0.04] hover:text-white"
                                  >
                                    <span className="text-zinc-500">{emailLocalPart}@</span>
                                    <span>{d}</span>
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </div>
                          {errors.email && (
                            <p className="text-xs text-red-400">{errors.email.message}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* STEP 1 — GitHub */}
                    {step === 1 && (
                      <div>
                        <h4 className="mb-1 text-2xl font-semibold leading-tight text-white">
                          Where do you build?
                        </h4>
                        <p className="mb-5 text-sm text-zinc-500">
                          Just your GitHub username.
                        </p>
                        <div className="relative">
                          <Input
                            placeholder="aashishgaire999"
                            autoFocus
                            {...register("github")}
                          />
                          {ghLoading && (
                            <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-zinc-500" />
                          )}
                        </div>
                        {errors.github && (
                          <p className="mt-2 text-xs text-red-400">{errors.github.message}</p>
                        )}

                        {/* GitHub preview */}
                        <AnimatePresence>
                          {ghUser && !ghLoading && (
                            <motion.div
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 8 }}
                              className="mt-4 flex items-center gap-3 rounded-xl border border-[#22c55e]/20 bg-[#22c55e]/[0.04] p-3"
                            >
                              <Image
                                src={ghUser.avatar_url}
                                alt={ghUser.login}
                                width={44}
                                height={44}
                                className="rounded-full"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 text-sm font-medium text-white truncate">
                                  <Github className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0" />
                                  <span className="truncate">{ghUser.name || ghUser.login}</span>
                                </div>
                                <div className="text-xs text-zinc-500">
                                  @{ghUser.login} &middot; {ghUser.public_repos} repos
                                </div>
                              </div>
                              <Check className="h-4 w-4 text-[#22c55e] flex-shrink-0" />
                            </motion.div>
                          )}
                          {ghError && ghValue && ghValue.length >= 2 && !ghLoading && (
                            <motion.div
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 8 }}
                              className="mt-3 flex items-center gap-2 text-xs text-zinc-500"
                            >
                              <X className="h-3 w-3 text-zinc-500" />
                              No GitHub user with that username. Double-check?
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* STEP 2 — Skills (chip UI) */}
                    {step === 2 && (
                      <div>
                        <h4 className="mb-1 text-2xl font-semibold leading-tight text-white">
                          What are you good at?
                        </h4>
                        <p className="mb-5 text-sm text-zinc-500">
                          Pick from common ones or type your own. Press Enter or comma to add.
                        </p>

                        {/* Hidden input — keeps react-hook-form registration working */}
                        <input type="hidden" {...register("skills")} />

                        {/* Selected chips + input */}
                        <div className="flex flex-wrap items-center gap-2 rounded-md border border-white/[0.08] bg-white/[0.02] p-2.5">
                          {skillsArray.map((s) => (
                            <span
                              key={s}
                              className="inline-flex items-center gap-1.5 rounded-full border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 px-2.5 py-1 text-xs text-white"
                            >
                              {s}
                              <button
                                type="button"
                                onClick={() => removeSkill(s)}
                                className="text-zinc-400 transition-colors hover:text-white"
                                aria-label={`Remove ${s}`}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                          <input
                            type="text"
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyDown={handleSkillKeyDown}
                            placeholder={
                              skillsArray.length === 0
                                ? "Type a skill, press Enter…"
                                : "Add another…"
                            }
                            autoFocus
                            className="flex-1 min-w-[120px] bg-transparent text-sm text-white placeholder:text-zinc-600 focus:outline-none"
                          />
                        </div>
                        {errors.skills && (
                          <p className="mt-2 text-xs text-red-400">{errors.skills.message}</p>
                        )}

                        {/* Suggestions */}
                        <div className="mt-4">
                          <div className="mb-2 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                            Suggestions
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {SKILL_SUGGESTIONS.map((s) => {
                              const isSelected = skillsArray.includes(s)
                              return (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => toggleSkill(s)}
                                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs transition-colors ${
                                    isSelected
                                      ? "border-[#8b5cf6]/40 bg-[#8b5cf6]/15 text-white"
                                      : "border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:text-white"
                                  }`}
                                >
                                  {s}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 3 — Role + Level */}
                    {step === 3 && (
                      <div>
                        <h4 className="mb-1 text-2xl font-semibold leading-tight text-white">
                          Where would you fit in?
                        </h4>
                        <p className="mb-5 text-sm text-zinc-500">
                          Pick one area, and where you are at.
                        </p>
                        <div className="mb-2 text-xs text-zinc-400">Role interest</div>
                        <div className="mb-5 flex flex-wrap gap-2">
                          {ROLES.map((r) => (
                            <label key={r.value} className="cursor-pointer">
                              <input
                                type="radio"
                                value={r.value}
                                {...register("role")}
                                className="peer sr-only"
                              />
                              <span
                                className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
                                  roleValue === r.value
                                    ? "border-[#8b5cf6] bg-[#8b5cf6]/15 text-white"
                                    : "border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:text-white"
                                }`}
                              >
                                {r.label}
                              </span>
                            </label>
                          ))}
                        </div>
                        {errors.role && (
                          <p className="mb-3 text-xs text-red-400">{errors.role.message}</p>
                        )}
                        <div className="mb-2 text-xs text-zinc-400">Experience level</div>
                        <div className="flex flex-wrap gap-2">
                          {LEVELS.map((l) => (
                            <label key={l.value} className="cursor-pointer">
                              <input
                                type="radio"
                                value={l.value}
                                {...register("level")}
                                className="peer sr-only"
                              />
                              <span
                                className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
                                  levelValue === l.value
                                    ? "border-[#3b82f6] bg-[#3b82f6]/15 text-white"
                                    : "border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:text-white"
                                }`}
                              >
                                {l.label}
                              </span>
                            </label>
                          ))}
                        </div>
                        {errors.level && (
                          <p className="mt-2 text-xs text-red-400">{errors.level.message}</p>
                        )}
                      </div>
                    )}

                    {/* STEP 4 — Why */}
                    {step === 4 && (
                      <div>
                        <div className="mb-1 text-xs uppercase tracking-widest text-[#8b5cf6]">
                          This one matters most.
                        </div>
                        <h4 className="mb-1 text-2xl font-semibold leading-tight text-white">
                          Why Codyza?
                        </h4>
                        <p className="mb-5 text-sm text-zinc-500">
                          We read every word. Honest beats polished.
                        </p>
                        <div
                          className={`rounded-md border transition-colors ${
                            whyValue.length >= 20
                              ? "border-[#8b5cf6]/30"
                              : "border-white/[0.08]"
                          }`}
                        >
                          <Textarea
                            placeholder="What do you want to build, learn, or ship?"
                            rows={6}
                            autoFocus
                            className="border-0 focus-visible:ring-0"
                            {...register("why")}
                          />
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[11px]">
                          <AnimatePresence>
                            {showWhyHint && whyValue.length < 20 && (
                              <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-zinc-600"
                              >
                                Tell us what you want to build, learn, or just why you are here.
                              </motion.span>
                            )}
                          </AnimatePresence>
                          {showCharCount && (
                            <span className="ml-auto font-mono text-zinc-500">
                              {whyValue.length} chars
                            </span>
                          )}
                        </div>
                        {errors.why && (
                          <p className="mt-2 text-xs text-red-400">{errors.why.message}</p>
                        )}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* NAV */}
                <div className="mt-7 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={backStep}
                    disabled={step === 0}
                    className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.02] px-3.5 py-2 text-xs text-zinc-400 transition-colors hover:text-white disabled:opacity-30"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back
                  </button>
                  {step < STEPS.length - 1 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="group inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] px-5 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
                    >
                      Next
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] px-5 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Sending
                        </>
                      ) : (
                        <>
                          Submit application
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </>
                      )}
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {showEnterHint && step < STEPS.length - 1 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="mt-3 text-[11px] text-zinc-600"
                    >
                      Press Enter to continue
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
