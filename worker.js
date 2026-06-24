export default {
  async fetch(request, env) {
    const result = await env.DB.prepare(
      "SELECT datetime('now') as server_time"
    ).first();

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" }
    });
  }
};
