"use client"

import { useLanguage } from "@/context/language-context"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"

export function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage()

    const labels = {
        en: "English",
        uz: "O'zbek",
        ru: "Русский"
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="group rounded-full bg-white/5 border border-white/10 hover:bg-white/10">
                    <Globe className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background/80 backdrop-blur-xl border-white/10">
                <DropdownMenuItem onClick={() => setLanguage('uz')} className={language === 'uz' ? 'bg-primary/10 text-primary' : ''}>
                    🇺🇿 O'zbekcha
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('ru')} className={language === 'ru' ? 'bg-primary/10 text-primary' : ''}>
                    🇷🇺 Русский
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('en')} className={language === 'en' ? 'bg-primary/10 text-primary' : ''}>
                    🇺🇸 English
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
