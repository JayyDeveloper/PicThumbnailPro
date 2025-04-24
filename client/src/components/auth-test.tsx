import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function AuthTest() {
  const { toast } = useToast();
  const [username, setUsername] = useState('testuser');
  const [points, setPoints] = useState(0);
  const [response, setResponse] = useState('');

  // Function to test login with zero points
  const testZeroPointsLogin = async () => {
    try {
      const res = await fetch('/api/debug/login-with-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, points })
      });
      
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
      
      // Set both tokens for consistency
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('authToken', data.token);
        
        toast({
          title: 'Test Login Successful',
          description: `Logged in as ${data.user.username} with ${data.user.points} points`,
        });
        
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

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Authentication Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input 
            id="username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="points">Points</Label>
          <Input 
            id="points" 
            type="number" 
            value={points} 
            onChange={(e) => setPoints(parseInt(e.target.value))} 
          />
        </div>
        
        <Button 
          onClick={testZeroPointsLogin}
          className="w-full"
        >
          Test Login with {points} Points
        </Button>
        
        {response && (
          <div className="mt-4">
            <Label>Response</Label>
            <pre className="bg-muted p-2 rounded-md text-xs mt-1 overflow-auto max-h-32">
              {response}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}