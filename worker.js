const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    /* ================= STATUS ================= */
    if (url.pathname === "/api/status") {
      const now = await env.DB.prepare(
        "SELECT datetime('now') AS server_time"
      ).first();

      return new Response(JSON.stringify({
        success: true,
        service: "REMS HOTEL API",
        time: now.server_time
      }), {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }

    /* ================= CREATE BOOKING ================= */
    if (url.pathname === "/api/bookings" && request.method === "POST") {
      try {
        const contentType = request.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          return new Response(JSON.stringify({
            success: false,
            message: "Content-Type must be application/json"
          }), {
            status: 415,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          });
        }

        const data = await request.json();

        // Insert booking into D1
        const result = await env.DB.prepare(`
          INSERT INTO bookings (
            name, email, phone,
            room, room_number,
            checkin, checkout,
            total_amount, payment_method,
            created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `).bind(
          data.name || "",
          data.email || "",
          data.phone || "",
          data.room || "",
          data.number || "",
          data.checkin || "",
          data.checkout || "",
          data.totalAmount || 0,
          data.paymentMethod || ""
        ).run();

        return new Response(JSON.stringify({
          success: true,
          id: result.meta.last_row_id
        }), {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });

      } catch (err) {
        return new Response(JSON.stringify({
          success: false,
          message: err.message || "Invalid request"
        }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }
    }

    /* ================= FALLBACK ================= */
    return new Response(JSON.stringify({
      success: false,
      message: "Not Found"
    }), {
      status: 404,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  }
};
