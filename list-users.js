// Script para ver usuarios existentes
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listUsers() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log('Usuarios encontrados:');
    console.log('='.repeat(80));

    if (data.length === 0) {
      console.log('No hay usuarios en la tabla profiles');
      console.log('\n¿Deseas crear un administrador?');
      return;
    }

    data.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email || 'N/A'}`);
      console.log(`   Nombre: ${user.full_name || 'N/A'}`);
      console.log(`   Rol: ${user.role || 'N/A'}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Creado: ${user.created_at}`);
      console.log('-'.repeat(40));
    });

    console.log('\nPara convertir un usuario en administrador, ejecuta:');
    console.log('UPDATE profiles SET role = \'admin\' WHERE email = \'email_del_usuario\';');

  } catch (err) {
    console.error('Error inesperado:', err);
  }
}

listUsers();