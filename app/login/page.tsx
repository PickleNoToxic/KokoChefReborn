import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">KokoChef</h1>
          <p className="text-muted-foreground">Temukan dan bagikan resep-resep menarik</p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
