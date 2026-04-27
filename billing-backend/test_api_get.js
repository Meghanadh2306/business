const testAPI = async () => {
  try {
    const res2 = await fetch("https://billing-backend-5lkf.onrender.com/api/customers", {
      headers: { "X-Username": "omkarsai" }
    });
    const data2 = await res2.json();
    console.log("Omkarsai customers:", data2);
  } catch (err) {
    console.error(err.message);
  }
};

testAPI();
