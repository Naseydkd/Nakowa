const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Tentative de connexion à la base de données...');
    
    // Test de connexion
    await prisma.$connect();
    console.log('✅ Connexion réussie à PostgreSQL !');
    
    // Vérifier si les tables existent
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `;
    
    console.log('📋 Tables trouvées :');
    tables.forEach(table => console.log(`  - ${table.table_name}`));
    
    // Test spécifique pour la table services
    try {
      const serviceCount = await prisma.service.count();
      console.log(`📊 Nombre de services dans la DB : ${serviceCount}`);
      
      if (serviceCount > 0) {
        const firstService = await prisma.service.findFirst();
        console.log('🎯 Premier service trouvé :', firstService.nom);
      }
    } catch (error) {
      console.log('⚠️  Table services pas encore créée ou vide');
    }
    
  } catch (error) {
    console.error('❌ Erreur de connexion :', error.message);
    
    if (error.message.includes('database "nakowa_dev" does not exist')) {
      console.log('💡 Solution : Créer la base de données avec :');
      console.log('   createdb nakowa_dev');
    }
    
    if (error.message.includes('password authentication failed')) {
      console.log('💡 Solution : Vérifier les credentials dans le .env');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();