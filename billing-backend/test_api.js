const testAPI = async () => {
  try {
    const res = await fetch("https://billing-backend-5lkf.onrender.com/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Username": "vijaya" },
      body: JSON.stringify({
        name: "Test Vijaya Customer",
        phone: "1234567890",
        address: "Test Address"
      })
    });
    const data = await res.json();
    console.log("Created:", data);
  } catch (err) {
    console.error(err.message);
  }
};

testAPI();
