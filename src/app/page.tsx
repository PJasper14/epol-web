import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="container relative min-h-screen flex items-center justify-center">
      <div className="flex flex-col md:flex-row w-full max-w-6xl mx-auto gap-8">
        {/* Logo and branding side */}
        <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-zinc-900 text-white p-12 rounded-lg">
          <div className="text-center">
            <div className="mb-8">
              <div className="h-36 w-36 rounded-full bg-white/10 flex items-center justify-center mx-auto">
                <span className="text-4xl font-bold">EPOL</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">Environmental Police</h1>
            <h2 className="text-xl">Cabuyao City</h2>
          </div>
        </div>

        {/* Login form side */}
        <div className="flex-1 flex flex-col justify-center p-6">
          <div className="mx-auto w-full max-w-md space-y-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold">LOGIN FORM</h1>
              <p className="text-gray-500 mt-2">
                Enter your credentials to access the dashboard
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>EPOL Admin Dashboard</CardTitle>
                <CardDescription>Sign in to your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" placeholder="username@example.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" required />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <Button asChild className="w-full">
                  <Link href="/dashboard">LOGIN</Link>
                </Button>
                <Button variant="link" className="text-sm">
                  Forgot Password?
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
