import React from 'react';
import { User, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';

interface UserCreationStatusProps {
    isCreatingUser: boolean;
    userCreated: boolean;
    isRedirecting: boolean;
    error?: string;
}

export const UserCreationStatus: React.FC<UserCreationStatusProps> = ({
    isCreatingUser,
    userCreated,
    isRedirecting,
    error
}) => {
    if (error) {
        return (
            <div className="text-center p-6 bg-gradient-to-r from-red-50 to-red-100 rounded-2xl border border-red-200">
                <div className="flex items-center justify-center mb-3">
                    <AlertCircle className="w-6 h-6 text-red-600 mr-2" />
                    <span className="font-semibold text-red-800">Error Creating Account</span>
                </div>
                <p className="text-sm text-red-700">{error}</p>
            </div>
        );
    }

    if (isCreatingUser) {
        return (
            <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
                <div className="flex items-center justify-center mb-3">
                    <User className="w-6 h-6 text-blue-600 mr-2 animate-pulse" />
                    <span className="font-semibold text-blue-800">Creating Account...</span>
                </div>
                <p className="text-sm text-blue-700">
                    Setting up your account in our database...
                </p>
            </div>
        );
    }

    if (userCreated && isRedirecting) {
        return (
            <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                <div className="flex items-center justify-center mb-3">
                    <RefreshCw className="w-6 h-6 text-green-600 mr-2 animate-spin" />
                    <span className="font-semibold text-green-800">
                        Redirecting to Dashboard...
                    </span>
                </div>
                <p className="text-sm text-gray-600">
                    Please wait while we redirect you to your dashboard.
                </p>
                <div className="mt-2 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-xs text-green-700">Account ready!</span>
                </div>
            </div>
        );
    }

    if (userCreated) {
        return (
            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <div className="flex items-center justify-center mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="font-semibold text-green-800">Account Created!</span>
                </div>
                <p className="text-sm text-green-700">
                    Your account has been successfully created.
                </p>
            </div>
        );
    }

    return null;
};

export default UserCreationStatus;
