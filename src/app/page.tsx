import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md mx-auto">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="mb-6">
            <Image 
              src="/images/EPOL LOGO.jpg" 
              alt="EPOL Logo" 
              width={180} 
              height={180}
              className="object-contain"
              priority
            />
          </div>
        </div>

        <Card className="border-red-100 shadow-lg w-full">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-center">EPOL Admin</CardTitle>
            <CardDescription className="text-center">Sign in to your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                placeholder="username" 
                className="w-full" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="password" 
                className="w-full" 
                required 
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 px-6 pb-6">
            <Button asChild className="w-full bg-red-600 hover:bg-red-700 py-4">
              <Link href="/dashboard" className="flex items-center justify-center h-full">
                <span className="font-bold text-white">LOGIN</span>
              </Link>
            </Button>
            <Button variant="link" className="text-sm text-red-600 hover:text-red-800">
              Forgot Password?
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}