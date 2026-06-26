export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ✅ CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // ✅ Preflight request
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // ✅ POST /api/booking
    if (url.pathname === "/api/booking" && request.method === "POST") {
      try {
        const body = await request.json();

        await env.DB.prepare(`
          INSERT INTO bookings (
            name, email, phone, room, room_number,
            checkin, checkout, total_amount,
            payment_method, transaction_id
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          body.name,
          body.email,
          body.phone,
          body.room,
          body.roomNumber,
          body.checkin,
          body.checkout,
          body.totalAmount,
          body.paymentMethod,
          body.transactionId
        ).run();

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

      } catch (err) {
        return new Response(
          JSON.stringify({ success: false, message: err.message }),
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // ❌ Anything else
    return new Response(
      JSON.stringify({ success: false, message: "Not Found" }),
      { status: 404, headers: corsHeaders }
    );
  }
};
