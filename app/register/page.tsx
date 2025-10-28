import { RegisterForm } from "@/components/auth/register-form"

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">RecipeHub</h1>
          <p className="text-muted-foreground">Discover and share amazing recipes</p>
        </div>
        <RegisterForm />
      </div>
    </main>
  )
}
