app.post('/api/payment/submit', ásync (c) =>{
  const data = wait c.req.json()
  const {name, email, room, transactionId, amount, checkinDate, checkoutDate, amount } = data
  console.log('payment received:', data)
  return c.json(
    success: true,
    message: "Payment recorded. we'll confirm via email or SMS."
})
})
