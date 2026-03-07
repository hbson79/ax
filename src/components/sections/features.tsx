"use client"

import { BarChart3, Zap, Shield, Users, Globe, Puzzle } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { SectionHeader } from "@/components/shared/section-header"
import { AnimatedWrapper } from "@/components/shared/animated-wrapper"

const features = [
  {
    title: "Powerful Analytics",
    description:
      "Track key metrics and gain actionable insights with real-time dashboards and custom reports.",
    icon: BarChart3,
  },
  {
    title: "Lightning Fast",
    description:
      "Optimized for speed with edge computing and smart caching. Your users will notice the difference.",
    icon: Zap,
  },
  {
    title: "Enterprise Security",
    description:
      "SOC 2 compliant with end-to-end encryption, SSO, and role-based access control built in.",
    icon: Shield,
  },
  {
    title: "Team Collaboration",
    description:
      "Real-time collaboration tools, shared workspaces, and granular permissions for your entire team.",
    icon: Users,
  },
  {
    title: "Global Scale",
    description:
      "Deploy to 30+ regions worldwide. Auto-scaling infrastructure handles any traffic spike.",
    icon: Globe,
  },
  {
    title: "Seamless Integrations",
    description:
      "Connect with 100+ tools you already use. Slack, GitHub, Jira, and more with one-click setup.",
    icon: Puzzle,
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <AnimatedWrapper>
          <SectionHeader
            title="Everything You Need to Scale"
            description="A complete platform with powerful features designed to help your team work smarter and grow faster."
          />
        </AnimatedWrapper>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <AnimatedWrapper key={feature.title} delay={index * 0.1}>
              <Card className="group hover:border-primary/20 h-full transition-colors">
                <CardHeader>
                  <div className="bg-primary/10 text-primary mb-3 flex h-12 w-12 items-center justify-center rounded-lg">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </AnimatedWrapper>
          ))}
        </div>
      </div>
    </section>
  )
}
