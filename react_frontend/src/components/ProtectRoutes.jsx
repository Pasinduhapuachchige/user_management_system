import React from 'react';
import { checkAuth } from '../apis/checkauth.api';
import { Navigate } from 'react-router-dom';
import LoadingScreen from './LoadingScreen';
import AuthErrorModal from './AuthErrorModel';
import { useUserStore } from '../tools/user.zustand';
import { logoutApi } from '../apis/logout.api';

const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

function ProtectRoutes({ children }) {
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    const [showErrorModal, setShowErrorModal] = React.useState(false);
    const [errorDetails, setErrorDetails] = React.useState({
        code: null,
        message: null
    });
    const { user, setUser } = useUserStore();

    const handleAuthError = (error) => {
        console.error('Authentication error:', error);
        console.log('Error response:', error.response?.data);

        // Clear user data immediately (assuming setUser can handle null/undefined)
        setUser(null);
        setIsAuthenticated(false);

        // Extract error details from Axios error response
        let errorCode = null;
        let errorMessage = 'Authentication failed';

        if (error.response?.data) {
            const { error: code, message } = error.response.data;
            errorCode = code;
            errorMessage = message || errorMessage;
            console.log('Extracted error code:', errorCode, 'message:', errorMessage);
        } else if (error.message) {
            errorMessage = error.message;
        }

        // Set error details and show modal
        setErrorDetails({
            code: errorCode,
            message: errorMessage
        });

        setShowErrorModal(true);
        setIsLoading(false);
    };

    const handleModalTimeout = () => {
        setShowErrorModal(false);
        // The Navigate component will handle the redirect
    };

    // ── Auth check on mount ──
    React.useEffect(() => {
        (async () => {
            try {
                const res = await checkAuth();

                if (res.success === true) {
                    setIsAuthenticated(true);
                    setUser(res.user);
                    console.log('User authenticated:', res.user);
                    setIsLoading(false);
                } else {
                    // Handle case where API returns success: false
                    handleAuthError({
                        response: {
                            data: {
                                error: res.error,
                                message: res.message
                            }
                        }
                    });
                    return;
                }
            } catch (error) {
                console.log('Caught error in useEffect:', error);
                handleAuthError(error);
                return;
            }
        })();
    }, [setUser]);

    // ── Inactivity auto-logout (5 minutes) ──
    React.useEffect(() => {
        if (!isAuthenticated) return;

        let timeoutId;

        const handleAutoLogout = async () => {
            console.log('User inactive for 5 minutes — logging out automatically.');
            try {
                await logoutApi();
            } catch (err) {
                console.error('Auto-logout error:', err);
                window.location.href = '/login';
            }
        };

        const resetTimer = () => {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(handleAutoLogout, INACTIVITY_TIMEOUT_MS);
        };

        // Start the timer immediately
        resetTimer();

        // Reset on any user activity
        const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart', 'click'];
        ACTIVITY_EVENTS.forEach(evt => window.addEventListener(evt, resetTimer));

        // Cleanup on unmount or when auth state changes
        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            ACTIVITY_EVENTS.forEach(evt => window.removeEventListener(evt, resetTimer));
        };
    }, [isAuthenticated]);

    // Show loading screen during initial authentication check
    if (isLoading && !showErrorModal) {
        return <LoadingScreen isLoading={true} />;
    }

    // Show error modal when authentication fails
    if (showErrorModal) {
        return (
            <>
                <LoadingScreen isLoading={true} />
                <AuthErrorModal
                    isOpen={showErrorModal}
                    errorCode={errorDetails.code}
                    errorMessage={errorDetails.message}
                    onTimeout={handleModalTimeout}
                />
            </>
        );
    }

    // Navigate to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Render protected content
    return children;
}

export default ProtectRoutes;