import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AuthLayout from '@/components/AuthLayout';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authApi.login({
        email: formData.email,
        password: formData.password
      });

      login(response.user, response.token);
      navigate('/events');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      description="Log in to your Gatherly account 🐧"
    >
      {error && (
        <Alert className="mb-4 bg-aurora-pink/10 border-aurora-pink/30">
          <AlertDescription className="text-ice-white">{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-ice-white">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
            className="bg-arctic-mid border-ice-dark/30 text-ice-white placeholder:text-ice-dark"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-ice-white">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
            className="bg-arctic-mid border-ice-dark/30 text-ice-white placeholder:text-ice-dark"
          />
        </div>

        <Button
          type="submit"
          className="w-full font-semibold"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Log In'}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-ice-gray">
        Don't have an account?{' '}
        <Link to="/signup" className="text-aurora-cyan hover:text-aurora-purple hover:underline font-semibold">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
