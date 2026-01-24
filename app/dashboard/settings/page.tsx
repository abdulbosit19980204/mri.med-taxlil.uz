"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Settings, User, Bell, Lock, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/context/language-context"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
    const { t } = useLanguage()

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] p-8 md:p-12 lg:p-16">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/dashboard">
                        <Button variant="outline" size="icon" className="rounded-full">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                            {t.dashboard.settings}
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">Manage your account and preferences</p>
                    </div>
                </div>

                {/* Settings Sections */}
                <div className="space-y-6">
                    <SettingCard
                        icon={<User className="h-6 w-6" />}
                        title="Profile Settings"
                        description="Update your personal information and profile picture"
                    />
                    <SettingCard
                        icon={<Bell className="h-6 w-6" />}
                        title="Notifications"
                        description="Configure email and push notification preferences"
                    />
                    <SettingCard
                        icon={<Lock className="h-6 w-6" />}
                        title="Security"
                        description="Manage password and two-factor authentication"
                    />
                    <SettingCard
                        icon={<Globe className="h-6 w-6" />}
                        title="Language & Region"
                        description="Set your preferred language and timezone"
                    />
                </div>
            </div>
        </div>
    )
}

function SettingCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <Card className="rounded-[32px] border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:shadow-xl transition-shadow cursor-pointer">
            <CardContent className="p-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            {icon}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{title}</h3>
                            <p className="text-sm text-slate-500">{description}</p>
                        </div>
                    </div>
                    <Button variant="outline" className="rounded-full">
                        Configure
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
