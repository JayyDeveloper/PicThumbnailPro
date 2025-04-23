import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, History, Plus, Image, LogOut, Edit } from "lucide-react";
import { Link } from "wouter";

export default function AccountPage() {
  const [_, setLocation] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("thumbnails");

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      setLocation("/auth");
    }
  }, [user, setLocation]);

  // Fetch user's thumbnails
  const { data: thumbnails = [], isLoading: thumbnailsLoading } = useQuery({
    queryKey: ["/api/user/thumbnails"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/user/thumbnails");
      return await res.json();
    },
    enabled: !!user,
  });

  // Fetch user's transactions
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/transactions"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/transactions");
      return await res.json();
    },
    enabled: !!user,
  });

  const handleLogout = () => {
    logoutMutation.mutate();
    setLocation("/");
  };

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">My Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Username</h3>
                <p className="mt-1 text-base font-medium">{user.username}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="mt-1 text-base font-medium">{user.email}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Available Points</h3>
                <div className="mt-1 flex items-center">
                  <Sparkles className="h-5 w-5 text-yellow-500 mr-1.5" />
                  <span className="text-2xl font-bold">{user.points}</span>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                  <Link href="/pricing">
                    <Plus className="h-4 w-4 mr-1" />
                    Get More Points
                  </Link>
                </Button>
              </div>
              
              <Separator />
              
              <Button 
                variant="ghost" 
                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-4 w-4 mr-2" />
                {logoutMutation.isPending ? "Logging out..." : "Log Out"}
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content */}
        <div className="col-span-1 md:col-span-3">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold mb-4">Account Dashboard</h2>
              <Tabs defaultValue="thumbnails" value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="thumbnails">My Thumbnails</TabsTrigger>
                  <TabsTrigger value="transactions">Transaction History</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              {activeTab === "thumbnails" && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Your Created Thumbnails</h3>
                    <Button asChild>
                      <Link href="/editor">
                        <Plus className="h-4 w-4 mr-1" />
                        Create New
                      </Link>
                    </Button>
                  </div>
                  
                  {thumbnailsLoading ? (
                    <div className="py-10 text-center">Loading thumbnails...</div>
                  ) : thumbnails.length === 0 ? (
                    <div className="py-10 text-center">
                      <Image className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium">No thumbnails yet</h3>
                      <p className="text-gray-500 mt-2">Create your first thumbnail to see it here.</p>
                      <Button className="mt-4" asChild>
                        <Link href="/editor">
                          <Plus className="h-4 w-4 mr-1" />
                          Create Thumbnail
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {thumbnails.map((thumbnail: any) => (
                        <Card key={thumbnail.id} className="overflow-hidden group">
                          <div className="aspect-video relative overflow-hidden">
                            <img 
                              src={thumbnail.imageUrl} 
                              alt={thumbnail.name} 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <Button size="sm" variant="secondary" className="mr-2" asChild>
                                <Link href={`/editor?id=${thumbnail.id}`}>
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Link>
                              </Button>
                            </div>
                          </div>
                          <CardContent className="p-3">
                            <h3 className="font-medium truncate">{thumbnail.name}</h3>
                            <p className="text-xs text-gray-500">
                              Created: {new Date(thumbnail.createdAt).toLocaleDateString()}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === "transactions" && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Point Transactions</h3>
                  </div>
                  
                  {transactionsLoading ? (
                    <div className="py-10 text-center">Loading transactions...</div>
                  ) : transactions.length === 0 ? (
                    <div className="py-10 text-center">
                      <History className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium">No transactions yet</h3>
                      <p className="text-gray-500 mt-2">Your point transactions will appear here.</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-2">
                        {transactions.map((transaction: any) => (
                          <Card key={transaction.id} className="p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">{transaction.description}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(transaction.createdAt).toLocaleString()}
                                </p>
                              </div>
                              <div className={`font-bold ${transaction.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {transaction.points > 0 ? '+' : ''}{transaction.points} points
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}