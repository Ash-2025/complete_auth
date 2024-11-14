import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card'
import { useMutation } from '@tanstack/react-query'
import { login, RegisterAccount } from '@/lib/api'
import { useNavigate } from 'react-router-dom'
import { ModeToggle } from './ModeToggle'

const registerSchema = z.object({
  username: z.string().min(8).max(12),
  email: z.string().email(),
  password: z.string().min(8).max(12),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(12),
})

export type RegisterFormValues = z.infer<typeof registerSchema>
export type LoginFormValues = z.infer<typeof loginSchema>

export default function AuthComponent() {
  const [activeTab, setActiveTab] = useState<'register' | 'login'>('register')


  const navigate = useNavigate();


  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  })
  const {
    mutate:CreateAccount,
    isPending:isRegisterPending,
    isError:isRegisterError,
    error:RegisterError
  } = useMutation({
    mutationFn:RegisterAccount , 
    onSuccess: () => {
      navigate("/" , {replace:true})
    }
  })
  const onRegisterSubmit = (data: RegisterFormValues) => {
    CreateAccount(data)
  }
  const RegisterKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      registerForm.handleSubmit(onRegisterSubmit)();
    }
  }

  // we are going to call our mutation hook here and logic for login function will be written in a different file
  const {
    mutate: SignIn,
    isPending: isLoginPending,
    isError: isLoginError
  } = useMutation({
    mutationFn: login,
    onSuccess: () => {
      navigate("/", { replace: true })
    }
  })
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })
  const onLoginSubmit = (data: LoginFormValues) => {
    SignIn(data)
  }


  //this will be used to call the login func when user presses the Enter key
  const LoginKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      loginForm.handleSubmit(onLoginSubmit)();
    }
  };
  return (
    <div className='h-screen w-screen flex items-center justify-center relative'>
      <div className='absolute top-2 right-2'>
        <ModeToggle />
      </div>
      <Card className="w-[350px] h-[auto]">
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} className="h-auto p-6 rounded-md" onValueChange={(value) => setActiveTab(value as 'register' | 'login')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="register">Register</TabsTrigger>
              <TabsTrigger value="login">Login</TabsTrigger>
            </TabsList>
            <TabsContent value="register" className="h-auto">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} onKeyDown={RegisterKeyDown} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isRegisterPending}>
                    {
                      isRegisterPending ? 'Signing In...' : 'Sign In'
                    }
                  </Button>
                    {
                      isRegisterError && (
                        <p className='text-lg text-red-600'>
                          An Error Occured!
                          {RegisterError.message}
                        </p>
                      )
                    }
                </form>
              </Form>
            </TabsContent>
            <TabsContent value="login" className="h-auto">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} onKeyDown={LoginKeyDown} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter password"
                            {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoginPending}>
                    {isLoginPending ? "Logging in..." : "Login"}
                  </Button>
                  {
                    isLoginError && (
                      <p className='text-lg text-red-600'>
                        Invalid Email or Password!
                      </p>
                    )
                  }
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            className='hover:underline'
            variant="default"
            onClick={() => setActiveTab(activeTab === 'register' ? 'login' : 'register')}
          >
            {activeTab === 'register'
              ? "Already have an account? Sign in"
              : "Don't have an account? Register"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}