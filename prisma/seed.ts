import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // Limpiar datos existentes
  await prisma.compartido.deleteMany()
  await prisma.auditoria.deleteMany()
  await prisma.publicacionEtiqueta.deleteMany()
  await prisma.etiqueta.deleteMany()
  await prisma.meGusta.deleteMany()
  await prisma.comentario.deleteMany()
  await prisma.publicacion.deleteMany()
  await prisma.usuario.deleteMany()

  // Crear usuarios
  const adminPassword = await bcrypt.hash('Admin123!', 12)
  const userPassword = await bcrypt.hash('User123!', 12)

  const admin = await prisma.usuario.create({
    data: {
      nombre: 'Administrador',
      email: 'admin@gmail.com',
      hashContrasena: adminPassword,
      rol: 'ADMIN',
      activo: true,
    }
  })

  const usuario1 = await prisma.usuario.create({
    data: {
      nombre: 'Juan Pérez',
      email: 'juan.perez@gmail.com',
      hashContrasena: userPassword,
      rol: 'USUARIO',
      activo: true,
    }
  })

  const usuario2 = await prisma.usuario.create({
    data: {
      nombre: 'María García',
      email: 'maria.garcia@gmail.com',
      hashContrasena: userPassword,
      rol: 'USUARIO',
      activo: true,
    }
  })

  const usuario3 = await prisma.usuario.create({
    data: {
      nombre: 'Carlos López',
      email: 'carlos.lopez@gmail.com',
      hashContrasena: userPassword,
      rol: 'USUARIO',
      activo: true,
    }
  })

  console.log('✅ Usuarios creados')

  // Crear etiquetas
  const etiquetas = await Promise.all([
    prisma.etiqueta.create({ data: { nombre: 'tecnología' } }),
    prisma.etiqueta.create({ data: { nombre: 'programación' } }),
    prisma.etiqueta.create({ data: { nombre: 'web' } }),
    prisma.etiqueta.create({ data: { nombre: 'javascript' } }),
    prisma.etiqueta.create({ data: { nombre: 'react' } }),
    prisma.etiqueta.create({ data: { nombre: 'nodejs' } }),
    prisma.etiqueta.create({ data: { nombre: 'tutorial' } }),
    prisma.etiqueta.create({ data: { nombre: 'principiante' } }),
    prisma.etiqueta.create({ data: { nombre: 'avanzado' } }),
    prisma.etiqueta.create({ data: { nombre: 'discusión' } }),
  ])

  console.log('✅ Etiquetas creadas')

  // Crear publicaciones
  const publicaciones = []

  const publicacion1 = await prisma.publicacion.create({
    data: {
      titulo: 'Introducción a React: Conceptos Fundamentales',
      slug: 'introduccion-react-conceptos-fundamentales',
      contenido: `
        <p>React es una biblioteca de JavaScript para construir interfaces de usuario. En este artículo, exploraremos los conceptos fundamentales que todo desarrollador debe conocer.</p>
        
        <h2>¿Qué es React?</h2>
        <p>React es una biblioteca desarrollada por Facebook que nos permite crear interfaces de usuario de manera declarativa y eficiente.</p>
        
        <h2>Componentes</h2>
        <p>Los componentes son la base de React. Son funciones o clases que retornan elementos JSX.</p>
        
        <h2>Props y State</h2>
        <p>Las props son datos que se pasan a los componentes, mientras que el state es el estado interno del componente.</p>
      `,
      estado: 'PUBLICADO',
      autorId: usuario1.id,
      visible: true,
    }
  })
  publicaciones.push(publicacion1)

  const publicacion2 = await prisma.publicacion.create({
    data: {
      titulo: 'Mejores Prácticas en Node.js para 2024',
      slug: 'mejores-practicas-nodejs-2024',
      contenido: `
        <p>Node.js sigue siendo una tecnología fundamental en el desarrollo backend. Aquí te comparto las mejores prácticas actualizadas.</p>
        
        <h2>Estructura de Proyecto</h2>
        <p>Organizar tu código de manera clara y escalable es fundamental para el mantenimiento a largo plazo.</p>
        
        <h2>Manejo de Errores</h2>
        <p>Implementar un manejo robusto de errores es crucial para aplicaciones en producción.</p>
        
        <h2>Seguridad</h2>
        <p>La seguridad debe ser una prioridad desde el inicio del desarrollo.</p>
      `,
      estado: 'PUBLICADO',
      autorId: usuario2.id,
      visible: true,
    }
  })
  publicaciones.push(publicacion2)

  const publicacion3 = await prisma.publicacion.create({
    data: {
      titulo: 'Tutorial: Creando tu Primera API REST',
      slug: 'tutorial-primera-api-rest',
      contenido: `
        <p>En este tutorial paso a paso, aprenderás a crear tu primera API REST usando Node.js y Express.</p>
        
        <h2>Configuración Inicial</h2>
        <p>Comenzaremos configurando nuestro entorno de desarrollo y las dependencias necesarias.</p>
        
        <h2>Definiendo Rutas</h2>
        <p>Las rutas son los endpoints de nuestra API que responderán a las peticiones HTTP.</p>
        
        <h2>Conectando a la Base de Datos</h2>
        <p>Integraremos una base de datos para persistir nuestros datos.</p>
      `,
      estado: 'PUBLICADO',
      autorId: usuario3.id,
      visible: true,
    }
  })
  publicaciones.push(publicacion3)

  // Crear más publicaciones
  for (let i = 4; i <= 10; i++) {
    const usuarios = [usuario1, usuario2, usuario3]
    const autorRandom = usuarios[Math.floor(Math.random() * usuarios.length)]
    
    const publicacion = await prisma.publicacion.create({
      data: {
        titulo: `Publicación de Ejemplo ${i}`,
        slug: `publicacion-ejemplo-${i}`,
        contenido: `
          <p>Esta es una publicación de ejemplo número ${i} para demostrar el funcionamiento del foro.</p>
          
          <p>Aquí puedes escribir contenido en HTML, incluyendo:</p>
          <ul>
            <li>Listas como esta</li>
            <li>Enlaces y referencias</li>
            <li>Texto en <strong>negrita</strong> y <em>cursiva</em></li>
          </ul>
          
          <p>El contenido se renderiza de forma segura gracias a la sanitización implementada.</p>
        `,
        estado: Math.random() > 0.3 ? 'PUBLICADO' : 'BORRADOR',
        autorId: autorRandom.id,
        visible: true,
      }
    })
    publicaciones.push(publicacion)
  }

  console.log('✅ Publicaciones creadas')

  // Asignar etiquetas a publicaciones
  await prisma.publicacionEtiqueta.createMany({
    data: [
      { publicacionId: publicacion1.id, etiquetaId: etiquetas[1].id }, // programación
      { publicacionId: publicacion1.id, etiquetaId: etiquetas[4].id }, // react
      { publicacionId: publicacion1.id, etiquetaId: etiquetas[6].id }, // tutorial
      { publicacionId: publicacion2.id, etiquetaId: etiquetas[5].id }, // nodejs
      { publicacionId: publicacion2.id, etiquetaId: etiquetas[8].id }, // avanzado
      { publicacionId: publicacion3.id, etiquetaId: etiquetas[6].id }, // tutorial
      { publicacionId: publicacion3.id, etiquetaId: etiquetas[7].id }, // principiante
      { publicacionId: publicacion3.id, etiquetaId: etiquetas[2].id }, // web
    ]
  })

  // Crear comentarios
  const comentarios = []
  for (const publicacion of publicaciones.slice(0, 5)) {
    for (let i = 0; i < Math.floor(Math.random() * 5) + 1; i++) {
      const usuarios = [usuario1, usuario2, usuario3, admin]
      const autorRandom = usuarios[Math.floor(Math.random() * usuarios.length)]
      
      const comentario = await prisma.comentario.create({
        data: {
          contenido: `Este es un comentario de ejemplo sobre la publicación "${publicacion.titulo}". Me parece muy interesante el tema tratado.`,
          autorId: autorRandom.id,
          publicacionId: publicacion.id,
          visible: true,
        }
      })
      comentarios.push(comentario)
    }
  }

  console.log('✅ Comentarios creados')

  // Crear "me gusta"
  for (const publicacion of publicaciones.slice(0, 7)) {
    const usuarios = [usuario1, usuario2, usuario3, admin]
    const numLikes = Math.floor(Math.random() * 4) + 1
    
    for (let i = 0; i < numLikes; i++) {
      const usuarioRandom = usuarios[i % usuarios.length]
      
      try {
        await prisma.meGusta.create({
          data: {
            usuarioId: usuarioRandom.id,
            publicacionId: publicacion.id,
          }
        })
      } catch (error) {
        // Ignorar duplicados
      }
    }
  }

  console.log('✅ Me gustas creados')

  // Crear registros de auditoría
  await prisma.auditoria.createMany({
    data: [
      {
        actorId: admin.id,
        accion: 'crear',
        entidad: 'usuario',
        entidadId: usuario1.id,
      },
      {
        actorId: admin.id,
        accion: 'crear',
        entidad: 'usuario',
        entidadId: usuario2.id,
      },
      {
        actorId: admin.id,
        accion: 'crear',
        entidad: 'usuario',
        entidadId: usuario3.id,
      },
      {
        actorId: usuario1.id,
        accion: 'crear',
        entidad: 'publicacion',
        entidadId: publicacion1.id,
      },
      {
        actorId: usuario2.id,
        accion: 'crear',
        entidad: 'publicacion',
        entidadId: publicacion2.id,
      },
    ]
  })

  console.log('✅ Registros de auditoría creados')

  console.log('🎉 Seed completado exitosamente!')
  console.log('\n📋 Usuarios creados:')
  console.log('- Admin: admin@demo.com / Admin123!')
  console.log('- Usuario 1: juan@demo.com / User123!')
  console.log('- Usuario 2: maria@demo.com / User123!')
  console.log('- Usuario 3: carlos@demo.com / User123!')
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
