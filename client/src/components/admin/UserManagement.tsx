import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, User as UserIcon, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { User } from '@shared/schema';
import { getInitials } from '@/lib/utils';

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest('GET', '/api/admin/users');
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeRole = async (userId: number, newRole: string) => {
    try {
      await apiRequest('PATCH', `/api/admin/users/${userId}/role`, { role: newRole });
      
      // Update the local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      toast({
        title: 'Success',
        description: `User role updated to ${newRole}.`,
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user role. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'user':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center">
          <Users className="mr-2 h-5 w-5 text-primary-600 dark:text-primary-400" />
          User Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4 dark:text-white">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-4 text-neutral-500 dark:text-neutral-400">No users found</div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium dark:text-white">{user.name}</div>
                    <div className="text-sm text-neutral-500 dark:text-neutral-400">{user.email}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant={getRoleBadgeVariant(user.role) as any}>
                    {user.role}
                  </Badge>
                  <div>
                    {user.role === 'admin' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleChangeRole(user.id, 'user')}
                        className="flex items-center"
                      >
                        <ArrowDownCircle className="mr-1 h-4 w-4" />
                        Make User
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleChangeRole(user.id, 'admin')}
                        className="flex items-center"
                      >
                        <ArrowUpCircle className="mr-1 h-4 w-4" />
                        Make Admin
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}