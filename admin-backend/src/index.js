const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-admin-password",
};

const ADMIN_PASSWORD = "HappyAdmin2024!";

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Bloquear peticiones de modificación que no tengan la contraseña correcta
    if (request.method !== "GET" && request.method !== "OPTIONS") {
      const pass = request.headers.get("x-admin-password");
      if (pass !== ADMIN_PASSWORD) {
        return new Response(JSON.stringify({ error: "Contraseña incorrecta o acceso denegado" }), {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (request.method === "GET" && path === "/productos") {
        const { results } = await env.DB.prepare("SELECT * FROM productos ORDER BY id ASC").all();
        return new Response(JSON.stringify(results), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      if (request.method === "POST" && path === "/productos") {
        const body = await request.json();
        
        const { results } = await env.DB.prepare("SELECT id FROM productos ORDER BY id ASC").all();
        let nextId = 1;
        for (let row of results) {
          if (row.id === nextId) {
            nextId++;
          } else {
            break;
          }
        }

        await env.DB.prepare(
          "INSERT INTO productos (id, nombre, descripcion, precio, imagen_url, categoria) VALUES (?, ?, ?, ?, ?, ?)"
        ).bind(nextId, body.nombre, body.descripcion, body.precio, body.imagen_url, body.categoria).run();

        return new Response(JSON.stringify({ message: "Producto agregado", id: nextId }), {
          status: 201,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      if (request.method === "PUT" && path === "/productos") {
        const body = await request.json();
        await env.DB.prepare(
          "UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, imagen_url = ?, categoria = ? WHERE id = ?"
        ).bind(body.nombre, body.descripcion, body.precio, body.imagen_url, body.categoria, body.id).run();

        return new Response(JSON.stringify({ message: "Producto actualizado" }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      if (request.method === "DELETE" && path === "/productos") {
        const body = await request.json();
        await env.DB.prepare("DELETE FROM productos WHERE id = ?").bind(body.id).run();

        return new Response(JSON.stringify({ message: "Producto eliminado" }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      // RUTAS DEL CALENDARIO DE FECHAS
      if (request.method === "GET" && path === "/fechas") {
        const { results } = await env.DB.prepare("SELECT * FROM fechas").all();
        return new Response(JSON.stringify(results), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      if (request.method === "PUT" && path === "/fechas") {
        const body = await request.json();
        // body debe tener { fecha: 'YYYY-MM-DD', estado: 'disponible' | 'proceso' | 'pagado' }
        if (body.estado === 'disponible') {
          // Si está disponible, borramos el registro para no llenar la base de datos de "disponibles"
          await env.DB.prepare("DELETE FROM fechas WHERE fecha = ?").bind(body.fecha).run();
        } else {
          // Insertar o actualizar (upsert) el estado
          await env.DB.prepare(
            "INSERT INTO fechas (fecha, estado) VALUES (?, ?) ON CONFLICT(fecha) DO UPDATE SET estado = excluded.estado"
          ).bind(body.fecha, body.estado).run();
        }
        
        return new Response(JSON.stringify({ message: "Fecha actualizada" }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      return new Response("Ruta no encontrada", { status: 404, headers: corsHeaders });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  },
};
