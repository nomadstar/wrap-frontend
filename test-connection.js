// test/testConnection.js
// Archivo simple para probar la conexión al backend

const API_URL = 'https://wrap-back-crawl-05c4908a33e4.herokuapp.com';
const API_KEY = '17ff88865c1b61d0ed9cdc665afdfa9a4fc60c6b6c05590a6461aead3e9843e7';

async function testConnection() {
  console.log('🧪 Probando conexión al backend...');
  console.log('📡 URL:', API_URL);
  
  try {
    // Probar endpoint básico
    const response = await fetch(`${API_URL}/`, {
      method: 'GET',
      headers: {
        'X-API-Key': API_KEY,
      },
    });
    
    console.log('📊 Status:', response.status);
    console.log('✅ Headers:', [...response.headers.entries()]);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📄 Respuesta:', data);
      return true;
    } else {
      console.error('❌ Error HTTP:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('💥 Error de red:', error);
    return false;
  }
}

// Probar creación de usuario
async function testUserCreation() {
  console.log('\n🧪 Probando creación de usuario...');
  
  const testUser = {
    wallet_address: '0x742D35cC6EAb4DC4b6D9E5C90e86F79F6AC0c39a',
    wallet_type: 'ethereum',
    username: 'test_frontend',
    email: 'test@frontend.com'
  };
  
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify(testUser),
    });
    
    console.log('📊 Status creación:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Usuario creado:', data);
      return true;
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Error creación:', response.status, errorData);
      return false;
    }
  } catch (error) {
    console.error('💥 Error de red en creación:', error);
    return false;
  }
}

// Ejecutar pruebas
async function runTests() {
  console.log('🚀 Iniciando pruebas de conexión...\n');
  
  const connection = await testConnection();
  if (connection) {
    await testUserCreation();
  }
  
  console.log('\n🏁 Pruebas completadas');
}

// Solo ejecutar si es llamado directamente
if (typeof window !== 'undefined') {
  // En el navegador
  runTests();
} else if (typeof module !== 'undefined' && module.exports) {
  // En Node.js
  module.exports = { testConnection, testUserCreation, runTests };
}
