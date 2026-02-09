import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/auth';
import { generateCuteUsername } from '@/utils/usernameGenerator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import UsernamePicker from '@/components/UsernamePicker';

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showUsernamePicker, setShowUsernamePicker] = useState(false);

  // Generate cute username on component mount
  useEffect(() => {
    const cuteUsername = generateCuteUsername();
    setFormData(prev => ({ ...prev, displayName: cuteUsername }));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const regenerateDisplayName = () => {
    const newName = generateCuteUsername();
    setFormData(prev => ({ ...prev, displayName: newName }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.signup({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName
      });

      login(response.user, response.token);
      navigate('/events');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-arctic-deepest via-arctic-deep to-arctic-mid p-4">
      <Card className="w-full max-w-md bg-arctic-deep/90 backdrop-blur-md shadow-2xl border border-aurora-cyan/30">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-display font-bold text-ice-white">Create Account</CardTitle>
          <CardDescription className="text-ice-gray font-body">Join Gatherly and start connecting 🐧</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4 bg-aurora-pink/10 border-aurora-pink/30 text-ice-white">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Cute Display Name */}
            <div className="space-y-2 p-3 bg-gradient-to-r from-blue-50 to-sky-light rounded-lg border border-blue-300">
              <div className="flex items-center justify-between">
                <Label htmlFor="displayName" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Your Cute Display Name
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={regenerateDisplayName}
                  className="text-xs"
                >
                  🔄 Regenerate
                </Button>
              </div>
              <Input
                id="displayName"
                name="displayName"
                type="text"
                value={formData.displayName}
                onChange={handleChange}
                className="bg-white/80"
                required
              />
              <p className="text-xs text-gray-500">
                This will be your unique cute name! You can change it later.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-ice-white">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                required
                minLength={3}
                className="bg-arctic-mid border-ice-dark/30 text-ice-white placeholder:text-ice-dark font-mono"
              />

              {/* Username Picker Toggle */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowUsernamePicker(!showUsernamePicker)}
                className="w-full border-aurora-cyan/30 hover:border-aurora-cyan hover:bg-aurora-cyan/10 text-aurora-cyan"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Cool Username
                {showUsernamePicker ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
              </Button>

              {showUsernamePicker && (
                <UsernamePicker
                  currentUsername={formData.username}
                  onSelect={(username) => {
                    setFormData({ ...formData, username });
                  }}
                />
              )}
            </div>

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
                minLength={6}
                className="bg-arctic-mid border-ice-dark/30 text-ice-white placeholder:text-ice-dark"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-ice-white">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="bg-arctic-mid border-ice-dark/30 text-ice-white placeholder:text-ice-dark"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-aurora-cyan to-aurora-purple hover:shadow-lg hover:shadow-aurora-cyan/50 text-white font-semibold"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-ice-gray">
            Already have an account?{' '}
            <Link to="/login" className="text-aurora-cyan hover:text-aurora-purple hover:underline font-semibold">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
