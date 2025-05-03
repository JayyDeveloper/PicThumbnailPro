import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";

export default function AuthTest() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [username, setUsername] = useState('testuser');
  const [points, setPoints] = useState(0);
  const [response, setResponse] = useState('');
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [localStorageTokens, setLocalStorageTokens] = useState<{token?: string | null, authToken?: string | null}>({});

  // Function to test login with custom points
  const testPointsLogin = async () => {
    try {
      console.log(`Attempting test login with username: ${username} and points: ${points}`);
      
      const res = await fetch('/api/debug/login-with-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, points })
      });
      
      const data = await res.json();
      console.log('Login response:', data);
      setResponse(JSON.stringify(data, null, 2));
      
      // Set both tokens for consistency
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('authToken', data.token);
        
        toast({
          title: 'Test Login Successful',
          description: `Logged in as ${data.user.username} with ${data.user.points} points`,
        });
        
        // Check tokens after setting
        checkTokens();
        
        // Reload the page to refresh authentication state
        window.location.reload();
      }
    } catch (error) {
      console.error('Test login error:', error);
      toast({
        title: 'Test Login Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive'
      });
    }
  };
  
  // Function to check authentication status
  const checkAuth = async () => {
    try {
      // Check current tokens
      checkTokens();
      
      // Try to fetch user data
      const token = localStorage.getItem('token') || localStorage.getItem('authToken') || '';
      const res = await fetch('/api/user', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      if (res.ok) {
        const userData = await res.json();
        setAuthStatus({
          status: 'Authenticated',
          user: userData
        });
        console.log('Auth check success:', userData);
      } else {
        const errorData = await res.json();
        setAuthStatus({
          status: 'Unauthenticated',
          error: errorData
        });
        console.log('Auth check failed:', errorData);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setAuthStatus({
        status: 'Error',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  };
  
  // Function to check localStorage tokens
  const checkTokens = () => {
    const token = localStorage.getItem('token');
    const authToken = localStorage.getItem('authToken');
    
    setLocalStorageTokens({
      token,
      authToken
    });
    
    console.log('Local storage tokens:', {
      token: token ? 'exists' : 'missing',
      authToken: authToken ? 'exists' : 'missing'
    });
  };
  
  // Function to clear all tokens and logout
  const clearTokens = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    checkTokens();
    
    toast({
      title: 'Tokens Cleared',
      description: 'All authentication tokens have been removed',
    });
    
    // Reload to update auth state
    window.location.reload();
  };
  
  // Check tokens when component mounts
  useEffect(() => {
    checkTokens();
    checkAuth();
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Authentication Test</CardTitle>
        <CardDescription>
          Test user authentication and points system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Auth Status */}
        <div className="rounded-md p-3 bg-muted/50">
          <h3 className="text-sm font-medium mb-2 flex items-center">
            Authentication Status
            <Badge className="ml-2" variant={user ? "default" : "destructive"}>
              {user ? "Authenticated" : "Not Authenticated"}
            </Badge>
          </h3>
          
          {user ? (
            <div className="text-xs">
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Points:</strong> {user.points}</p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No user is currently authenticated</p>
          )}
          
          <div className="mt-2 text-xs">
            <p><strong>Token:</strong> {localStorageTokens.token ? "Present" : "Missing"}</p>
            <p><strong>AuthToken:</strong> {localStorageTokens.authToken ? "Present" : "Missing"}</p>
          </div>
          
          <div className="flex gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={checkAuth}>
              Refresh Status
            </Button>
            <Button variant="destructive" size="sm" onClick={clearTokens}>
              Clear Tokens
            </Button>
          </div>
        </div>
        
        <Separator />
        
        {/* Test Login Form */}
        <div>
          <h3 className="text-sm font-medium mb-3">Test Login with Custom Points</h3>
          
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input 
              id="username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
            />
          </div>
          
          <div className="space-y-2 mt-3">
            <Label htmlFor="points">Points</Label>
            <Input 
              id="points" 
              type="number" 
              min="0"
              value={points} 
              onChange={(e) => {
                const value = parseInt(e.target.value);
                setPoints(isNaN(value) ? 0 : value);
              }} 
            />
          </div>
          
          <Button 
            onClick={testPointsLogin}
            className="w-full mt-4"
          >
            Login with {points} Points
          </Button>
        </div>
        
        {response && (
          <div className="mt-4">
            <Label>Response</Label>
            <pre className="bg-muted p-2 rounded-md text-xs mt-1 overflow-auto max-h-32">
              {response}
            </pre>
          </div>
        )}
        
        {authStatus && (
          <div className="mt-4">
            <Label>Last Auth Check</Label>
            <pre className="bg-muted p-2 rounded-md text-xs mt-1 overflow-auto max-h-32">
              {JSON.stringify(authStatus, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}