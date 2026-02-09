import { Suspense } from "react"
import { Navigation } from "@/components/ui/navigation"
import { VerifyForm } from "@/components/auth/verify-form"

export default function VerifyPage() {
    return (
        <div className="min-h-screen">
            <Navigation />
            <main className="pt-16">
                <Suspense fallback={<div className="flex justify-center p-8">Loading...</div>}>
                    <VerifyForm />
                </Suspense>
            </main>
        </div>
    )
}
