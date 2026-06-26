export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ===== CORS HEADERS =====
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // ===== HANDLE PREFLIGHT =====
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // ===== CREATE TABLE ON FIRST RUN =====
    await env.DB.exec(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        phone TEXT,
        room TEXT,
        roomNumber TEXT,
        checkin TEXT,
        checkout TEXT,
        totalAmount REAL,
        paymentMethod TEXT,
        transactionId TEXT,
        bankReceiptUploaded INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ===== POST: CREATE BOOKING =====
    if (url.pathname === "/api/booking" && request.method === "POST") {
      try {
        const body = await request.json();

        if (!body.name || !body.email || !body.room || !body.checkin) {
          return new Response(
            JSON.stringify({ success: false, message: "Missing required fields" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        await env.DB.prepare(
          `INSERT INTO bookings
           (name, email, phone, room, roomNumber, checkin, checkout, totalAmount, paymentMethod, transactionId, bankReceiptUploaded)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          body.name,
          body.email,
          body.phone || "",
          body.room,
          body.roomNumber || "",
          body.checkin,
          body.checkout || "",
          body.totalAmount || 0,
          body.paymentMethod || "",
          body.transactionId || "",
          body.bankReceiptUploaded ? 1 : 0
        ).run();

        return new Response(
          JSON.stringify({ success: true, message: "Booking saved successfully" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

      } catch (err) {
        return new Response(
          JSON.stringify({ success: false, message: err.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // ===== GET: LIST BOOKINGS =====
    if (url.pathname === "/api/bookings" && request.method === "GET") {
      try {
        const results = await env.DB.prepare(
          "SELECT * FROM bookings ORDER BY created_at DESC"
        ).all();

        return new Response(
          JSON.stringify({ success: true, data: results.results }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

      } catch (err) {
        return new Response(
          JSON.stringify({ success: false, message: err.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // ===== DEFAULT =====
    return new Response(
      JSON.stringify({ success: false, message: "Route not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};
