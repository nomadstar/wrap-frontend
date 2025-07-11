import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Configuración de la base de datos
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');

    if (!walletAddress) {
        return NextResponse.json(
            { error: 'Wallet address is required' },
            { status: 400 }
        );
    }

    try {
        const client = await pool.connect();

        // Consultar la tabla admins para verificar si la wallet es admin
        const query = `
      SELECT 
        id,
        wallet_address,
        email,
        role,
        permissions,
        is_active
      FROM admins 
      WHERE wallet_address = $1 AND is_active = true
    `;

        const result = await client.query(query, [walletAddress.toLowerCase()]);
        client.release();

        if (result.rows.length > 0) {
            const admin = result.rows[0];
            return NextResponse.json({
                isAdmin: true,
                adminData: {
                    id: admin.id,
                    walletAddress: admin.wallet_address,
                    email: admin.email,
                    role: admin.role,
                    permissions: admin.permissions,
                    isActive: admin.is_active
                }
            });
        } else {
            return NextResponse.json({
                isAdmin: false,
                adminData: null
            });
        }
    } catch (error) {
        console.error('Error checking admin status:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}