"use client"

import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SectionHeader } from "@/components/shared/section-header"
import { AnimatedWrapper } from "@/components/shared/animated-wrapper"
import type { PricingPlan } from "@/types"

const plans: PricingPlan[] = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for getting started and exploring the platform.",
    features: [
      "Up to 3 projects",
      "Basic analytics",
      "1 team member",
      "Community support",
      "1GB storage",
    ],
    cta: "Get Started",
  },
  {
    name: "Pro",
    price: "$29",
    description: "For growing teams that need more power and flexibility.",
    features: [
      "Unlimited projects",
      "Advanced analytics",
      "Up to 10 team members",
      "Priority support",
      "50GB storage",
      "Custom integrations",
      "API access",
    ],
    highlighted: true,
    cta: "Start Free Trial",
  },
  {
    name: "Enterprise",
    price: "$99",
    description: "For organizations that need enterprise-grade features.",
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "SSO & SAML",
      "Dedicated support",
      "Unlimited storage",
      "Custom contracts",
      "SLA guarantee",
      "On-premise option",
    ],
    cta: "Contact Sales",
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="bg-muted/40 py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <AnimatedWrapper>
          <SectionHeader
            title="Simple, Transparent Pricing"
            description="Choose the plan that fits your needs. Upgrade or downgrade at any time."
          />
        </AnimatedWrapper>

        <div className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <AnimatedWrapper key={plan.name} delay={index * 0.1}>
              <Card
                className={`relative flex h-full flex-col ${
                  plan.highlighted ? "border-primary shadow-lg" : ""
                }`}
              >
                {plan.highlighted && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <CardDescription className="mt-2 text-base">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <Check className="text-primary h-4 w-4 shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? "default" : "outline"}
                    asChild
                  >
                    <Link href="#">{plan.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            </AnimatedWrapper>
          ))}
        </div>
      </div>
    </section>
  )
}
