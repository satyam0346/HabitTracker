import { createContext, useContext, useEffect, useState } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile,
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { createUserProfile } from '../firebase/firestore';

const AuthContext = createContext(null);

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, u => {
            setUser(u);
            setLoading(false);
        });
        return unsub;
    }, []);

    const signup = async (email, password, displayName) => {
        const { user: u } = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(u, { displayName });
        await createUserProfile(u.uid, { email, displayName });
        return u;
    };

    const login = (email, password) =>
        signInWithEmailAndPassword(auth, email, password);

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        const { user: u } = await signInWithPopup(auth, provider);
        await createUserProfile(u.uid, {
            email: u.email,
            displayName: u.displayName,
        });
        return u;
    };

    const logout = () => signOut(auth);

    // Guest mode using localStorage
    const [guestMode, setGuestMode] = useState(false);
    const enterGuestMode = () => {
        setGuestMode(true);
        localStorage.setItem('guestMode', 'true');
    };
    const exitGuestMode = () => {
        setGuestMode(false);
        localStorage.removeItem('guestMode');
    };

    useEffect(() => {
        if (localStorage.getItem('guestMode') === 'true') setGuestMode(true);
    }, []);

    const value = {
        user,
        loading,
        signup,
        login,
        loginWithGoogle,
        logout,
        guestMode,
        enterGuestMode,
        exitGuestMode,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
