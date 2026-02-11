const API_URL = 'http://localhost:5002/api';

async function testBackend() {
    try {
        // 1. Signup/Login to get token
        const username = 'testuser_' + Date.now();
        console.log('Creating user:', username);

        const authRes = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                email: `${username}@example.com`,
                password: 'password123',
                displayName: 'Test User'
            })
        });

        const authData = await authRes.json();
        if (!authRes.ok) throw new Error(JSON.stringify(authData));

        const token = authData.token;
        console.log('Got token:', token ? 'Yes' : 'No');

        // 2. Test Get Profile (Self)
        console.log('Testing GET /api/profile...');
        const profileRes = await fetch(`${API_URL}/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const profileData = await profileRes.json();
        if (!profileRes.ok) {
            console.error('❌ Profile Fetch Failed:', profileRes.status, profileData);
        } else {
            console.log('✅ Profile Fetched Successfully:', profileData.user.username);
        }

        // 3. Create Event
        const eventData = {
            title: 'Test Event',
            description: 'This is a test event description',
            date: new Date().toISOString(),
            location: 'New York',
            maxAttendees: 50,
            category: 'concert'
        };

        console.log('Sending event data:', eventData);

        const eventRes = await fetch(`${API_URL}/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(eventData)
        });

        const eventResponseData = await eventRes.json();

        if (!eventRes.ok) {
            console.error('❌ Event creation failed!');
            console.error('Status:', eventRes.status);
            console.error('Response:', eventResponseData);
        } else {
            console.log('✅ Event created successfully:', eventResponseData);
        }

    } catch (error) {
        console.error('Test failed:', error);
    }
}

testBackend();
