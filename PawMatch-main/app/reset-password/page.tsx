import { Suspense } from "react"
import { Navigation } from "@/components/ui/navigation"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen">
            <Navigation />
            <main className="pt-16">
                <Suspense fallback={<div className="flex justify-center p-8">Loading...</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </main>
        </div>
    )
}
