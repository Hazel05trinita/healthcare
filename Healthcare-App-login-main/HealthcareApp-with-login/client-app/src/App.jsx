import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState } from 'react';
import Login from './Login';      // Import the Login component (Step 4)
import Register from './Register'; // Import the Register component (Step 3)
import MainApp from './MainApp';  // Import the CRUD component (Step 1)

function App() {
    // State to track if the user is logged in
    const [user, setUser] = useState(null); 
    // State to switch between Login and Register views
    const [currentView, setCurrentView] = useState('login'); 

    // Function called by Login.jsx upon successful authentication
    const handleLoginSuccess = (userData) => {
        setUser(userData); // Set the user data to show the app is logged in
    };

    // Function called by MainApp.jsx to sign the user out
    const handleLogout = () => {
        setUser(null); // Clear the user data
        setCurrentView('login'); // Go back to the login screen
    };

    // --- Conditional Rendering (The Gatekeeper Logic) ---

    if (user) {
        // CONDITION 1: If logged in (user is not null), show the main CRUD app
        return <MainApp user={user} onLogout={handleLogout} />;
    } 
    
    // CONDITION 2: If not logged in, show either the Login or Register screen
    return (
        <div className="container p-3 mt-4">
            <h1 className="text-center mb-5">Healthcare Prescription App</h1>
            
            {/* Renders Login or Register based on the currentView state */}
            {currentView === 'login' ? (
                <Login 
                    onLoginSuccess={handleLoginSuccess}
                    onSwitchToRegister={() => setCurrentView('register')}
                />
            ) : (
                <Register
                    onSwitchToLogin={() => setCurrentView('login')}
                />
            )}
        </div>
    );
}

export default App;