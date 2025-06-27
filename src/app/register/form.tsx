import React from 'react';

const RegisterForm: React.FC = () => {
    return (
        <form>
            <div>
                <label htmlFor="firstName">First Name:</label>
                <input type="text" id="firstName" name="firstName" required />
            </div>
            <div>
                <label htmlFor="lastName">Last Name:</label>
                <input type="text" id="lastName" name="lastName" required />
            </div>
            <div>
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" name="email" required />
            </div>
            <div>
                <label htmlFor="password">Password:</label>
                <input type="password" id="password" name="password" required />
            </div>
            <div>
                <label htmlFor="address">Address:</label>
                <input type="text" id="address" name="address" required />
            </div>
            <div>
                <label htmlFor="phoneNumber">Phone Number:</label>
                <input type="tel" id="phoneNumber" name="phoneNumber" required />
            </div>
            <div>
                <label htmlFor="dateOfBirth">Date of Birth:</label>
                <input type="date" id="dateOfBirth" name="dateOfBirth" required />
            </div>
            <div>
                <label htmlFor="identification">Identification Number:</label>
                <input type="text" id="identification" name="identification" required />
            </div>
            <button type="button">
                Link Wallet
            </button>
            <button type="submit">Register</button>
        </form>
    );
};

export default RegisterForm;